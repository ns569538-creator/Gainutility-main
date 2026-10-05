/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized variants for Blog Articles 13-16 (Developer / CSS category).
 * Supported locales: pt-br, id, es-mx, es-co, de, fr, it.
 */

import type { LocalizedBlogArticle } from "../../blog/blogData";
import type { LocaleCode } from "../slugs";

export const DESIGN_DEV_ARTICLES_LOCALIZED: Record<string, Partial<Record<LocaleCode, LocalizedBlogArticle>>> = {
  "box-shadow-values-real-websites": {
    "pt-br": {
      title: "Quais valores de box-shadow os sites reais realmente usam",
      description: "Medimos sombras em produção nos 1.000 maiores sites da web. A maioria das sombras reais é pequena, neutra e com deslocamento vertical mínimo.",
      readingTime: "7 min de leitura",
      tags: ["css","box-shadow","design system","desenvolvimento web"],
      categoryLabel: "Desenvolvedor",
      quickAnswer: "Sombras reais de produção são pequenas e neutras. O deslocamento vertical mediano é inferior a 1 px, o desfoque fica em um único dígito em 75% dos casos, quase metade das camadas tem y=0 e as cores são pretas com alfa de 0,3 ou menos.",
      keyTakeaway: "Sombras reais em produção são sutis e neutras: desloque Y entre 1–4 px, mantenha o desfoque em um único dígito, X em 0 e cor preta acromática com baixo alfa.",
      toolCta: {"label":"Copie um valor medido de produção com o Gerador de Box Shadow.","toolId":"box-shadow-generator"},
      seoTitle: "Valores reais de box-shadow usados nos maiores sites | GainUtility",
      seoDescription: "Análise real de CSS box-shadow em 1.000 sites líderes: offsets, raios de desfoque, cores e melhores práticas para interfaces modernas.",
      content: [
        {
                "paragraphs": [
                        "If you write CSS, you write box-shadow eventually — and you usually guess what looks right. This time the values are measured, not guessed. We took the top 1,000 domains from the Tranco list (pinned 2026-09-15), downloaded each homepage, parsed every box-shadow declaration in its shipped CSS, and counted what's actually in production.",
                        "The whole pipeline is reproducible: the list is pinned, the crawler and analyzer scripts live in this repo, and every measured value per site is downloadable as a CSV. No number in this article is hand-picked to make a point."
                ],
                "figure": "box-shadow-headline-stats"
        },
        {
                "heading": "How the measurement works",
                "paragraphs": [
                        "Each site's homepage was fetched over https with http fallback. From the served HTML we kept inline <style> blocks and linked stylesheets, up to 30 sheets per site or 8 MB per sheet, following inline @import one level deep. Sheet contents were parsed with the CSS tree parser; only box-shadow and the -webkit-box-shadow vendor twin were extracted.",
                        "Of 1,000 sampled domains, 533 served a homepage we could parse. The rest are accounted for, not hidden: 222 domains had no DNS record, 85 answered with an HTML bot-wall (403), 20 failed TLS hostname checks, 47 timed out, and the remainder split across 4xx/5xx statuses, connection resets, and certificate errors. Note the list includes shell-style pages and app entry points with no CSS at all — 28 of the 533 sites shipped no stylesheet to parse.",
                        "A declaration was counted when it appeared in the sheet. Identical -webkit-box-shadow and box-shadow pairs on the same rule collapse to one entry (3,531 such vendor twins), and values were deduplicated per site before the distinct-value counts. Shadows written entirely by JavaScript are out of scope by design.",
                        "The headline numbers below are px-space measurements: layers whose offsets, blur, and spread are all in px, laid out by the browser default font-size of 16px for typographic units (7 layers used rem and are reported separately). 3,216 declarations using other non-px units were measured for truthfulness but excluded from the pixel statistics."
                ]
        },
        {
                "heading": "Almost every top site ships a real shadow",
                "paragraphs": [
                        "427 of 533 parsed sites — 80.1% — ship at least one resolvable box-shadow on the homepage. 'none' exists too: 390 sites reset the effect somewhere, and with 5,301 none declarations it is the single most common value, ahead of every literal shadow. That reset is normal: frameworks null out a default box-shadow before adding their own, and some effects you see on the page come from elements the type selector misses.",
                        "From the 533 sites we collected 33,438 raw declarations, collapsing to 29,907 after dedupe and the vendor-twin merge. The distinct value set is 9,168 strings, and 5,596 of those are fully usable px values (or implemented in px after resolving their custom properties)."
                ]
        },
        {
                "heading": "Where the shadow sits",
                "paragraphs": [
                        "Site shadows are anchored to the box: 93.1% of the 21,887 measured layers use an X offset of exactly 0. Nothing drifts sideways in production CSS — even the most elaborate framework tokens keep X pinned.",
                        "Y is a real choice with two modes. 48.5% of layers sit exactly at y=0, and 50.2% push down by a small amount — the 75th percentile vertical offset is 3px. Upward shadows, the glow-below look, are a rounding error at 1.3% of layers. If you color an element but the background of the page is what should glow, write negative y — otherwise site data says: down a little, or straight down."
                ],
                "figure": "box-shadow-y-offset"
        },
        {
                "heading": "The blur is a lot smaller than the demos",
                "paragraphs": [
                        "Starter-kit demos blur at 10–25px. Production does not: 39.8% of layers ship blur 0 — those are the hard edges of focus rings and thin underlines — and among soft shadows the median blur is 3px, with the 75th percentile at 10px and the 90th at 24px.",
                        "The blur and the y-offset move together: when a site softens a shadow, it does so with a compact radius, not a fog bank. Values past ~40px blur exist but are the top of the tail."
                ],
                "figure": "box-shadow-blur"
        },
        {
                "heading": "Spread, inset, and the focus ring pattern",
                "paragraphs": [
                        "Spread defaults to none: 69.7% of layers carry spread 0. Positive spread (24%) mostly manufactures hard borders — the ring look — while negative spread (6.4%) shrinks the shadow to hug the box edge. Only 12.7% of layers are inset, and those cluster in a recognizable family: top-INSET pressed-button styles such as the Bootstrap classic inset 0 3px 5px rgba(0,0,0,.125).",
                        "What you actually see in the top values is the ability of spread to fake a border. The two most-shipped literal shadows in the whole sample are focus rings: 0 0 0 2px #fff (27 sites) and inset 0 0 0 2px #fff (18 sites) — white rings that read as borders without a border."
                ],
                "figure": "box-shadow-spread-inset"
        },
        {
                "heading": "Color: neutral, almost never opaque",
                "paragraphs": [
                        "The palette reads as one color: black at low opacity. 73.8% of measured layers are achromatic, and 74.9% have alpha at 0.3 or below, with the busiest bands at near-zero alpha (the largest single bucket is at or below 0.05) and at 0.1–0.15. Exactly-opaque shadows are rare — 21.3% of layers — and even those are mostly rings and utility borders, not depth shadows.",
                        "The syntax split is now hex-first: 11,453 layers (52.3%) write their color as hex such as #0000001a, and 9,585 (43.8%) as rgba(). The hex-in-alpha form carries the Tailwind token stream; HSL and named colors are negligible. Browsers default an omitted color to currentcolor, and that shows up too — 0.5% of layers lean on the default."
                ],
                "figure": "box-shadow-alpha"
        },
        {
                "heading": "One shadow, not a stack",
                "paragraphs": [
                        "A single layer is the default: 73.5% of the 14,517 shadowed declarations we could resolve use exactly one layer. Two layers cover 14.3%, and three or more just 12.2%. The stacks that do exist are token-driven, not art direction — the count climbs at 5–6 layers because Tailwind's ring utilities ship an inset-shadow plus a ring-offset-shadow plus a ring-shadow and their defaults as separate layers.",
                        "The tail is real but tame: one declaration reached 60 layers and another 142, both framework-table flowers that effectively render as archipelagos of nearly invisible rings."
                ],
                "figure": "box-shadow-layers"
        },
        {
                "heading": "The most-shipped values",
                "paragraphs": [
                        "This table ranks values by how many of the 533 sites ship them. The var() bundles are Tailwind's ring set and Bootstrap's button focus; the literals are dominated by ring-style hard shadows and small rgba drops. Material Design's canonical three-layer stack ships on 10 sites, and Google's two-layer variant on 9 — the stacks above are company templates, not the web-wide norm.",
                        "In the dataset, a row's 'declarations' column is how many times the value appeared across sheets; 'sites' is how many distinct domains placed it. kind records how we classified it: ok means the value stands as-is, global means it inherits meaning like inherit or unset, and varPartial marks values still holding a custom property after our resolution."
                ],
                "figure": "box-shadow-top-values"
        },
        {
                "heading": "A third of sites route shadows through custom properties",
                "paragraphs": [
                        "9,248 of the 33,438 raw declarations — 27.7% — reference a var(), and they spread wide: 260 of the 533 sites. Framework tokens are the reason: Tailwind accumulates five vars per ring declaration, and Bootstrap resolves its shades into --bs-*-box-shadow on the button.",
                        "We resolved 2,444 var() declarations to concrete pixels using only values the site itself defined: a same-rule definition first, then the sheet's :root, html, and universal selectors, then the fallback written inside the var() itself. Across those declarations, the variable lookups that succeeded split as 1,888 walked a root-level variable, 999 walked a rule-level variable, and 999 used the fallback inside the var(). A declaration can chain several lookups, so those three numbers add up to more lookups than declarations. The remainder stays honestly labelled var()-opaque — we do not guess at a site's runtime value."
                ]
        },
        {
                "heading": "The verdict table",
                "paragraphs": [
                        "Eight popular claims about box-shadow, graded against the measured set. 'Verdict' is GainUtility's conclusion — the numbers are yours to check."
                ],
                "table": {
                        "caption": "Six claims about box-shadow, graded against 21,887 measured layers.",
                        "columns": [
                                "Claim",
                                "What sites do (measured)",
                                "Verdict"
                        ],
                        "rows": [
                                [
                                        "Blur heavily for a soft modern look",
                                        "Median blur 3 px; 75th percentile 10 px; 39.8% of layers blur 0",
                                        "Only for big glows"
                                ],
                                [
                                        "Stack two–three layers like Material",
                                        "73.5% of declarations are a single layer; 3+ layers are 12.2%",
                                        "Only for design tokens"
                                ],
                                [
                                        "Offset down-and-right for depth",
                                        "Offset X is 0 on 93.1% of layers; Y is 0 on 48.5% and down on 50.2%",
                                        "Offset down — or not at all"
                                ],
                                [
                                        "Neutral color, low opacity",
                                        "73.8% achromatic; 74.9% at alpha ≤ 0.3; busiest bands ≤ 0.05 and 0.1–0.15",
                                        "Correct"
                                ],
                                [
                                        "Inset shadows are the depth staple",
                                        "Inset: 12.7% of layers, mostly pressed-button systems",
                                        "A deliberate choice, not the default"
                                ],
                                [
                                        "Upward (negative-Y) glow is common",
                                        "Negative Y offset: 1.3% of layers",
                                        "Rare"
                                ]
                        ]
                }
        },
        {
                "heading": "Limits you should know before quoting this",
                "list": [
                        "Coverage: 533 of 1,000 sampled domains resolved to a parseable homepage. The 467 gaps are enumerated in the methodology, not smoothed over — expect a western/heavy-platform skew in what remains.",
                        "Homepage only: marketing pages over-represent component kit CSS and under-represent the apps behind them. A <style>-less shell on the landing page (28 sites) says nothing about the product's tab styles.",
                        "Resolution: values resolved through custom properties only use what the site defined. A var() left opaque stays opaque — we count it under var()-opaque, excluded from px statistics.",
                        "Sheet caps: 30 sheets and 8 MB per sheet bound the crawl; styles layered in above those caps are absent. Served vs. computed: eases such as transition are out of scope, and a few effects are injected by JS toggling classes with id-less selectors we trimmed.",
                        "Date: the sample is a single day (list pinned 2026-09-15) and CSS moves; re-run the scripts for a fresh slice."
                ],
                "figure": "box-shadow-dataset"
        },
        {
                "heading": "How to use this in a design",
                "paragraphs": [
                        "Start every shadow from 0 0 (X and Y both zero). Move Y down by 1–4 px at most, keep blur in single digits for regular raises, and leave X alone. Write the color as black at an alpha between 0.08 and 0.3 — the measured sweet band — instead of a tint. Add a second layer only when a component token demands it, and treat inset like the pressed-state tool it is.",
                        "Two value shapes are worth adopting, because production validates them: the accessible focus ring 0 0 0 2px #fff (and its inset twin for filled backgrounds) — one of the most-shipped shadows in the whole sample — and the soft one-layer raise 0 1px 2px rgba(0,0,0,.1), which ships verbatim on sites like TinyURL and OpenStreetMap. The data ranks convention, not taste: a conventional shadow is what users read as normal, and that is the point of these defaults."
                ],
                "tool": {
                        "label": "Copie um valor medido de produção com o Gerador de Box Shadow.",
                        "toolId": "box-shadow-generator"
                }
        },
        {
                "pageLink": {
                        "label": "Ver o artigo completo sobre valores reais de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Ver o artigo completo sobre valores reais de box-shadow"
                }
        }
]
    },
    "es-mx": {
      title: "Qué valores de box-shadow usan realmente los sitios web reales",
      description: "Medimos sombras en producción en los 1,000 principales sitios web. La mayoría de sombras reales son pequeñas, neutras y con desplazamiento mínimo.",
      readingTime: "7 min de lectura",
      tags: ["css","box-shadow","design system","desarrollo web"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Las sombras de caja en producción real son pequeñas y neutras. El desplazamiento vertical mediano es inferior a 1 px, el desenfoque se mantiene en un dígito para el 75% de las capas y los colores son negros acromáticos con alfa ≤ 0.3.",
      keyTakeaway: "Las sombras en producción son sutiles y neutras: mantén Y entre 1 y 4 px, desenfoque de un solo dígito, X en 0 y negro neutro con alfa bajo.",
      toolCta: {"label":"Copia un valor de producción medido con el Generador de Box Shadow.","toolId":"box-shadow-generator"},
      seoTitle: "Valores reales de box-shadow en los principales sitios web | GainUtility",
      seoDescription: "Análisis de CSS box-shadow en 1,000 sitios web reales: desplazamientos, desenfoques, colores y prácticas recomendadas de diseño.",
      content: [
        {
                "paragraphs": [
                        "If you write CSS, you write box-shadow eventually — and you usually guess what looks right. This time the values are measured, not guessed. We took the top 1,000 domains from the Tranco list (pinned 2026-09-15), downloaded each homepage, parsed every box-shadow declaration in its shipped CSS, and counted what's actually in production.",
                        "The whole pipeline is reproducible: the list is pinned, the crawler and analyzer scripts live in this repo, and every measured value per site is downloadable as a CSV. No number in this article is hand-picked to make a point."
                ],
                "figure": "box-shadow-headline-stats"
        },
        {
                "heading": "How the measurement works",
                "paragraphs": [
                        "Each site's homepage was fetched over https with http fallback. From the served HTML we kept inline <style> blocks and linked stylesheets, up to 30 sheets per site or 8 MB per sheet, following inline @import one level deep. Sheet contents were parsed with the CSS tree parser; only box-shadow and the -webkit-box-shadow vendor twin were extracted.",
                        "Of 1,000 sampled domains, 533 served a homepage we could parse. The rest are accounted for, not hidden: 222 domains had no DNS record, 85 answered with an HTML bot-wall (403), 20 failed TLS hostname checks, 47 timed out, and the remainder split across 4xx/5xx statuses, connection resets, and certificate errors. Note the list includes shell-style pages and app entry points with no CSS at all — 28 of the 533 sites shipped no stylesheet to parse.",
                        "A declaration was counted when it appeared in the sheet. Identical -webkit-box-shadow and box-shadow pairs on the same rule collapse to one entry (3,531 such vendor twins), and values were deduplicated per site before the distinct-value counts. Shadows written entirely by JavaScript are out of scope by design.",
                        "The headline numbers below are px-space measurements: layers whose offsets, blur, and spread are all in px, laid out by the browser default font-size of 16px for typographic units (7 layers used rem and are reported separately). 3,216 declarations using other non-px units were measured for truthfulness but excluded from the pixel statistics."
                ]
        },
        {
                "heading": "Almost every top site ships a real shadow",
                "paragraphs": [
                        "427 of 533 parsed sites — 80.1% — ship at least one resolvable box-shadow on the homepage. 'none' exists too: 390 sites reset the effect somewhere, and with 5,301 none declarations it is the single most common value, ahead of every literal shadow. That reset is normal: frameworks null out a default box-shadow before adding their own, and some effects you see on the page come from elements the type selector misses.",
                        "From the 533 sites we collected 33,438 raw declarations, collapsing to 29,907 after dedupe and the vendor-twin merge. The distinct value set is 9,168 strings, and 5,596 of those are fully usable px values (or implemented in px after resolving their custom properties)."
                ]
        },
        {
                "heading": "Where the shadow sits",
                "paragraphs": [
                        "Site shadows are anchored to the box: 93.1% of the 21,887 measured layers use an X offset of exactly 0. Nothing drifts sideways in production CSS — even the most elaborate framework tokens keep X pinned.",
                        "Y is a real choice with two modes. 48.5% of layers sit exactly at y=0, and 50.2% push down by a small amount — the 75th percentile vertical offset is 3px. Upward shadows, the glow-below look, are a rounding error at 1.3% of layers. If you color an element but the background of the page is what should glow, write negative y — otherwise site data says: down a little, or straight down."
                ],
                "figure": "box-shadow-y-offset"
        },
        {
                "heading": "The blur is a lot smaller than the demos",
                "paragraphs": [
                        "Starter-kit demos blur at 10–25px. Production does not: 39.8% of layers ship blur 0 — those are the hard edges of focus rings and thin underlines — and among soft shadows the median blur is 3px, with the 75th percentile at 10px and the 90th at 24px.",
                        "The blur and the y-offset move together: when a site softens a shadow, it does so with a compact radius, not a fog bank. Values past ~40px blur exist but are the top of the tail."
                ],
                "figure": "box-shadow-blur"
        },
        {
                "heading": "Spread, inset, and the focus ring pattern",
                "paragraphs": [
                        "Spread defaults to none: 69.7% of layers carry spread 0. Positive spread (24%) mostly manufactures hard borders — the ring look — while negative spread (6.4%) shrinks the shadow to hug the box edge. Only 12.7% of layers are inset, and those cluster in a recognizable family: top-INSET pressed-button styles such as the Bootstrap classic inset 0 3px 5px rgba(0,0,0,.125).",
                        "What you actually see in the top values is the ability of spread to fake a border. The two most-shipped literal shadows in the whole sample are focus rings: 0 0 0 2px #fff (27 sites) and inset 0 0 0 2px #fff (18 sites) — white rings that read as borders without a border."
                ],
                "figure": "box-shadow-spread-inset"
        },
        {
                "heading": "Color: neutral, almost never opaque",
                "paragraphs": [
                        "The palette reads as one color: black at low opacity. 73.8% of measured layers are achromatic, and 74.9% have alpha at 0.3 or below, with the busiest bands at near-zero alpha (the largest single bucket is at or below 0.05) and at 0.1–0.15. Exactly-opaque shadows are rare — 21.3% of layers — and even those are mostly rings and utility borders, not depth shadows.",
                        "The syntax split is now hex-first: 11,453 layers (52.3%) write their color as hex such as #0000001a, and 9,585 (43.8%) as rgba(). The hex-in-alpha form carries the Tailwind token stream; HSL and named colors are negligible. Browsers default an omitted color to currentcolor, and that shows up too — 0.5% of layers lean on the default."
                ],
                "figure": "box-shadow-alpha"
        },
        {
                "heading": "One shadow, not a stack",
                "paragraphs": [
                        "A single layer is the default: 73.5% of the 14,517 shadowed declarations we could resolve use exactly one layer. Two layers cover 14.3%, and three or more just 12.2%. The stacks that do exist are token-driven, not art direction — the count climbs at 5–6 layers because Tailwind's ring utilities ship an inset-shadow plus a ring-offset-shadow plus a ring-shadow and their defaults as separate layers.",
                        "The tail is real but tame: one declaration reached 60 layers and another 142, both framework-table flowers that effectively render as archipelagos of nearly invisible rings."
                ],
                "figure": "box-shadow-layers"
        },
        {
                "heading": "The most-shipped values",
                "paragraphs": [
                        "This table ranks values by how many of the 533 sites ship them. The var() bundles are Tailwind's ring set and Bootstrap's button focus; the literals are dominated by ring-style hard shadows and small rgba drops. Material Design's canonical three-layer stack ships on 10 sites, and Google's two-layer variant on 9 — the stacks above are company templates, not the web-wide norm.",
                        "In the dataset, a row's 'declarations' column is how many times the value appeared across sheets; 'sites' is how many distinct domains placed it. kind records how we classified it: ok means the value stands as-is, global means it inherits meaning like inherit or unset, and varPartial marks values still holding a custom property after our resolution."
                ],
                "figure": "box-shadow-top-values"
        },
        {
                "heading": "A third of sites route shadows through custom properties",
                "paragraphs": [
                        "9,248 of the 33,438 raw declarations — 27.7% — reference a var(), and they spread wide: 260 of the 533 sites. Framework tokens are the reason: Tailwind accumulates five vars per ring declaration, and Bootstrap resolves its shades into --bs-*-box-shadow on the button.",
                        "We resolved 2,444 var() declarations to concrete pixels using only values the site itself defined: a same-rule definition first, then the sheet's :root, html, and universal selectors, then the fallback written inside the var() itself. Across those declarations, the variable lookups that succeeded split as 1,888 walked a root-level variable, 999 walked a rule-level variable, and 999 used the fallback inside the var(). A declaration can chain several lookups, so those three numbers add up to more lookups than declarations. The remainder stays honestly labelled var()-opaque — we do not guess at a site's runtime value."
                ]
        },
        {
                "heading": "The verdict table",
                "paragraphs": [
                        "Eight popular claims about box-shadow, graded against the measured set. 'Verdict' is GainUtility's conclusion — the numbers are yours to check."
                ],
                "table": {
                        "caption": "Six claims about box-shadow, graded against 21,887 measured layers.",
                        "columns": [
                                "Claim",
                                "What sites do (measured)",
                                "Verdict"
                        ],
                        "rows": [
                                [
                                        "Blur heavily for a soft modern look",
                                        "Median blur 3 px; 75th percentile 10 px; 39.8% of layers blur 0",
                                        "Only for big glows"
                                ],
                                [
                                        "Stack two–three layers like Material",
                                        "73.5% of declarations are a single layer; 3+ layers are 12.2%",
                                        "Only for design tokens"
                                ],
                                [
                                        "Offset down-and-right for depth",
                                        "Offset X is 0 on 93.1% of layers; Y is 0 on 48.5% and down on 50.2%",
                                        "Offset down — or not at all"
                                ],
                                [
                                        "Neutral color, low opacity",
                                        "73.8% achromatic; 74.9% at alpha ≤ 0.3; busiest bands ≤ 0.05 and 0.1–0.15",
                                        "Correct"
                                ],
                                [
                                        "Inset shadows are the depth staple",
                                        "Inset: 12.7% of layers, mostly pressed-button systems",
                                        "A deliberate choice, not the default"
                                ],
                                [
                                        "Upward (negative-Y) glow is common",
                                        "Negative Y offset: 1.3% of layers",
                                        "Rare"
                                ]
                        ]
                }
        },
        {
                "heading": "Limits you should know before quoting this",
                "list": [
                        "Coverage: 533 of 1,000 sampled domains resolved to a parseable homepage. The 467 gaps are enumerated in the methodology, not smoothed over — expect a western/heavy-platform skew in what remains.",
                        "Homepage only: marketing pages over-represent component kit CSS and under-represent the apps behind them. A <style>-less shell on the landing page (28 sites) says nothing about the product's tab styles.",
                        "Resolution: values resolved through custom properties only use what the site defined. A var() left opaque stays opaque — we count it under var()-opaque, excluded from px statistics.",
                        "Sheet caps: 30 sheets and 8 MB per sheet bound the crawl; styles layered in above those caps are absent. Served vs. computed: eases such as transition are out of scope, and a few effects are injected by JS toggling classes with id-less selectors we trimmed.",
                        "Date: the sample is a single day (list pinned 2026-09-15) and CSS moves; re-run the scripts for a fresh slice."
                ],
                "figure": "box-shadow-dataset"
        },
        {
                "heading": "How to use this in a design",
                "paragraphs": [
                        "Start every shadow from 0 0 (X and Y both zero). Move Y down by 1–4 px at most, keep blur in single digits for regular raises, and leave X alone. Write the color as black at an alpha between 0.08 and 0.3 — the measured sweet band — instead of a tint. Add a second layer only when a component token demands it, and treat inset like the pressed-state tool it is.",
                        "Two value shapes are worth adopting, because production validates them: the accessible focus ring 0 0 0 2px #fff (and its inset twin for filled backgrounds) — one of the most-shipped shadows in the whole sample — and the soft one-layer raise 0 1px 2px rgba(0,0,0,.1), which ships verbatim on sites like TinyURL and OpenStreetMap. The data ranks convention, not taste: a conventional shadow is what users read as normal, and that is the point of these defaults."
                ],
                "tool": {
                        "label": "Copia un valor de producción medido con el Generador de Box Shadow.",
                        "toolId": "box-shadow-generator"
                }
        },
        {
                "pageLink": {
                        "label": "Ver el artículo completo sobre valores reales de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Ver el artículo completo sobre valores reales de box-shadow"
                }
        }
]
    },
    "es-co": {
      title: "Qué valores de box-shadow usan realmente los sitios web reales",
      description: "Medimos sombras en producción en los 1,000 principales sitios web. La mayoría de sombras reales son pequeñas, neutras y con desplazamiento mínimo.",
      readingTime: "7 min de lectura",
      tags: ["css","box-shadow","design system","desarrollo web"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Las sombras de caja en producción real son pequeñas y neutras. El desplazamiento vertical mediano es inferior a 1 px, el desenfoque se mantiene en un dígito para el 75% de las capas y los colores son negros acromáticos con alfa ≤ 0.3.",
      keyTakeaway: "Las sombras en producción son sutiles y neutras: mantén Y entre 1 y 4 px, desenfoque de un solo dígito, X en 0 y negro neutro con alfa bajo.",
      toolCta: {"label":"Copia un valor de producción medido con el Generador de Box Shadow.","toolId":"box-shadow-generator"},
      seoTitle: "Valores reales de box-shadow en los principales sitios web | GainUtility",
      seoDescription: "Análisis de CSS box-shadow en 1,000 sitios web reales: desplazamientos, desenfoques, colores y prácticas recomendadas de diseño.",
      content: [
        {
                "paragraphs": [
                        "If you write CSS, you write box-shadow eventually — and you usually guess what looks right. This time the values are measured, not guessed. We took the top 1,000 domains from the Tranco list (pinned 2026-09-15), downloaded each homepage, parsed every box-shadow declaration in its shipped CSS, and counted what's actually in production.",
                        "The whole pipeline is reproducible: the list is pinned, the crawler and analyzer scripts live in this repo, and every measured value per site is downloadable as a CSV. No number in this article is hand-picked to make a point."
                ],
                "figure": "box-shadow-headline-stats"
        },
        {
                "heading": "How the measurement works",
                "paragraphs": [
                        "Each site's homepage was fetched over https with http fallback. From the served HTML we kept inline <style> blocks and linked stylesheets, up to 30 sheets per site or 8 MB per sheet, following inline @import one level deep. Sheet contents were parsed with the CSS tree parser; only box-shadow and the -webkit-box-shadow vendor twin were extracted.",
                        "Of 1,000 sampled domains, 533 served a homepage we could parse. The rest are accounted for, not hidden: 222 domains had no DNS record, 85 answered with an HTML bot-wall (403), 20 failed TLS hostname checks, 47 timed out, and the remainder split across 4xx/5xx statuses, connection resets, and certificate errors. Note the list includes shell-style pages and app entry points with no CSS at all — 28 of the 533 sites shipped no stylesheet to parse.",
                        "A declaration was counted when it appeared in the sheet. Identical -webkit-box-shadow and box-shadow pairs on the same rule collapse to one entry (3,531 such vendor twins), and values were deduplicated per site before the distinct-value counts. Shadows written entirely by JavaScript are out of scope by design.",
                        "The headline numbers below are px-space measurements: layers whose offsets, blur, and spread are all in px, laid out by the browser default font-size of 16px for typographic units (7 layers used rem and are reported separately). 3,216 declarations using other non-px units were measured for truthfulness but excluded from the pixel statistics."
                ]
        },
        {
                "heading": "Almost every top site ships a real shadow",
                "paragraphs": [
                        "427 of 533 parsed sites — 80.1% — ship at least one resolvable box-shadow on the homepage. 'none' exists too: 390 sites reset the effect somewhere, and with 5,301 none declarations it is the single most common value, ahead of every literal shadow. That reset is normal: frameworks null out a default box-shadow before adding their own, and some effects you see on the page come from elements the type selector misses.",
                        "From the 533 sites we collected 33,438 raw declarations, collapsing to 29,907 after dedupe and the vendor-twin merge. The distinct value set is 9,168 strings, and 5,596 of those are fully usable px values (or implemented in px after resolving their custom properties)."
                ]
        },
        {
                "heading": "Where the shadow sits",
                "paragraphs": [
                        "Site shadows are anchored to the box: 93.1% of the 21,887 measured layers use an X offset of exactly 0. Nothing drifts sideways in production CSS — even the most elaborate framework tokens keep X pinned.",
                        "Y is a real choice with two modes. 48.5% of layers sit exactly at y=0, and 50.2% push down by a small amount — the 75th percentile vertical offset is 3px. Upward shadows, the glow-below look, are a rounding error at 1.3% of layers. If you color an element but the background of the page is what should glow, write negative y — otherwise site data says: down a little, or straight down."
                ],
                "figure": "box-shadow-y-offset"
        },
        {
                "heading": "The blur is a lot smaller than the demos",
                "paragraphs": [
                        "Starter-kit demos blur at 10–25px. Production does not: 39.8% of layers ship blur 0 — those are the hard edges of focus rings and thin underlines — and among soft shadows the median blur is 3px, with the 75th percentile at 10px and the 90th at 24px.",
                        "The blur and the y-offset move together: when a site softens a shadow, it does so with a compact radius, not a fog bank. Values past ~40px blur exist but are the top of the tail."
                ],
                "figure": "box-shadow-blur"
        },
        {
                "heading": "Spread, inset, and the focus ring pattern",
                "paragraphs": [
                        "Spread defaults to none: 69.7% of layers carry spread 0. Positive spread (24%) mostly manufactures hard borders — the ring look — while negative spread (6.4%) shrinks the shadow to hug the box edge. Only 12.7% of layers are inset, and those cluster in a recognizable family: top-INSET pressed-button styles such as the Bootstrap classic inset 0 3px 5px rgba(0,0,0,.125).",
                        "What you actually see in the top values is the ability of spread to fake a border. The two most-shipped literal shadows in the whole sample are focus rings: 0 0 0 2px #fff (27 sites) and inset 0 0 0 2px #fff (18 sites) — white rings that read as borders without a border."
                ],
                "figure": "box-shadow-spread-inset"
        },
        {
                "heading": "Color: neutral, almost never opaque",
                "paragraphs": [
                        "The palette reads as one color: black at low opacity. 73.8% of measured layers are achromatic, and 74.9% have alpha at 0.3 or below, with the busiest bands at near-zero alpha (the largest single bucket is at or below 0.05) and at 0.1–0.15. Exactly-opaque shadows are rare — 21.3% of layers — and even those are mostly rings and utility borders, not depth shadows.",
                        "The syntax split is now hex-first: 11,453 layers (52.3%) write their color as hex such as #0000001a, and 9,585 (43.8%) as rgba(). The hex-in-alpha form carries the Tailwind token stream; HSL and named colors are negligible. Browsers default an omitted color to currentcolor, and that shows up too — 0.5% of layers lean on the default."
                ],
                "figure": "box-shadow-alpha"
        },
        {
                "heading": "One shadow, not a stack",
                "paragraphs": [
                        "A single layer is the default: 73.5% of the 14,517 shadowed declarations we could resolve use exactly one layer. Two layers cover 14.3%, and three or more just 12.2%. The stacks that do exist are token-driven, not art direction — the count climbs at 5–6 layers because Tailwind's ring utilities ship an inset-shadow plus a ring-offset-shadow plus a ring-shadow and their defaults as separate layers.",
                        "The tail is real but tame: one declaration reached 60 layers and another 142, both framework-table flowers that effectively render as archipelagos of nearly invisible rings."
                ],
                "figure": "box-shadow-layers"
        },
        {
                "heading": "The most-shipped values",
                "paragraphs": [
                        "This table ranks values by how many of the 533 sites ship them. The var() bundles are Tailwind's ring set and Bootstrap's button focus; the literals are dominated by ring-style hard shadows and small rgba drops. Material Design's canonical three-layer stack ships on 10 sites, and Google's two-layer variant on 9 — the stacks above are company templates, not the web-wide norm.",
                        "In the dataset, a row's 'declarations' column is how many times the value appeared across sheets; 'sites' is how many distinct domains placed it. kind records how we classified it: ok means the value stands as-is, global means it inherits meaning like inherit or unset, and varPartial marks values still holding a custom property after our resolution."
                ],
                "figure": "box-shadow-top-values"
        },
        {
                "heading": "A third of sites route shadows through custom properties",
                "paragraphs": [
                        "9,248 of the 33,438 raw declarations — 27.7% — reference a var(), and they spread wide: 260 of the 533 sites. Framework tokens are the reason: Tailwind accumulates five vars per ring declaration, and Bootstrap resolves its shades into --bs-*-box-shadow on the button.",
                        "We resolved 2,444 var() declarations to concrete pixels using only values the site itself defined: a same-rule definition first, then the sheet's :root, html, and universal selectors, then the fallback written inside the var() itself. Across those declarations, the variable lookups that succeeded split as 1,888 walked a root-level variable, 999 walked a rule-level variable, and 999 used the fallback inside the var(). A declaration can chain several lookups, so those three numbers add up to more lookups than declarations. The remainder stays honestly labelled var()-opaque — we do not guess at a site's runtime value."
                ]
        },
        {
                "heading": "The verdict table",
                "paragraphs": [
                        "Eight popular claims about box-shadow, graded against the measured set. 'Verdict' is GainUtility's conclusion — the numbers are yours to check."
                ],
                "table": {
                        "caption": "Six claims about box-shadow, graded against 21,887 measured layers.",
                        "columns": [
                                "Claim",
                                "What sites do (measured)",
                                "Verdict"
                        ],
                        "rows": [
                                [
                                        "Blur heavily for a soft modern look",
                                        "Median blur 3 px; 75th percentile 10 px; 39.8% of layers blur 0",
                                        "Only for big glows"
                                ],
                                [
                                        "Stack two–three layers like Material",
                                        "73.5% of declarations are a single layer; 3+ layers are 12.2%",
                                        "Only for design tokens"
                                ],
                                [
                                        "Offset down-and-right for depth",
                                        "Offset X is 0 on 93.1% of layers; Y is 0 on 48.5% and down on 50.2%",
                                        "Offset down — or not at all"
                                ],
                                [
                                        "Neutral color, low opacity",
                                        "73.8% achromatic; 74.9% at alpha ≤ 0.3; busiest bands ≤ 0.05 and 0.1–0.15",
                                        "Correct"
                                ],
                                [
                                        "Inset shadows are the depth staple",
                                        "Inset: 12.7% of layers, mostly pressed-button systems",
                                        "A deliberate choice, not the default"
                                ],
                                [
                                        "Upward (negative-Y) glow is common",
                                        "Negative Y offset: 1.3% of layers",
                                        "Rare"
                                ]
                        ]
                }
        },
        {
                "heading": "Limits you should know before quoting this",
                "list": [
                        "Coverage: 533 of 1,000 sampled domains resolved to a parseable homepage. The 467 gaps are enumerated in the methodology, not smoothed over — expect a western/heavy-platform skew in what remains.",
                        "Homepage only: marketing pages over-represent component kit CSS and under-represent the apps behind them. A <style>-less shell on the landing page (28 sites) says nothing about the product's tab styles.",
                        "Resolution: values resolved through custom properties only use what the site defined. A var() left opaque stays opaque — we count it under var()-opaque, excluded from px statistics.",
                        "Sheet caps: 30 sheets and 8 MB per sheet bound the crawl; styles layered in above those caps are absent. Served vs. computed: eases such as transition are out of scope, and a few effects are injected by JS toggling classes with id-less selectors we trimmed.",
                        "Date: the sample is a single day (list pinned 2026-09-15) and CSS moves; re-run the scripts for a fresh slice."
                ],
                "figure": "box-shadow-dataset"
        },
        {
                "heading": "How to use this in a design",
                "paragraphs": [
                        "Start every shadow from 0 0 (X and Y both zero). Move Y down by 1–4 px at most, keep blur in single digits for regular raises, and leave X alone. Write the color as black at an alpha between 0.08 and 0.3 — the measured sweet band — instead of a tint. Add a second layer only when a component token demands it, and treat inset like the pressed-state tool it is.",
                        "Two value shapes are worth adopting, because production validates them: the accessible focus ring 0 0 0 2px #fff (and its inset twin for filled backgrounds) — one of the most-shipped shadows in the whole sample — and the soft one-layer raise 0 1px 2px rgba(0,0,0,.1), which ships verbatim on sites like TinyURL and OpenStreetMap. The data ranks convention, not taste: a conventional shadow is what users read as normal, and that is the point of these defaults."
                ],
                "tool": {
                        "label": "Copia un valor de producción medido con el Generador de Box Shadow.",
                        "toolId": "box-shadow-generator"
                }
        },
        {
                "pageLink": {
                        "label": "Ver el artículo completo sobre valores reales de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Ver el artículo completo sobre valores reales de box-shadow"
                }
        }
]
    },
    "de": {
      title: "Welche box-shadow-Werte echte Websites tatsächlich verwenden",
      description: "Wir haben CSS-Schatten auf den 1.000 weltweit führenden Websites analysiert. Echte Schatten sind dezent, neutral und vertikal kaum versetzt.",
      readingTime: "7 Min. Lesezeit",
      tags: ["css","box-shadow","design system","webentwicklung"],
      categoryLabel: "Entwickler",
      quickAnswer: "Reale Schatten im Web sind klein und neutral: Der mediane Y-Versatz liegt unter 1 px, der Blur-Radius bleibt bei 75% der Ebenen einstellig und drei Viertel aller Farben sind achromatisches Schwarz mit Alpha ≤ 0,3.",
      keyTakeaway: "Produktionsreife Schatten sind dezent: Y bei 1–4 px, einstelliger Blur, X bei 0 und neutrales Schwarz mit geringem Alpha.",
      toolCta: {"label":"Kopieren Sie gemessene Produktionswerte mit dem Box Shadow Generator.","toolId":"box-shadow-generator"},
      seoTitle: "Echte CSS box-shadow Werte erfolgreicher Websites | GainUtility",
      seoDescription: "CSS box-shadow Messung auf 1.000 Top-Websites: Offsets, Blur-Radien, Farbtöne und praxiserprobte Designsystem-Muster.",
      content: [
        {
                "paragraphs": [
                        "If you write CSS, you write box-shadow eventually — and you usually guess what looks right. This time the values are measured, not guessed. We took the top 1,000 domains from the Tranco list (pinned 2026-09-15), downloaded each homepage, parsed every box-shadow declaration in its shipped CSS, and counted what's actually in production.",
                        "The whole pipeline is reproducible: the list is pinned, the crawler and analyzer scripts live in this repo, and every measured value per site is downloadable as a CSV. No number in this article is hand-picked to make a point."
                ],
                "figure": "box-shadow-headline-stats"
        },
        {
                "heading": "How the measurement works",
                "paragraphs": [
                        "Each site's homepage was fetched over https with http fallback. From the served HTML we kept inline <style> blocks and linked stylesheets, up to 30 sheets per site or 8 MB per sheet, following inline @import one level deep. Sheet contents were parsed with the CSS tree parser; only box-shadow and the -webkit-box-shadow vendor twin were extracted.",
                        "Of 1,000 sampled domains, 533 served a homepage we could parse. The rest are accounted for, not hidden: 222 domains had no DNS record, 85 answered with an HTML bot-wall (403), 20 failed TLS hostname checks, 47 timed out, and the remainder split across 4xx/5xx statuses, connection resets, and certificate errors. Note the list includes shell-style pages and app entry points with no CSS at all — 28 of the 533 sites shipped no stylesheet to parse.",
                        "A declaration was counted when it appeared in the sheet. Identical -webkit-box-shadow and box-shadow pairs on the same rule collapse to one entry (3,531 such vendor twins), and values were deduplicated per site before the distinct-value counts. Shadows written entirely by JavaScript are out of scope by design.",
                        "The headline numbers below are px-space measurements: layers whose offsets, blur, and spread are all in px, laid out by the browser default font-size of 16px for typographic units (7 layers used rem and are reported separately). 3,216 declarations using other non-px units were measured for truthfulness but excluded from the pixel statistics."
                ]
        },
        {
                "heading": "Almost every top site ships a real shadow",
                "paragraphs": [
                        "427 of 533 parsed sites — 80.1% — ship at least one resolvable box-shadow on the homepage. 'none' exists too: 390 sites reset the effect somewhere, and with 5,301 none declarations it is the single most common value, ahead of every literal shadow. That reset is normal: frameworks null out a default box-shadow before adding their own, and some effects you see on the page come from elements the type selector misses.",
                        "From the 533 sites we collected 33,438 raw declarations, collapsing to 29,907 after dedupe and the vendor-twin merge. The distinct value set is 9,168 strings, and 5,596 of those are fully usable px values (or implemented in px after resolving their custom properties)."
                ]
        },
        {
                "heading": "Where the shadow sits",
                "paragraphs": [
                        "Site shadows are anchored to the box: 93.1% of the 21,887 measured layers use an X offset of exactly 0. Nothing drifts sideways in production CSS — even the most elaborate framework tokens keep X pinned.",
                        "Y is a real choice with two modes. 48.5% of layers sit exactly at y=0, and 50.2% push down by a small amount — the 75th percentile vertical offset is 3px. Upward shadows, the glow-below look, are a rounding error at 1.3% of layers. If you color an element but the background of the page is what should glow, write negative y — otherwise site data says: down a little, or straight down."
                ],
                "figure": "box-shadow-y-offset"
        },
        {
                "heading": "The blur is a lot smaller than the demos",
                "paragraphs": [
                        "Starter-kit demos blur at 10–25px. Production does not: 39.8% of layers ship blur 0 — those are the hard edges of focus rings and thin underlines — and among soft shadows the median blur is 3px, with the 75th percentile at 10px and the 90th at 24px.",
                        "The blur and the y-offset move together: when a site softens a shadow, it does so with a compact radius, not a fog bank. Values past ~40px blur exist but are the top of the tail."
                ],
                "figure": "box-shadow-blur"
        },
        {
                "heading": "Spread, inset, and the focus ring pattern",
                "paragraphs": [
                        "Spread defaults to none: 69.7% of layers carry spread 0. Positive spread (24%) mostly manufactures hard borders — the ring look — while negative spread (6.4%) shrinks the shadow to hug the box edge. Only 12.7% of layers are inset, and those cluster in a recognizable family: top-INSET pressed-button styles such as the Bootstrap classic inset 0 3px 5px rgba(0,0,0,.125).",
                        "What you actually see in the top values is the ability of spread to fake a border. The two most-shipped literal shadows in the whole sample are focus rings: 0 0 0 2px #fff (27 sites) and inset 0 0 0 2px #fff (18 sites) — white rings that read as borders without a border."
                ],
                "figure": "box-shadow-spread-inset"
        },
        {
                "heading": "Color: neutral, almost never opaque",
                "paragraphs": [
                        "The palette reads as one color: black at low opacity. 73.8% of measured layers are achromatic, and 74.9% have alpha at 0.3 or below, with the busiest bands at near-zero alpha (the largest single bucket is at or below 0.05) and at 0.1–0.15. Exactly-opaque shadows are rare — 21.3% of layers — and even those are mostly rings and utility borders, not depth shadows.",
                        "The syntax split is now hex-first: 11,453 layers (52.3%) write their color as hex such as #0000001a, and 9,585 (43.8%) as rgba(). The hex-in-alpha form carries the Tailwind token stream; HSL and named colors are negligible. Browsers default an omitted color to currentcolor, and that shows up too — 0.5% of layers lean on the default."
                ],
                "figure": "box-shadow-alpha"
        },
        {
                "heading": "One shadow, not a stack",
                "paragraphs": [
                        "A single layer is the default: 73.5% of the 14,517 shadowed declarations we could resolve use exactly one layer. Two layers cover 14.3%, and three or more just 12.2%. The stacks that do exist are token-driven, not art direction — the count climbs at 5–6 layers because Tailwind's ring utilities ship an inset-shadow plus a ring-offset-shadow plus a ring-shadow and their defaults as separate layers.",
                        "The tail is real but tame: one declaration reached 60 layers and another 142, both framework-table flowers that effectively render as archipelagos of nearly invisible rings."
                ],
                "figure": "box-shadow-layers"
        },
        {
                "heading": "The most-shipped values",
                "paragraphs": [
                        "This table ranks values by how many of the 533 sites ship them. The var() bundles are Tailwind's ring set and Bootstrap's button focus; the literals are dominated by ring-style hard shadows and small rgba drops. Material Design's canonical three-layer stack ships on 10 sites, and Google's two-layer variant on 9 — the stacks above are company templates, not the web-wide norm.",
                        "In the dataset, a row's 'declarations' column is how many times the value appeared across sheets; 'sites' is how many distinct domains placed it. kind records how we classified it: ok means the value stands as-is, global means it inherits meaning like inherit or unset, and varPartial marks values still holding a custom property after our resolution."
                ],
                "figure": "box-shadow-top-values"
        },
        {
                "heading": "A third of sites route shadows through custom properties",
                "paragraphs": [
                        "9,248 of the 33,438 raw declarations — 27.7% — reference a var(), and they spread wide: 260 of the 533 sites. Framework tokens are the reason: Tailwind accumulates five vars per ring declaration, and Bootstrap resolves its shades into --bs-*-box-shadow on the button.",
                        "We resolved 2,444 var() declarations to concrete pixels using only values the site itself defined: a same-rule definition first, then the sheet's :root, html, and universal selectors, then the fallback written inside the var() itself. Across those declarations, the variable lookups that succeeded split as 1,888 walked a root-level variable, 999 walked a rule-level variable, and 999 used the fallback inside the var(). A declaration can chain several lookups, so those three numbers add up to more lookups than declarations. The remainder stays honestly labelled var()-opaque — we do not guess at a site's runtime value."
                ]
        },
        {
                "heading": "The verdict table",
                "paragraphs": [
                        "Eight popular claims about box-shadow, graded against the measured set. 'Verdict' is GainUtility's conclusion — the numbers are yours to check."
                ],
                "table": {
                        "caption": "Six claims about box-shadow, graded against 21,887 measured layers.",
                        "columns": [
                                "Claim",
                                "What sites do (measured)",
                                "Verdict"
                        ],
                        "rows": [
                                [
                                        "Blur heavily for a soft modern look",
                                        "Median blur 3 px; 75th percentile 10 px; 39.8% of layers blur 0",
                                        "Only for big glows"
                                ],
                                [
                                        "Stack two–three layers like Material",
                                        "73.5% of declarations are a single layer; 3+ layers are 12.2%",
                                        "Only for design tokens"
                                ],
                                [
                                        "Offset down-and-right for depth",
                                        "Offset X is 0 on 93.1% of layers; Y is 0 on 48.5% and down on 50.2%",
                                        "Offset down — or not at all"
                                ],
                                [
                                        "Neutral color, low opacity",
                                        "73.8% achromatic; 74.9% at alpha ≤ 0.3; busiest bands ≤ 0.05 and 0.1–0.15",
                                        "Correct"
                                ],
                                [
                                        "Inset shadows are the depth staple",
                                        "Inset: 12.7% of layers, mostly pressed-button systems",
                                        "A deliberate choice, not the default"
                                ],
                                [
                                        "Upward (negative-Y) glow is common",
                                        "Negative Y offset: 1.3% of layers",
                                        "Rare"
                                ]
                        ]
                }
        },
        {
                "heading": "Limits you should know before quoting this",
                "list": [
                        "Coverage: 533 of 1,000 sampled domains resolved to a parseable homepage. The 467 gaps are enumerated in the methodology, not smoothed over — expect a western/heavy-platform skew in what remains.",
                        "Homepage only: marketing pages over-represent component kit CSS and under-represent the apps behind them. A <style>-less shell on the landing page (28 sites) says nothing about the product's tab styles.",
                        "Resolution: values resolved through custom properties only use what the site defined. A var() left opaque stays opaque — we count it under var()-opaque, excluded from px statistics.",
                        "Sheet caps: 30 sheets and 8 MB per sheet bound the crawl; styles layered in above those caps are absent. Served vs. computed: eases such as transition are out of scope, and a few effects are injected by JS toggling classes with id-less selectors we trimmed.",
                        "Date: the sample is a single day (list pinned 2026-09-15) and CSS moves; re-run the scripts for a fresh slice."
                ],
                "figure": "box-shadow-dataset"
        },
        {
                "heading": "How to use this in a design",
                "paragraphs": [
                        "Start every shadow from 0 0 (X and Y both zero). Move Y down by 1–4 px at most, keep blur in single digits for regular raises, and leave X alone. Write the color as black at an alpha between 0.08 and 0.3 — the measured sweet band — instead of a tint. Add a second layer only when a component token demands it, and treat inset like the pressed-state tool it is.",
                        "Two value shapes are worth adopting, because production validates them: the accessible focus ring 0 0 0 2px #fff (and its inset twin for filled backgrounds) — one of the most-shipped shadows in the whole sample — and the soft one-layer raise 0 1px 2px rgba(0,0,0,.1), which ships verbatim on sites like TinyURL and OpenStreetMap. The data ranks convention, not taste: a conventional shadow is what users read as normal, and that is the point of these defaults."
                ],
                "tool": {
                        "label": "Kopieren Sie gemessene Produktionswerte mit dem Box Shadow Generator.",
                        "toolId": "box-shadow-generator"
                }
        },
        {
                "pageLink": {
                        "label": "Den vollständigen Artikel über reale box-shadow-Werte lesen",
                        "path": "/css/box-shadow",
                        "text": "Den vollständigen Artikel über reale box-shadow-Werte lesen"
                }
        }
]
    },
    "fr": {
      title: "Quelles valeurs de box-shadow les vrais sites web utilisent-ils vraiment",
      description: "Analyse réelle des ombres CSS sur les 1 000 premiers sites mondiaux. Les ombres en production sont subtiles, neutres et peu décalées.",
      readingTime: "7 min de lecture",
      tags: ["css","box-shadow","design system","développement web"],
      categoryLabel: "Développeur",
      quickAnswer: "Les ombres CSS réelles en production sont petites et neutres. Le décalage vertical médian est inférieur à 1 px, le flou reste à un chiffre pour 75% des calques et la couleur est un noir achromatique avec un alpha ≤ 0,3.",
      keyTakeaway: "Les ombres en production sont subtiles et neutres : décalage Y de 1 à 4 px, flou à un seul chiffre, X à 0 et noir avec faible opacité.",
      toolCta: {"label":"Copiez une valeur de production mesurée avec le Générateur de Box Shadow.","toolId":"box-shadow-generator"},
      seoTitle: "Valeurs réelles de box-shadow sur les grands sites web | GainUtility",
      seoDescription: "Analyse concrète du CSS box-shadow sur 1 000 sites majeurs : décalages, flou, couleurs et règles de conception d'interfaces.",
      content: [
        {
                "paragraphs": [
                        "If you write CSS, you write box-shadow eventually — and you usually guess what looks right. This time the values are measured, not guessed. We took the top 1,000 domains from the Tranco list (pinned 2026-09-15), downloaded each homepage, parsed every box-shadow declaration in its shipped CSS, and counted what's actually in production.",
                        "The whole pipeline is reproducible: the list is pinned, the crawler and analyzer scripts live in this repo, and every measured value per site is downloadable as a CSV. No number in this article is hand-picked to make a point."
                ],
                "figure": "box-shadow-headline-stats"
        },
        {
                "heading": "How the measurement works",
                "paragraphs": [
                        "Each site's homepage was fetched over https with http fallback. From the served HTML we kept inline <style> blocks and linked stylesheets, up to 30 sheets per site or 8 MB per sheet, following inline @import one level deep. Sheet contents were parsed with the CSS tree parser; only box-shadow and the -webkit-box-shadow vendor twin were extracted.",
                        "Of 1,000 sampled domains, 533 served a homepage we could parse. The rest are accounted for, not hidden: 222 domains had no DNS record, 85 answered with an HTML bot-wall (403), 20 failed TLS hostname checks, 47 timed out, and the remainder split across 4xx/5xx statuses, connection resets, and certificate errors. Note the list includes shell-style pages and app entry points with no CSS at all — 28 of the 533 sites shipped no stylesheet to parse.",
                        "A declaration was counted when it appeared in the sheet. Identical -webkit-box-shadow and box-shadow pairs on the same rule collapse to one entry (3,531 such vendor twins), and values were deduplicated per site before the distinct-value counts. Shadows written entirely by JavaScript are out of scope by design.",
                        "The headline numbers below are px-space measurements: layers whose offsets, blur, and spread are all in px, laid out by the browser default font-size of 16px for typographic units (7 layers used rem and are reported separately). 3,216 declarations using other non-px units were measured for truthfulness but excluded from the pixel statistics."
                ]
        },
        {
                "heading": "Almost every top site ships a real shadow",
                "paragraphs": [
                        "427 of 533 parsed sites — 80.1% — ship at least one resolvable box-shadow on the homepage. 'none' exists too: 390 sites reset the effect somewhere, and with 5,301 none declarations it is the single most common value, ahead of every literal shadow. That reset is normal: frameworks null out a default box-shadow before adding their own, and some effects you see on the page come from elements the type selector misses.",
                        "From the 533 sites we collected 33,438 raw declarations, collapsing to 29,907 after dedupe and the vendor-twin merge. The distinct value set is 9,168 strings, and 5,596 of those are fully usable px values (or implemented in px after resolving their custom properties)."
                ]
        },
        {
                "heading": "Where the shadow sits",
                "paragraphs": [
                        "Site shadows are anchored to the box: 93.1% of the 21,887 measured layers use an X offset of exactly 0. Nothing drifts sideways in production CSS — even the most elaborate framework tokens keep X pinned.",
                        "Y is a real choice with two modes. 48.5% of layers sit exactly at y=0, and 50.2% push down by a small amount — the 75th percentile vertical offset is 3px. Upward shadows, the glow-below look, are a rounding error at 1.3% of layers. If you color an element but the background of the page is what should glow, write negative y — otherwise site data says: down a little, or straight down."
                ],
                "figure": "box-shadow-y-offset"
        },
        {
                "heading": "The blur is a lot smaller than the demos",
                "paragraphs": [
                        "Starter-kit demos blur at 10–25px. Production does not: 39.8% of layers ship blur 0 — those are the hard edges of focus rings and thin underlines — and among soft shadows the median blur is 3px, with the 75th percentile at 10px and the 90th at 24px.",
                        "The blur and the y-offset move together: when a site softens a shadow, it does so with a compact radius, not a fog bank. Values past ~40px blur exist but are the top of the tail."
                ],
                "figure": "box-shadow-blur"
        },
        {
                "heading": "Spread, inset, and the focus ring pattern",
                "paragraphs": [
                        "Spread defaults to none: 69.7% of layers carry spread 0. Positive spread (24%) mostly manufactures hard borders — the ring look — while negative spread (6.4%) shrinks the shadow to hug the box edge. Only 12.7% of layers are inset, and those cluster in a recognizable family: top-INSET pressed-button styles such as the Bootstrap classic inset 0 3px 5px rgba(0,0,0,.125).",
                        "What you actually see in the top values is the ability of spread to fake a border. The two most-shipped literal shadows in the whole sample are focus rings: 0 0 0 2px #fff (27 sites) and inset 0 0 0 2px #fff (18 sites) — white rings that read as borders without a border."
                ],
                "figure": "box-shadow-spread-inset"
        },
        {
                "heading": "Color: neutral, almost never opaque",
                "paragraphs": [
                        "The palette reads as one color: black at low opacity. 73.8% of measured layers are achromatic, and 74.9% have alpha at 0.3 or below, with the busiest bands at near-zero alpha (the largest single bucket is at or below 0.05) and at 0.1–0.15. Exactly-opaque shadows are rare — 21.3% of layers — and even those are mostly rings and utility borders, not depth shadows.",
                        "The syntax split is now hex-first: 11,453 layers (52.3%) write their color as hex such as #0000001a, and 9,585 (43.8%) as rgba(). The hex-in-alpha form carries the Tailwind token stream; HSL and named colors are negligible. Browsers default an omitted color to currentcolor, and that shows up too — 0.5% of layers lean on the default."
                ],
                "figure": "box-shadow-alpha"
        },
        {
                "heading": "One shadow, not a stack",
                "paragraphs": [
                        "A single layer is the default: 73.5% of the 14,517 shadowed declarations we could resolve use exactly one layer. Two layers cover 14.3%, and three or more just 12.2%. The stacks that do exist are token-driven, not art direction — the count climbs at 5–6 layers because Tailwind's ring utilities ship an inset-shadow plus a ring-offset-shadow plus a ring-shadow and their defaults as separate layers.",
                        "The tail is real but tame: one declaration reached 60 layers and another 142, both framework-table flowers that effectively render as archipelagos of nearly invisible rings."
                ],
                "figure": "box-shadow-layers"
        },
        {
                "heading": "The most-shipped values",
                "paragraphs": [
                        "This table ranks values by how many of the 533 sites ship them. The var() bundles are Tailwind's ring set and Bootstrap's button focus; the literals are dominated by ring-style hard shadows and small rgba drops. Material Design's canonical three-layer stack ships on 10 sites, and Google's two-layer variant on 9 — the stacks above are company templates, not the web-wide norm.",
                        "In the dataset, a row's 'declarations' column is how many times the value appeared across sheets; 'sites' is how many distinct domains placed it. kind records how we classified it: ok means the value stands as-is, global means it inherits meaning like inherit or unset, and varPartial marks values still holding a custom property after our resolution."
                ],
                "figure": "box-shadow-top-values"
        },
        {
                "heading": "A third of sites route shadows through custom properties",
                "paragraphs": [
                        "9,248 of the 33,438 raw declarations — 27.7% — reference a var(), and they spread wide: 260 of the 533 sites. Framework tokens are the reason: Tailwind accumulates five vars per ring declaration, and Bootstrap resolves its shades into --bs-*-box-shadow on the button.",
                        "We resolved 2,444 var() declarations to concrete pixels using only values the site itself defined: a same-rule definition first, then the sheet's :root, html, and universal selectors, then the fallback written inside the var() itself. Across those declarations, the variable lookups that succeeded split as 1,888 walked a root-level variable, 999 walked a rule-level variable, and 999 used the fallback inside the var(). A declaration can chain several lookups, so those three numbers add up to more lookups than declarations. The remainder stays honestly labelled var()-opaque — we do not guess at a site's runtime value."
                ]
        },
        {
                "heading": "The verdict table",
                "paragraphs": [
                        "Eight popular claims about box-shadow, graded against the measured set. 'Verdict' is GainUtility's conclusion — the numbers are yours to check."
                ],
                "table": {
                        "caption": "Six claims about box-shadow, graded against 21,887 measured layers.",
                        "columns": [
                                "Claim",
                                "What sites do (measured)",
                                "Verdict"
                        ],
                        "rows": [
                                [
                                        "Blur heavily for a soft modern look",
                                        "Median blur 3 px; 75th percentile 10 px; 39.8% of layers blur 0",
                                        "Only for big glows"
                                ],
                                [
                                        "Stack two–three layers like Material",
                                        "73.5% of declarations are a single layer; 3+ layers are 12.2%",
                                        "Only for design tokens"
                                ],
                                [
                                        "Offset down-and-right for depth",
                                        "Offset X is 0 on 93.1% of layers; Y is 0 on 48.5% and down on 50.2%",
                                        "Offset down — or not at all"
                                ],
                                [
                                        "Neutral color, low opacity",
                                        "73.8% achromatic; 74.9% at alpha ≤ 0.3; busiest bands ≤ 0.05 and 0.1–0.15",
                                        "Correct"
                                ],
                                [
                                        "Inset shadows are the depth staple",
                                        "Inset: 12.7% of layers, mostly pressed-button systems",
                                        "A deliberate choice, not the default"
                                ],
                                [
                                        "Upward (negative-Y) glow is common",
                                        "Negative Y offset: 1.3% of layers",
                                        "Rare"
                                ]
                        ]
                }
        },
        {
                "heading": "Limits you should know before quoting this",
                "list": [
                        "Coverage: 533 of 1,000 sampled domains resolved to a parseable homepage. The 467 gaps are enumerated in the methodology, not smoothed over — expect a western/heavy-platform skew in what remains.",
                        "Homepage only: marketing pages over-represent component kit CSS and under-represent the apps behind them. A <style>-less shell on the landing page (28 sites) says nothing about the product's tab styles.",
                        "Resolution: values resolved through custom properties only use what the site defined. A var() left opaque stays opaque — we count it under var()-opaque, excluded from px statistics.",
                        "Sheet caps: 30 sheets and 8 MB per sheet bound the crawl; styles layered in above those caps are absent. Served vs. computed: eases such as transition are out of scope, and a few effects are injected by JS toggling classes with id-less selectors we trimmed.",
                        "Date: the sample is a single day (list pinned 2026-09-15) and CSS moves; re-run the scripts for a fresh slice."
                ],
                "figure": "box-shadow-dataset"
        },
        {
                "heading": "How to use this in a design",
                "paragraphs": [
                        "Start every shadow from 0 0 (X and Y both zero). Move Y down by 1–4 px at most, keep blur in single digits for regular raises, and leave X alone. Write the color as black at an alpha between 0.08 and 0.3 — the measured sweet band — instead of a tint. Add a second layer only when a component token demands it, and treat inset like the pressed-state tool it is.",
                        "Two value shapes are worth adopting, because production validates them: the accessible focus ring 0 0 0 2px #fff (and its inset twin for filled backgrounds) — one of the most-shipped shadows in the whole sample — and the soft one-layer raise 0 1px 2px rgba(0,0,0,.1), which ships verbatim on sites like TinyURL and OpenStreetMap. The data ranks convention, not taste: a conventional shadow is what users read as normal, and that is the point of these defaults."
                ],
                "tool": {
                        "label": "Copiez une valeur de production mesurée avec le Générateur de Box Shadow.",
                        "toolId": "box-shadow-generator"
                }
        },
        {
                "pageLink": {
                        "label": "Consulter l'article complet sur les vraies valeurs de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Consulter l'article complet sur les vraies valeurs de box-shadow"
                }
        }
]
    },
    "it": {
      title: "Quali valori di box-shadow usano realmente i veri siti web",
      description: "Abbiamo misurato le ombre CSS sui primi 1.000 siti web mondiali. Le ombre reali sono sottili, neutre e con spostamenti verticali minimi.",
      readingTime: "7 min di lettura",
      tags: ["css","box-shadow","design system","sviluppo web"],
      categoryLabel: "Sviluppatore",
      quickAnswer: "Le ombre di produzione sono contenute e neutre. L'offset verticale mediano è inferiore a 1 px, la sfocatura rimane a cifra singola per il 75% dei livelli e il colore è nero acromatico con alpha ≤ 0,3.",
      keyTakeaway: "Le ombre in produzione sono discrete e neutre: Y a 1–4 px, sfocatura a cifra singola, X a 0 e nero neutro a bassa trasparenza.",
      toolCta: {"label":"Copia un valore misurato di produzione con il Generatore di Box Shadow.","toolId":"box-shadow-generator"},
      seoTitle: "Valori reali di box-shadow nei siti web più importanti | GainUtility",
      seoDescription: "Studio approfondito sulle proprietà CSS box-shadow nei primi 1.000 siti: offset, sfocature, colori e pattern per interfacce pulite.",
      content: [
        {
                "paragraphs": [
                        "If you write CSS, you write box-shadow eventually — and you usually guess what looks right. This time the values are measured, not guessed. We took the top 1,000 domains from the Tranco list (pinned 2026-09-15), downloaded each homepage, parsed every box-shadow declaration in its shipped CSS, and counted what's actually in production.",
                        "The whole pipeline is reproducible: the list is pinned, the crawler and analyzer scripts live in this repo, and every measured value per site is downloadable as a CSV. No number in this article is hand-picked to make a point."
                ],
                "figure": "box-shadow-headline-stats"
        },
        {
                "heading": "How the measurement works",
                "paragraphs": [
                        "Each site's homepage was fetched over https with http fallback. From the served HTML we kept inline <style> blocks and linked stylesheets, up to 30 sheets per site or 8 MB per sheet, following inline @import one level deep. Sheet contents were parsed with the CSS tree parser; only box-shadow and the -webkit-box-shadow vendor twin were extracted.",
                        "Of 1,000 sampled domains, 533 served a homepage we could parse. The rest are accounted for, not hidden: 222 domains had no DNS record, 85 answered with an HTML bot-wall (403), 20 failed TLS hostname checks, 47 timed out, and the remainder split across 4xx/5xx statuses, connection resets, and certificate errors. Note the list includes shell-style pages and app entry points with no CSS at all — 28 of the 533 sites shipped no stylesheet to parse.",
                        "A declaration was counted when it appeared in the sheet. Identical -webkit-box-shadow and box-shadow pairs on the same rule collapse to one entry (3,531 such vendor twins), and values were deduplicated per site before the distinct-value counts. Shadows written entirely by JavaScript are out of scope by design.",
                        "The headline numbers below are px-space measurements: layers whose offsets, blur, and spread are all in px, laid out by the browser default font-size of 16px for typographic units (7 layers used rem and are reported separately). 3,216 declarations using other non-px units were measured for truthfulness but excluded from the pixel statistics."
                ]
        },
        {
                "heading": "Almost every top site ships a real shadow",
                "paragraphs": [
                        "427 of 533 parsed sites — 80.1% — ship at least one resolvable box-shadow on the homepage. 'none' exists too: 390 sites reset the effect somewhere, and with 5,301 none declarations it is the single most common value, ahead of every literal shadow. That reset is normal: frameworks null out a default box-shadow before adding their own, and some effects you see on the page come from elements the type selector misses.",
                        "From the 533 sites we collected 33,438 raw declarations, collapsing to 29,907 after dedupe and the vendor-twin merge. The distinct value set is 9,168 strings, and 5,596 of those are fully usable px values (or implemented in px after resolving their custom properties)."
                ]
        },
        {
                "heading": "Where the shadow sits",
                "paragraphs": [
                        "Site shadows are anchored to the box: 93.1% of the 21,887 measured layers use an X offset of exactly 0. Nothing drifts sideways in production CSS — even the most elaborate framework tokens keep X pinned.",
                        "Y is a real choice with two modes. 48.5% of layers sit exactly at y=0, and 50.2% push down by a small amount — the 75th percentile vertical offset is 3px. Upward shadows, the glow-below look, are a rounding error at 1.3% of layers. If you color an element but the background of the page is what should glow, write negative y — otherwise site data says: down a little, or straight down."
                ],
                "figure": "box-shadow-y-offset"
        },
        {
                "heading": "The blur is a lot smaller than the demos",
                "paragraphs": [
                        "Starter-kit demos blur at 10–25px. Production does not: 39.8% of layers ship blur 0 — those are the hard edges of focus rings and thin underlines — and among soft shadows the median blur is 3px, with the 75th percentile at 10px and the 90th at 24px.",
                        "The blur and the y-offset move together: when a site softens a shadow, it does so with a compact radius, not a fog bank. Values past ~40px blur exist but are the top of the tail."
                ],
                "figure": "box-shadow-blur"
        },
        {
                "heading": "Spread, inset, and the focus ring pattern",
                "paragraphs": [
                        "Spread defaults to none: 69.7% of layers carry spread 0. Positive spread (24%) mostly manufactures hard borders — the ring look — while negative spread (6.4%) shrinks the shadow to hug the box edge. Only 12.7% of layers are inset, and those cluster in a recognizable family: top-INSET pressed-button styles such as the Bootstrap classic inset 0 3px 5px rgba(0,0,0,.125).",
                        "What you actually see in the top values is the ability of spread to fake a border. The two most-shipped literal shadows in the whole sample are focus rings: 0 0 0 2px #fff (27 sites) and inset 0 0 0 2px #fff (18 sites) — white rings that read as borders without a border."
                ],
                "figure": "box-shadow-spread-inset"
        },
        {
                "heading": "Color: neutral, almost never opaque",
                "paragraphs": [
                        "The palette reads as one color: black at low opacity. 73.8% of measured layers are achromatic, and 74.9% have alpha at 0.3 or below, with the busiest bands at near-zero alpha (the largest single bucket is at or below 0.05) and at 0.1–0.15. Exactly-opaque shadows are rare — 21.3% of layers — and even those are mostly rings and utility borders, not depth shadows.",
                        "The syntax split is now hex-first: 11,453 layers (52.3%) write their color as hex such as #0000001a, and 9,585 (43.8%) as rgba(). The hex-in-alpha form carries the Tailwind token stream; HSL and named colors are negligible. Browsers default an omitted color to currentcolor, and that shows up too — 0.5% of layers lean on the default."
                ],
                "figure": "box-shadow-alpha"
        },
        {
                "heading": "One shadow, not a stack",
                "paragraphs": [
                        "A single layer is the default: 73.5% of the 14,517 shadowed declarations we could resolve use exactly one layer. Two layers cover 14.3%, and three or more just 12.2%. The stacks that do exist are token-driven, not art direction — the count climbs at 5–6 layers because Tailwind's ring utilities ship an inset-shadow plus a ring-offset-shadow plus a ring-shadow and their defaults as separate layers.",
                        "The tail is real but tame: one declaration reached 60 layers and another 142, both framework-table flowers that effectively render as archipelagos of nearly invisible rings."
                ],
                "figure": "box-shadow-layers"
        },
        {
                "heading": "The most-shipped values",
                "paragraphs": [
                        "This table ranks values by how many of the 533 sites ship them. The var() bundles are Tailwind's ring set and Bootstrap's button focus; the literals are dominated by ring-style hard shadows and small rgba drops. Material Design's canonical three-layer stack ships on 10 sites, and Google's two-layer variant on 9 — the stacks above are company templates, not the web-wide norm.",
                        "In the dataset, a row's 'declarations' column is how many times the value appeared across sheets; 'sites' is how many distinct domains placed it. kind records how we classified it: ok means the value stands as-is, global means it inherits meaning like inherit or unset, and varPartial marks values still holding a custom property after our resolution."
                ],
                "figure": "box-shadow-top-values"
        },
        {
                "heading": "A third of sites route shadows through custom properties",
                "paragraphs": [
                        "9,248 of the 33,438 raw declarations — 27.7% — reference a var(), and they spread wide: 260 of the 533 sites. Framework tokens are the reason: Tailwind accumulates five vars per ring declaration, and Bootstrap resolves its shades into --bs-*-box-shadow on the button.",
                        "We resolved 2,444 var() declarations to concrete pixels using only values the site itself defined: a same-rule definition first, then the sheet's :root, html, and universal selectors, then the fallback written inside the var() itself. Across those declarations, the variable lookups that succeeded split as 1,888 walked a root-level variable, 999 walked a rule-level variable, and 999 used the fallback inside the var(). A declaration can chain several lookups, so those three numbers add up to more lookups than declarations. The remainder stays honestly labelled var()-opaque — we do not guess at a site's runtime value."
                ]
        },
        {
                "heading": "The verdict table",
                "paragraphs": [
                        "Eight popular claims about box-shadow, graded against the measured set. 'Verdict' is GainUtility's conclusion — the numbers are yours to check."
                ],
                "table": {
                        "caption": "Six claims about box-shadow, graded against 21,887 measured layers.",
                        "columns": [
                                "Claim",
                                "What sites do (measured)",
                                "Verdict"
                        ],
                        "rows": [
                                [
                                        "Blur heavily for a soft modern look",
                                        "Median blur 3 px; 75th percentile 10 px; 39.8% of layers blur 0",
                                        "Only for big glows"
                                ],
                                [
                                        "Stack two–three layers like Material",
                                        "73.5% of declarations are a single layer; 3+ layers are 12.2%",
                                        "Only for design tokens"
                                ],
                                [
                                        "Offset down-and-right for depth",
                                        "Offset X is 0 on 93.1% of layers; Y is 0 on 48.5% and down on 50.2%",
                                        "Offset down — or not at all"
                                ],
                                [
                                        "Neutral color, low opacity",
                                        "73.8% achromatic; 74.9% at alpha ≤ 0.3; busiest bands ≤ 0.05 and 0.1–0.15",
                                        "Correct"
                                ],
                                [
                                        "Inset shadows are the depth staple",
                                        "Inset: 12.7% of layers, mostly pressed-button systems",
                                        "A deliberate choice, not the default"
                                ],
                                [
                                        "Upward (negative-Y) glow is common",
                                        "Negative Y offset: 1.3% of layers",
                                        "Rare"
                                ]
                        ]
                }
        },
        {
                "heading": "Limits you should know before quoting this",
                "list": [
                        "Coverage: 533 of 1,000 sampled domains resolved to a parseable homepage. The 467 gaps are enumerated in the methodology, not smoothed over — expect a western/heavy-platform skew in what remains.",
                        "Homepage only: marketing pages over-represent component kit CSS and under-represent the apps behind them. A <style>-less shell on the landing page (28 sites) says nothing about the product's tab styles.",
                        "Resolution: values resolved through custom properties only use what the site defined. A var() left opaque stays opaque — we count it under var()-opaque, excluded from px statistics.",
                        "Sheet caps: 30 sheets and 8 MB per sheet bound the crawl; styles layered in above those caps are absent. Served vs. computed: eases such as transition are out of scope, and a few effects are injected by JS toggling classes with id-less selectors we trimmed.",
                        "Date: the sample is a single day (list pinned 2026-09-15) and CSS moves; re-run the scripts for a fresh slice."
                ],
                "figure": "box-shadow-dataset"
        },
        {
                "heading": "How to use this in a design",
                "paragraphs": [
                        "Start every shadow from 0 0 (X and Y both zero). Move Y down by 1–4 px at most, keep blur in single digits for regular raises, and leave X alone. Write the color as black at an alpha between 0.08 and 0.3 — the measured sweet band — instead of a tint. Add a second layer only when a component token demands it, and treat inset like the pressed-state tool it is.",
                        "Two value shapes are worth adopting, because production validates them: the accessible focus ring 0 0 0 2px #fff (and its inset twin for filled backgrounds) — one of the most-shipped shadows in the whole sample — and the soft one-layer raise 0 1px 2px rgba(0,0,0,.1), which ships verbatim on sites like TinyURL and OpenStreetMap. The data ranks convention, not taste: a conventional shadow is what users read as normal, and that is the point of these defaults."
                ],
                "tool": {
                        "label": "Copia un valore misurato di produzione con il Generatore di Box Shadow.",
                        "toolId": "box-shadow-generator"
                }
        },
        {
                "pageLink": {
                        "label": "Leggi l'articolo completo sui valori reali di box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Leggi l'articolo completo sui valori reali di box-shadow"
                }
        }
]
    },
    "id": {
      title: "Nilai box-shadow apa yang sebenarnya digunakan situs web nyata",
      description: "Kami menganalisis bayangan CSS pada 1.000 situs web teratas dunia. Sebagian besar bayangan produksi berukuran kecil, netral, dan halus.",
      readingTime: "7 mnt baca",
      tags: ["css","box-shadow","design system","pengembangan web"],
      categoryLabel: "Pengembang",
      quickAnswer: "Bayangan produksi nyata berukuran kecil dan netral. Offset vertikal median berada di bawah 1 px, blur satu digit untuk 75% lapisan, dan warna hitam akromatik dengan alpha ≤ 0,3.",
      keyTakeaway: "Bayangan produksi bersifat halus dan netral: jaga offset Y di 1–4 px, blur satu digit, X di 0, dan warna hitam netral ber-alpha rendah.",
      toolCta: {"label":"Salin nilai produksi terukur dengan Generator Box Shadow.","toolId":"box-shadow-generator"},
      seoTitle: "Nilai nyata box-shadow di situs web populer | GainUtility",
      seoDescription: "Pengukuran nyata CSS box-shadow pada 1.000 situs teratas: offset, radius blur, warna, dan panduan desain UI modern.",
      content: [
        {
                "paragraphs": [
                        "If you write CSS, you write box-shadow eventually — and you usually guess what looks right. This time the values are measured, not guessed. We took the top 1,000 domains from the Tranco list (pinned 2026-09-15), downloaded each homepage, parsed every box-shadow declaration in its shipped CSS, and counted what's actually in production.",
                        "The whole pipeline is reproducible: the list is pinned, the crawler and analyzer scripts live in this repo, and every measured value per site is downloadable as a CSV. No number in this article is hand-picked to make a point."
                ],
                "figure": "box-shadow-headline-stats"
        },
        {
                "heading": "How the measurement works",
                "paragraphs": [
                        "Each site's homepage was fetched over https with http fallback. From the served HTML we kept inline <style> blocks and linked stylesheets, up to 30 sheets per site or 8 MB per sheet, following inline @import one level deep. Sheet contents were parsed with the CSS tree parser; only box-shadow and the -webkit-box-shadow vendor twin were extracted.",
                        "Of 1,000 sampled domains, 533 served a homepage we could parse. The rest are accounted for, not hidden: 222 domains had no DNS record, 85 answered with an HTML bot-wall (403), 20 failed TLS hostname checks, 47 timed out, and the remainder split across 4xx/5xx statuses, connection resets, and certificate errors. Note the list includes shell-style pages and app entry points with no CSS at all — 28 of the 533 sites shipped no stylesheet to parse.",
                        "A declaration was counted when it appeared in the sheet. Identical -webkit-box-shadow and box-shadow pairs on the same rule collapse to one entry (3,531 such vendor twins), and values were deduplicated per site before the distinct-value counts. Shadows written entirely by JavaScript are out of scope by design.",
                        "The headline numbers below are px-space measurements: layers whose offsets, blur, and spread are all in px, laid out by the browser default font-size of 16px for typographic units (7 layers used rem and are reported separately). 3,216 declarations using other non-px units were measured for truthfulness but excluded from the pixel statistics."
                ]
        },
        {
                "heading": "Almost every top site ships a real shadow",
                "paragraphs": [
                        "427 of 533 parsed sites — 80.1% — ship at least one resolvable box-shadow on the homepage. 'none' exists too: 390 sites reset the effect somewhere, and with 5,301 none declarations it is the single most common value, ahead of every literal shadow. That reset is normal: frameworks null out a default box-shadow before adding their own, and some effects you see on the page come from elements the type selector misses.",
                        "From the 533 sites we collected 33,438 raw declarations, collapsing to 29,907 after dedupe and the vendor-twin merge. The distinct value set is 9,168 strings, and 5,596 of those are fully usable px values (or implemented in px after resolving their custom properties)."
                ]
        },
        {
                "heading": "Where the shadow sits",
                "paragraphs": [
                        "Site shadows are anchored to the box: 93.1% of the 21,887 measured layers use an X offset of exactly 0. Nothing drifts sideways in production CSS — even the most elaborate framework tokens keep X pinned.",
                        "Y is a real choice with two modes. 48.5% of layers sit exactly at y=0, and 50.2% push down by a small amount — the 75th percentile vertical offset is 3px. Upward shadows, the glow-below look, are a rounding error at 1.3% of layers. If you color an element but the background of the page is what should glow, write negative y — otherwise site data says: down a little, or straight down."
                ],
                "figure": "box-shadow-y-offset"
        },
        {
                "heading": "The blur is a lot smaller than the demos",
                "paragraphs": [
                        "Starter-kit demos blur at 10–25px. Production does not: 39.8% of layers ship blur 0 — those are the hard edges of focus rings and thin underlines — and among soft shadows the median blur is 3px, with the 75th percentile at 10px and the 90th at 24px.",
                        "The blur and the y-offset move together: when a site softens a shadow, it does so with a compact radius, not a fog bank. Values past ~40px blur exist but are the top of the tail."
                ],
                "figure": "box-shadow-blur"
        },
        {
                "heading": "Spread, inset, and the focus ring pattern",
                "paragraphs": [
                        "Spread defaults to none: 69.7% of layers carry spread 0. Positive spread (24%) mostly manufactures hard borders — the ring look — while negative spread (6.4%) shrinks the shadow to hug the box edge. Only 12.7% of layers are inset, and those cluster in a recognizable family: top-INSET pressed-button styles such as the Bootstrap classic inset 0 3px 5px rgba(0,0,0,.125).",
                        "What you actually see in the top values is the ability of spread to fake a border. The two most-shipped literal shadows in the whole sample are focus rings: 0 0 0 2px #fff (27 sites) and inset 0 0 0 2px #fff (18 sites) — white rings that read as borders without a border."
                ],
                "figure": "box-shadow-spread-inset"
        },
        {
                "heading": "Color: neutral, almost never opaque",
                "paragraphs": [
                        "The palette reads as one color: black at low opacity. 73.8% of measured layers are achromatic, and 74.9% have alpha at 0.3 or below, with the busiest bands at near-zero alpha (the largest single bucket is at or below 0.05) and at 0.1–0.15. Exactly-opaque shadows are rare — 21.3% of layers — and even those are mostly rings and utility borders, not depth shadows.",
                        "The syntax split is now hex-first: 11,453 layers (52.3%) write their color as hex such as #0000001a, and 9,585 (43.8%) as rgba(). The hex-in-alpha form carries the Tailwind token stream; HSL and named colors are negligible. Browsers default an omitted color to currentcolor, and that shows up too — 0.5% of layers lean on the default."
                ],
                "figure": "box-shadow-alpha"
        },
        {
                "heading": "One shadow, not a stack",
                "paragraphs": [
                        "A single layer is the default: 73.5% of the 14,517 shadowed declarations we could resolve use exactly one layer. Two layers cover 14.3%, and three or more just 12.2%. The stacks that do exist are token-driven, not art direction — the count climbs at 5–6 layers because Tailwind's ring utilities ship an inset-shadow plus a ring-offset-shadow plus a ring-shadow and their defaults as separate layers.",
                        "The tail is real but tame: one declaration reached 60 layers and another 142, both framework-table flowers that effectively render as archipelagos of nearly invisible rings."
                ],
                "figure": "box-shadow-layers"
        },
        {
                "heading": "The most-shipped values",
                "paragraphs": [
                        "This table ranks values by how many of the 533 sites ship them. The var() bundles are Tailwind's ring set and Bootstrap's button focus; the literals are dominated by ring-style hard shadows and small rgba drops. Material Design's canonical three-layer stack ships on 10 sites, and Google's two-layer variant on 9 — the stacks above are company templates, not the web-wide norm.",
                        "In the dataset, a row's 'declarations' column is how many times the value appeared across sheets; 'sites' is how many distinct domains placed it. kind records how we classified it: ok means the value stands as-is, global means it inherits meaning like inherit or unset, and varPartial marks values still holding a custom property after our resolution."
                ],
                "figure": "box-shadow-top-values"
        },
        {
                "heading": "A third of sites route shadows through custom properties",
                "paragraphs": [
                        "9,248 of the 33,438 raw declarations — 27.7% — reference a var(), and they spread wide: 260 of the 533 sites. Framework tokens are the reason: Tailwind accumulates five vars per ring declaration, and Bootstrap resolves its shades into --bs-*-box-shadow on the button.",
                        "We resolved 2,444 var() declarations to concrete pixels using only values the site itself defined: a same-rule definition first, then the sheet's :root, html, and universal selectors, then the fallback written inside the var() itself. Across those declarations, the variable lookups that succeeded split as 1,888 walked a root-level variable, 999 walked a rule-level variable, and 999 used the fallback inside the var(). A declaration can chain several lookups, so those three numbers add up to more lookups than declarations. The remainder stays honestly labelled var()-opaque — we do not guess at a site's runtime value."
                ]
        },
        {
                "heading": "The verdict table",
                "paragraphs": [
                        "Eight popular claims about box-shadow, graded against the measured set. 'Verdict' is GainUtility's conclusion — the numbers are yours to check."
                ],
                "table": {
                        "caption": "Six claims about box-shadow, graded against 21,887 measured layers.",
                        "columns": [
                                "Claim",
                                "What sites do (measured)",
                                "Verdict"
                        ],
                        "rows": [
                                [
                                        "Blur heavily for a soft modern look",
                                        "Median blur 3 px; 75th percentile 10 px; 39.8% of layers blur 0",
                                        "Only for big glows"
                                ],
                                [
                                        "Stack two–three layers like Material",
                                        "73.5% of declarations are a single layer; 3+ layers are 12.2%",
                                        "Only for design tokens"
                                ],
                                [
                                        "Offset down-and-right for depth",
                                        "Offset X is 0 on 93.1% of layers; Y is 0 on 48.5% and down on 50.2%",
                                        "Offset down — or not at all"
                                ],
                                [
                                        "Neutral color, low opacity",
                                        "73.8% achromatic; 74.9% at alpha ≤ 0.3; busiest bands ≤ 0.05 and 0.1–0.15",
                                        "Correct"
                                ],
                                [
                                        "Inset shadows are the depth staple",
                                        "Inset: 12.7% of layers, mostly pressed-button systems",
                                        "A deliberate choice, not the default"
                                ],
                                [
                                        "Upward (negative-Y) glow is common",
                                        "Negative Y offset: 1.3% of layers",
                                        "Rare"
                                ]
                        ]
                }
        },
        {
                "heading": "Limits you should know before quoting this",
                "list": [
                        "Coverage: 533 of 1,000 sampled domains resolved to a parseable homepage. The 467 gaps are enumerated in the methodology, not smoothed over — expect a western/heavy-platform skew in what remains.",
                        "Homepage only: marketing pages over-represent component kit CSS and under-represent the apps behind them. A <style>-less shell on the landing page (28 sites) says nothing about the product's tab styles.",
                        "Resolution: values resolved through custom properties only use what the site defined. A var() left opaque stays opaque — we count it under var()-opaque, excluded from px statistics.",
                        "Sheet caps: 30 sheets and 8 MB per sheet bound the crawl; styles layered in above those caps are absent. Served vs. computed: eases such as transition are out of scope, and a few effects are injected by JS toggling classes with id-less selectors we trimmed.",
                        "Date: the sample is a single day (list pinned 2026-09-15) and CSS moves; re-run the scripts for a fresh slice."
                ],
                "figure": "box-shadow-dataset"
        },
        {
                "heading": "How to use this in a design",
                "paragraphs": [
                        "Start every shadow from 0 0 (X and Y both zero). Move Y down by 1–4 px at most, keep blur in single digits for regular raises, and leave X alone. Write the color as black at an alpha between 0.08 and 0.3 — the measured sweet band — instead of a tint. Add a second layer only when a component token demands it, and treat inset like the pressed-state tool it is.",
                        "Two value shapes are worth adopting, because production validates them: the accessible focus ring 0 0 0 2px #fff (and its inset twin for filled backgrounds) — one of the most-shipped shadows in the whole sample — and the soft one-layer raise 0 1px 2px rgba(0,0,0,.1), which ships verbatim on sites like TinyURL and OpenStreetMap. The data ranks convention, not taste: a conventional shadow is what users read as normal, and that is the point of these defaults."
                ],
                "tool": {
                        "label": "Salin nilai produksi terukur dengan Generator Box Shadow.",
                        "toolId": "box-shadow-generator"
                }
        },
        {
                "pageLink": {
                        "label": "Baca artikel lengkap tentang nilai nyata box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Baca artikel lengkap tentang nilai nyata box-shadow"
                }
        }
]
    },
  },
  "box-shadow-vs-drop-shadow-filter": {
    "pt-br": {
      title: "box-shadow vs filter: drop-shadow() — qual sombra CSS escolher",
      description: "Entenda a diferença visual e de desempenho entre box-shadow e drop-shadow(): silhueta retangular vs canal alfa transparente.",
      readingTime: "6 min de leitura",
      tags: ["css","box-shadow","drop-shadow","svg","design"],
      categoryLabel: "Desenvolvedor",
      quickAnswer: "Use box-shadow para superfícies de interface (botões, cards, modais): ele segue a caixa de borda e aceita spread e inset. Use filter: drop-shadow() para formas com transparência (PNG recortado, SVG) pois ele projeta a sombra seguindo o canal alfa.",
      keyTakeaway: "Escolha pela silhueta: box-shadow para caixas retangulares (com suporte a spread e inset) e drop-shadow() para formas transparentes como ícones SVG.",
      toolCta: {"label":"Construa sombras visualmente com camadas, inset e preview ao vivo.","toolId":"box-shadow-generator"},
      seoTitle: "box-shadow vs drop-shadow() em CSS | Guia Comparativo | GainUtility",
      seoDescription: "Diferença entre box-shadow e filter: drop-shadow() no CSS: sintaxe, renderização de canal alfa, raios de desfoque e quando usar cada um.",
      content: [
        {
                "paragraphs": [
                        "CSS gives you three shadow primitives, and the choice between them is decided by one question: what shape should the shadow have? box-shadow shadows the element's box, text-shadow shadows each glyph, and filter: drop-shadow() shadows whatever pixels the element actually paints. The last two look like competitors, but they answer different questions — and copying a value from one to the other quietly changes how it renders.",
                        "Both demos below use the same transparent star image. The first applies box-shadow to the image element; the second applies filter: drop-shadow() to it. Watch where the shadow comes from."
                ]
        },
        {
                "heading": "Same element, different silhouette"
        },
        {
                "shadowDemo": {
                        "label": "box-shadow on a transparent image — a rectangle behind the whole box",
                        "property": "box-shadow",
                        "value": "0 8px 16px rgba(16, 24, 40, 0.25)",
                        "star": true
                }
        },
        {
                "shadowDemo": {
                        "label": "filter: drop-shadow() on the same image — the shadow follows the star",
                        "property": "filter",
                        "value": "drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25))",
                        "star": true
                }
        },
        {
                "paragraphs": [
                        "box-shadow is drawn from the border box, so it ignores transparency inside the element and fills the rectangle behind it — rounded if border-radius says so. drop-shadow() blurs and offsets the element's alpha mask, so the shadow only appears where the star's pixels do. On a fully opaque card both look nearly identical; on anything transparent they are completely different effects."
                ]
        },
        {
                "heading": "What each one accepts"
        },
        {
                "table": {
                        "caption": "box-shadow, text-shadow, and drop-shadow() side by side.",
                        "columns": [
                                "",
                                "box-shadow",
                                "text-shadow",
                                "filter: drop-shadow()"
                        ],
                        "rows": [
                                [
                                        "Silhouette",
                                        "Border box (border-radius applies)",
                                        "Every glyph's outline",
                                        "Element's alpha shape (pixels)"
                                ],
                                [
                                        "Offsets",
                                        "X and Y",
                                        "X and Y",
                                        "X and Y"
                                ],
                                [
                                        "Blur",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Gaussian standard deviation (σ)"
                                ],
                                [
                                        "Spread",
                                        "Yes — 4th length",
                                        "No",
                                        "No"
                                ],
                                [
                                        "inset",
                                        "Yes",
                                        "No",
                                        "No"
                                ],
                                [
                                        "Multiple layers",
                                        "Comma-separated, first paints on top",
                                        "Comma-separated, first paints on top",
                                        "Chain functions: drop-shadow() drop-shadow()"
                                ],
                                [
                                        "Where it applies",
                                        "Any box-level element",
                                        "Text content",
                                        "Any element, via the filter property"
                                ]
                        ]
                }
        },
        {
                "heading": "The blur number does not transfer"
        },
        {
                "paragraphs": [
                        "This is the trap. box-shadow defines its blur radius so that the painted transition spans roughly that many pixels — per spec it is twice the standard deviation of the underlying Gaussian. drop-shadow() takes that standard deviation directly as its third length. The Filter Effects spec flags it: values are interpreted as for box-shadow, but the third value is the standard deviation, not the blur radius.",
                        "So filter: drop-shadow(0 4px 8px black) and box-shadow: 0 4px 8px black do not match — the filter version is twice as blurry. To port a box-shadow, halve the blur; to port a drop-shadow, double it. Offsets are literal in both, so only the third number moves."
                ],
                "code": {
                        "label": "Equivalent pair — same visual blur",
                        "content": "box-shadow: 0 4px 16px rgba(16, 24, 40, 0.25);\nfilter: drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25));"
                }
        },
        {
                "heading": "Layers behave differently too"
        },
        {
                "paragraphs": [
                        "box-shadow layers are peers in one list: each paints independently, first listed on top, so a crisp ring can sit above a soft drop in a single declaration. drop-shadow() has no comma list — the spec for this level accepts no spread and no multiple shadows. You can chain functions (filter: drop-shadow(...) drop-shadow(...)), but chained filters apply in sequence to the output of the previous one, so the second shadow falls on the first shadow's result rather than painting as a separate sheet.",
                        "inset is equally unavailable: a filter cannot draw inside the border box. Pressed wells, recessed inputs, and the dark half of soft-UI surfaces are box-shadow-only territory."
                ]
        },
        {
                "heading": "A practical rule"
        },
        {
                "list": [
                        "Cards, buttons, panels, inputs — anything rectangular or border-radius'd — box-shadow. It gives you spread for rings, inset for pressed states, and comma layers for contact-plus-ambient depth.",
                        "PNG cut-outs, SVG icons, masked shapes, emoji — drop-shadow(), because the silhouette should follow the artwork, not its bounding rectangle.",
                        "Headlines and labels — text-shadow, which traces the glyphs and works without filters.",
                        "Focus rings — box-shadow with zero blur and a spread (0 0 0 2px), one of the most-shipped shadows in our measurement of top-1,000 sites."
                ]
        },
        {
                "pageLink": {
                        "label": "Ver o artigo completo sobre valores reais de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Ver o artigo completo sobre valores reais de box-shadow"
                }
        },
        {
                "heading": "What about cost?"
        },
        {
                "paragraphs": [
                        "A filter operates on rendered pixels: when the element or its shadow changes, the browser re-renders the filtered layer. box-shadow participates in normal element painting. For static UI the difference is not something you will feel, but it is one reason drop-shadow() is not a drop-in upgrade for every card — reach for it when the shape demands it, not as a default. Honesty first: measure if you have a real problem, and skip the folklore benchmarks otherwise."
                ]
        }
]
    },
    "es-mx": {
      title: "box-shadow vs filter: drop-shadow() — qué sombra CSS usar",
      description: "Comprende la diferencia visual y técnica entre box-shadow y drop-shadow(): silueta de caja vs canal alfa transparente.",
      readingTime: "6 min de lectura",
      tags: ["css","box-shadow","drop-shadow","svg","diseño"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Usa box-shadow para elementos de interfaz: sigue la caja de borde, admite spread e inset. Usa filter: drop-shadow() para formas transparentes (recortes PNG, iconos SVG) porque proyecta la sombra sobre el canal alfa real.",
      keyTakeaway: "Elige según la silueta: box-shadow para rectángulos y tarjetas, drop-shadow() para siluetas transparentes y elementos SVG.",
      toolCta: {"label":"Crea sombras visualmente con capas, inset y vista previa en vivo.","toolId":"box-shadow-generator"},
      seoTitle: "box-shadow vs filter: drop-shadow() en CSS | GainUtility",
      seoDescription: "Aprende cuándo usar box-shadow o filter: drop-shadow() en CSS: comportamiento de blur, soporte de spread y sombras en elementos transparentes.",
      content: [
        {
                "paragraphs": [
                        "CSS gives you three shadow primitives, and the choice between them is decided by one question: what shape should the shadow have? box-shadow shadows the element's box, text-shadow shadows each glyph, and filter: drop-shadow() shadows whatever pixels the element actually paints. The last two look like competitors, but they answer different questions — and copying a value from one to the other quietly changes how it renders.",
                        "Both demos below use the same transparent star image. The first applies box-shadow to the image element; the second applies filter: drop-shadow() to it. Watch where the shadow comes from."
                ]
        },
        {
                "heading": "Same element, different silhouette"
        },
        {
                "shadowDemo": {
                        "label": "box-shadow on a transparent image — a rectangle behind the whole box",
                        "property": "box-shadow",
                        "value": "0 8px 16px rgba(16, 24, 40, 0.25)",
                        "star": true
                }
        },
        {
                "shadowDemo": {
                        "label": "filter: drop-shadow() on the same image — the shadow follows the star",
                        "property": "filter",
                        "value": "drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25))",
                        "star": true
                }
        },
        {
                "paragraphs": [
                        "box-shadow is drawn from the border box, so it ignores transparency inside the element and fills the rectangle behind it — rounded if border-radius says so. drop-shadow() blurs and offsets the element's alpha mask, so the shadow only appears where the star's pixels do. On a fully opaque card both look nearly identical; on anything transparent they are completely different effects."
                ]
        },
        {
                "heading": "What each one accepts"
        },
        {
                "table": {
                        "caption": "box-shadow, text-shadow, and drop-shadow() side by side.",
                        "columns": [
                                "",
                                "box-shadow",
                                "text-shadow",
                                "filter: drop-shadow()"
                        ],
                        "rows": [
                                [
                                        "Silhouette",
                                        "Border box (border-radius applies)",
                                        "Every glyph's outline",
                                        "Element's alpha shape (pixels)"
                                ],
                                [
                                        "Offsets",
                                        "X and Y",
                                        "X and Y",
                                        "X and Y"
                                ],
                                [
                                        "Blur",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Gaussian standard deviation (σ)"
                                ],
                                [
                                        "Spread",
                                        "Yes — 4th length",
                                        "No",
                                        "No"
                                ],
                                [
                                        "inset",
                                        "Yes",
                                        "No",
                                        "No"
                                ],
                                [
                                        "Multiple layers",
                                        "Comma-separated, first paints on top",
                                        "Comma-separated, first paints on top",
                                        "Chain functions: drop-shadow() drop-shadow()"
                                ],
                                [
                                        "Where it applies",
                                        "Any box-level element",
                                        "Text content",
                                        "Any element, via the filter property"
                                ]
                        ]
                }
        },
        {
                "heading": "The blur number does not transfer"
        },
        {
                "paragraphs": [
                        "This is the trap. box-shadow defines its blur radius so that the painted transition spans roughly that many pixels — per spec it is twice the standard deviation of the underlying Gaussian. drop-shadow() takes that standard deviation directly as its third length. The Filter Effects spec flags it: values are interpreted as for box-shadow, but the third value is the standard deviation, not the blur radius.",
                        "So filter: drop-shadow(0 4px 8px black) and box-shadow: 0 4px 8px black do not match — the filter version is twice as blurry. To port a box-shadow, halve the blur; to port a drop-shadow, double it. Offsets are literal in both, so only the third number moves."
                ],
                "code": {
                        "label": "Equivalent pair — same visual blur",
                        "content": "box-shadow: 0 4px 16px rgba(16, 24, 40, 0.25);\nfilter: drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25));"
                }
        },
        {
                "heading": "Layers behave differently too"
        },
        {
                "paragraphs": [
                        "box-shadow layers are peers in one list: each paints independently, first listed on top, so a crisp ring can sit above a soft drop in a single declaration. drop-shadow() has no comma list — the spec for this level accepts no spread and no multiple shadows. You can chain functions (filter: drop-shadow(...) drop-shadow(...)), but chained filters apply in sequence to the output of the previous one, so the second shadow falls on the first shadow's result rather than painting as a separate sheet.",
                        "inset is equally unavailable: a filter cannot draw inside the border box. Pressed wells, recessed inputs, and the dark half of soft-UI surfaces are box-shadow-only territory."
                ]
        },
        {
                "heading": "A practical rule"
        },
        {
                "list": [
                        "Cards, buttons, panels, inputs — anything rectangular or border-radius'd — box-shadow. It gives you spread for rings, inset for pressed states, and comma layers for contact-plus-ambient depth.",
                        "PNG cut-outs, SVG icons, masked shapes, emoji — drop-shadow(), because the silhouette should follow the artwork, not its bounding rectangle.",
                        "Headlines and labels — text-shadow, which traces the glyphs and works without filters.",
                        "Focus rings — box-shadow with zero blur and a spread (0 0 0 2px), one of the most-shipped shadows in our measurement of top-1,000 sites."
                ]
        },
        {
                "pageLink": {
                        "label": "Ver el artículo completo sobre valores reales de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Ver el artículo completo sobre valores reales de box-shadow"
                }
        },
        {
                "heading": "What about cost?"
        },
        {
                "paragraphs": [
                        "A filter operates on rendered pixels: when the element or its shadow changes, the browser re-renders the filtered layer. box-shadow participates in normal element painting. For static UI the difference is not something you will feel, but it is one reason drop-shadow() is not a drop-in upgrade for every card — reach for it when the shape demands it, not as a default. Honesty first: measure if you have a real problem, and skip the folklore benchmarks otherwise."
                ]
        }
]
    },
    "es-co": {
      title: "box-shadow vs filter: drop-shadow() — qué sombra CSS usar",
      description: "Comprende la diferencia visual y técnica entre box-shadow y drop-shadow(): silueta de caja vs canal alfa transparente.",
      readingTime: "6 min de lectura",
      tags: ["css","box-shadow","drop-shadow","svg","diseño"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Usa box-shadow para elementos de interfaz: sigue la caja de borde, admite spread e inset. Usa filter: drop-shadow() para formas transparentes (recortes PNG, iconos SVG) porque proyecta la sombra sobre el canal alfa real.",
      keyTakeaway: "Elige según la silueta: box-shadow para rectángulos y tarjetas, drop-shadow() para siluetas transparentes y elementos SVG.",
      toolCta: {"label":"Crea sombras visualmente con capas, inset y vista previa en vivo.","toolId":"box-shadow-generator"},
      seoTitle: "box-shadow vs filter: drop-shadow() en CSS | GainUtility",
      seoDescription: "Aprende cuándo usar box-shadow o filter: drop-shadow() en CSS: comportamiento de blur, soporte de spread y sombras en elementos transparentes.",
      content: [
        {
                "paragraphs": [
                        "CSS gives you three shadow primitives, and the choice between them is decided by one question: what shape should the shadow have? box-shadow shadows the element's box, text-shadow shadows each glyph, and filter: drop-shadow() shadows whatever pixels the element actually paints. The last two look like competitors, but they answer different questions — and copying a value from one to the other quietly changes how it renders.",
                        "Both demos below use the same transparent star image. The first applies box-shadow to the image element; the second applies filter: drop-shadow() to it. Watch where the shadow comes from."
                ]
        },
        {
                "heading": "Same element, different silhouette"
        },
        {
                "shadowDemo": {
                        "label": "box-shadow on a transparent image — a rectangle behind the whole box",
                        "property": "box-shadow",
                        "value": "0 8px 16px rgba(16, 24, 40, 0.25)",
                        "star": true
                }
        },
        {
                "shadowDemo": {
                        "label": "filter: drop-shadow() on the same image — the shadow follows the star",
                        "property": "filter",
                        "value": "drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25))",
                        "star": true
                }
        },
        {
                "paragraphs": [
                        "box-shadow is drawn from the border box, so it ignores transparency inside the element and fills the rectangle behind it — rounded if border-radius says so. drop-shadow() blurs and offsets the element's alpha mask, so the shadow only appears where the star's pixels do. On a fully opaque card both look nearly identical; on anything transparent they are completely different effects."
                ]
        },
        {
                "heading": "What each one accepts"
        },
        {
                "table": {
                        "caption": "box-shadow, text-shadow, and drop-shadow() side by side.",
                        "columns": [
                                "",
                                "box-shadow",
                                "text-shadow",
                                "filter: drop-shadow()"
                        ],
                        "rows": [
                                [
                                        "Silhouette",
                                        "Border box (border-radius applies)",
                                        "Every glyph's outline",
                                        "Element's alpha shape (pixels)"
                                ],
                                [
                                        "Offsets",
                                        "X and Y",
                                        "X and Y",
                                        "X and Y"
                                ],
                                [
                                        "Blur",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Gaussian standard deviation (σ)"
                                ],
                                [
                                        "Spread",
                                        "Yes — 4th length",
                                        "No",
                                        "No"
                                ],
                                [
                                        "inset",
                                        "Yes",
                                        "No",
                                        "No"
                                ],
                                [
                                        "Multiple layers",
                                        "Comma-separated, first paints on top",
                                        "Comma-separated, first paints on top",
                                        "Chain functions: drop-shadow() drop-shadow()"
                                ],
                                [
                                        "Where it applies",
                                        "Any box-level element",
                                        "Text content",
                                        "Any element, via the filter property"
                                ]
                        ]
                }
        },
        {
                "heading": "The blur number does not transfer"
        },
        {
                "paragraphs": [
                        "This is the trap. box-shadow defines its blur radius so that the painted transition spans roughly that many pixels — per spec it is twice the standard deviation of the underlying Gaussian. drop-shadow() takes that standard deviation directly as its third length. The Filter Effects spec flags it: values are interpreted as for box-shadow, but the third value is the standard deviation, not the blur radius.",
                        "So filter: drop-shadow(0 4px 8px black) and box-shadow: 0 4px 8px black do not match — the filter version is twice as blurry. To port a box-shadow, halve the blur; to port a drop-shadow, double it. Offsets are literal in both, so only the third number moves."
                ],
                "code": {
                        "label": "Equivalent pair — same visual blur",
                        "content": "box-shadow: 0 4px 16px rgba(16, 24, 40, 0.25);\nfilter: drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25));"
                }
        },
        {
                "heading": "Layers behave differently too"
        },
        {
                "paragraphs": [
                        "box-shadow layers are peers in one list: each paints independently, first listed on top, so a crisp ring can sit above a soft drop in a single declaration. drop-shadow() has no comma list — the spec for this level accepts no spread and no multiple shadows. You can chain functions (filter: drop-shadow(...) drop-shadow(...)), but chained filters apply in sequence to the output of the previous one, so the second shadow falls on the first shadow's result rather than painting as a separate sheet.",
                        "inset is equally unavailable: a filter cannot draw inside the border box. Pressed wells, recessed inputs, and the dark half of soft-UI surfaces are box-shadow-only territory."
                ]
        },
        {
                "heading": "A practical rule"
        },
        {
                "list": [
                        "Cards, buttons, panels, inputs — anything rectangular or border-radius'd — box-shadow. It gives you spread for rings, inset for pressed states, and comma layers for contact-plus-ambient depth.",
                        "PNG cut-outs, SVG icons, masked shapes, emoji — drop-shadow(), because the silhouette should follow the artwork, not its bounding rectangle.",
                        "Headlines and labels — text-shadow, which traces the glyphs and works without filters.",
                        "Focus rings — box-shadow with zero blur and a spread (0 0 0 2px), one of the most-shipped shadows in our measurement of top-1,000 sites."
                ]
        },
        {
                "pageLink": {
                        "label": "Ver el artículo completo sobre valores reales de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Ver el artículo completo sobre valores reales de box-shadow"
                }
        },
        {
                "heading": "What about cost?"
        },
        {
                "paragraphs": [
                        "A filter operates on rendered pixels: when the element or its shadow changes, the browser re-renders the filtered layer. box-shadow participates in normal element painting. For static UI the difference is not something you will feel, but it is one reason drop-shadow() is not a drop-in upgrade for every card — reach for it when the shape demands it, not as a default. Honesty first: measure if you have a real problem, and skip the folklore benchmarks otherwise."
                ]
        }
]
    },
    "de": {
      title: "box-shadow vs filter: drop-shadow() — Welcher CSS-Schatten wann passt",
      description: "Verstehen Sie den visuellen Unterschied: Rechteckige Randbox (box-shadow) versus Alphakanal-Transparenz (filter: drop-shadow).",
      readingTime: "6 Min. Lesezeit",
      tags: ["css","box-shadow","drop-shadow","svg","webdesign"],
      categoryLabel: "Entwickler",
      quickAnswer: "Verwenden Sie box-shadow für UI-Karten und Buttons: Es folgt der Border-Box, unterstützt Spread und Inset. Nutzen Sie filter: drop-shadow() für transparente Grafiken (PNGs, SVGs), da der Schatten der Kontur folgt.",
      keyTakeaway: "Wählen Sie nach Kontur: box-shadow für reguläre Boxen; drop-shadow() für freigestellte Bilder und Icons mit Alpha-Kanal.",
      toolCta: {"label":"Erstellen Sie CSS-Schatten visuell mit Ebenen und Live-Vorschau.","toolId":"box-shadow-generator"},
      seoTitle: "box-shadow vs filter: drop-shadow() im CSS-Vergleich | GainUtility",
      seoDescription: "Der Unterschied zwischen box-shadow und drop-shadow() in CSS: Syntax, Weichzeichnung, Performance und Transparenz-Unterstützung.",
      content: [
        {
                "paragraphs": [
                        "CSS gives you three shadow primitives, and the choice between them is decided by one question: what shape should the shadow have? box-shadow shadows the element's box, text-shadow shadows each glyph, and filter: drop-shadow() shadows whatever pixels the element actually paints. The last two look like competitors, but they answer different questions — and copying a value from one to the other quietly changes how it renders.",
                        "Both demos below use the same transparent star image. The first applies box-shadow to the image element; the second applies filter: drop-shadow() to it. Watch where the shadow comes from."
                ]
        },
        {
                "heading": "Same element, different silhouette"
        },
        {
                "shadowDemo": {
                        "label": "box-shadow on a transparent image — a rectangle behind the whole box",
                        "property": "box-shadow",
                        "value": "0 8px 16px rgba(16, 24, 40, 0.25)",
                        "star": true
                }
        },
        {
                "shadowDemo": {
                        "label": "filter: drop-shadow() on the same image — the shadow follows the star",
                        "property": "filter",
                        "value": "drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25))",
                        "star": true
                }
        },
        {
                "paragraphs": [
                        "box-shadow is drawn from the border box, so it ignores transparency inside the element and fills the rectangle behind it — rounded if border-radius says so. drop-shadow() blurs and offsets the element's alpha mask, so the shadow only appears where the star's pixels do. On a fully opaque card both look nearly identical; on anything transparent they are completely different effects."
                ]
        },
        {
                "heading": "What each one accepts"
        },
        {
                "table": {
                        "caption": "box-shadow, text-shadow, and drop-shadow() side by side.",
                        "columns": [
                                "",
                                "box-shadow",
                                "text-shadow",
                                "filter: drop-shadow()"
                        ],
                        "rows": [
                                [
                                        "Silhouette",
                                        "Border box (border-radius applies)",
                                        "Every glyph's outline",
                                        "Element's alpha shape (pixels)"
                                ],
                                [
                                        "Offsets",
                                        "X and Y",
                                        "X and Y",
                                        "X and Y"
                                ],
                                [
                                        "Blur",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Gaussian standard deviation (σ)"
                                ],
                                [
                                        "Spread",
                                        "Yes — 4th length",
                                        "No",
                                        "No"
                                ],
                                [
                                        "inset",
                                        "Yes",
                                        "No",
                                        "No"
                                ],
                                [
                                        "Multiple layers",
                                        "Comma-separated, first paints on top",
                                        "Comma-separated, first paints on top",
                                        "Chain functions: drop-shadow() drop-shadow()"
                                ],
                                [
                                        "Where it applies",
                                        "Any box-level element",
                                        "Text content",
                                        "Any element, via the filter property"
                                ]
                        ]
                }
        },
        {
                "heading": "The blur number does not transfer"
        },
        {
                "paragraphs": [
                        "This is the trap. box-shadow defines its blur radius so that the painted transition spans roughly that many pixels — per spec it is twice the standard deviation of the underlying Gaussian. drop-shadow() takes that standard deviation directly as its third length. The Filter Effects spec flags it: values are interpreted as for box-shadow, but the third value is the standard deviation, not the blur radius.",
                        "So filter: drop-shadow(0 4px 8px black) and box-shadow: 0 4px 8px black do not match — the filter version is twice as blurry. To port a box-shadow, halve the blur; to port a drop-shadow, double it. Offsets are literal in both, so only the third number moves."
                ],
                "code": {
                        "label": "Equivalent pair — same visual blur",
                        "content": "box-shadow: 0 4px 16px rgba(16, 24, 40, 0.25);\nfilter: drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25));"
                }
        },
        {
                "heading": "Layers behave differently too"
        },
        {
                "paragraphs": [
                        "box-shadow layers are peers in one list: each paints independently, first listed on top, so a crisp ring can sit above a soft drop in a single declaration. drop-shadow() has no comma list — the spec for this level accepts no spread and no multiple shadows. You can chain functions (filter: drop-shadow(...) drop-shadow(...)), but chained filters apply in sequence to the output of the previous one, so the second shadow falls on the first shadow's result rather than painting as a separate sheet.",
                        "inset is equally unavailable: a filter cannot draw inside the border box. Pressed wells, recessed inputs, and the dark half of soft-UI surfaces are box-shadow-only territory."
                ]
        },
        {
                "heading": "A practical rule"
        },
        {
                "list": [
                        "Cards, buttons, panels, inputs — anything rectangular or border-radius'd — box-shadow. It gives you spread for rings, inset for pressed states, and comma layers for contact-plus-ambient depth.",
                        "PNG cut-outs, SVG icons, masked shapes, emoji — drop-shadow(), because the silhouette should follow the artwork, not its bounding rectangle.",
                        "Headlines and labels — text-shadow, which traces the glyphs and works without filters.",
                        "Focus rings — box-shadow with zero blur and a spread (0 0 0 2px), one of the most-shipped shadows in our measurement of top-1,000 sites."
                ]
        },
        {
                "pageLink": {
                        "label": "Den vollständigen Artikel über reale box-shadow-Werte lesen",
                        "path": "/css/box-shadow",
                        "text": "Den vollständigen Artikel über reale box-shadow-Werte lesen"
                }
        },
        {
                "heading": "What about cost?"
        },
        {
                "paragraphs": [
                        "A filter operates on rendered pixels: when the element or its shadow changes, the browser re-renders the filtered layer. box-shadow participates in normal element painting. For static UI the difference is not something you will feel, but it is one reason drop-shadow() is not a drop-in upgrade for every card — reach for it when the shape demands it, not as a default. Honesty first: measure if you have a real problem, and skip the folklore benchmarks otherwise."
                ]
        }
]
    },
    "fr": {
      title: "box-shadow vs filter: drop-shadow() — quelle ombre CSS utiliser",
      description: "Comprenez la différence visuelle et technique : ombre portée sur boîte rectangulaire vs ombre sur canal alpha transparent.",
      readingTime: "6 min de lecture",
      tags: ["css","box-shadow","drop-shadow","svg","design"],
      categoryLabel: "Développeur",
      quickAnswer: "Utilisez box-shadow pour les conteneurs d'interface (cartes, boutons, modales) : il suit le border-box et gère spread et inset. Utilisez filter: drop-shadow() pour les formes transparentes (icônes SVG, images détourées).",
      keyTakeaway: "Choisissez selon la forme : box-shadow pour les blocs rectangulaires, drop-shadow() pour les éléments transparents et les tracés SVG.",
      toolCta: {"label":"Générez des ombres visuellement avec calques, inset et aperçu en temps réel.","toolId":"box-shadow-generator"},
      seoTitle: "box-shadow vs filter: drop-shadow() en CSS | GainUtility",
      seoDescription: "Comparatif complet entre box-shadow et filter: drop-shadow() en CSS : gestion de la transparence, rayon de flou et cas d'usage.",
      content: [
        {
                "paragraphs": [
                        "CSS gives you three shadow primitives, and the choice between them is decided by one question: what shape should the shadow have? box-shadow shadows the element's box, text-shadow shadows each glyph, and filter: drop-shadow() shadows whatever pixels the element actually paints. The last two look like competitors, but they answer different questions — and copying a value from one to the other quietly changes how it renders.",
                        "Both demos below use the same transparent star image. The first applies box-shadow to the image element; the second applies filter: drop-shadow() to it. Watch where the shadow comes from."
                ]
        },
        {
                "heading": "Same element, different silhouette"
        },
        {
                "shadowDemo": {
                        "label": "box-shadow on a transparent image — a rectangle behind the whole box",
                        "property": "box-shadow",
                        "value": "0 8px 16px rgba(16, 24, 40, 0.25)",
                        "star": true
                }
        },
        {
                "shadowDemo": {
                        "label": "filter: drop-shadow() on the same image — the shadow follows the star",
                        "property": "filter",
                        "value": "drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25))",
                        "star": true
                }
        },
        {
                "paragraphs": [
                        "box-shadow is drawn from the border box, so it ignores transparency inside the element and fills the rectangle behind it — rounded if border-radius says so. drop-shadow() blurs and offsets the element's alpha mask, so the shadow only appears where the star's pixels do. On a fully opaque card both look nearly identical; on anything transparent they are completely different effects."
                ]
        },
        {
                "heading": "What each one accepts"
        },
        {
                "table": {
                        "caption": "box-shadow, text-shadow, and drop-shadow() side by side.",
                        "columns": [
                                "",
                                "box-shadow",
                                "text-shadow",
                                "filter: drop-shadow()"
                        ],
                        "rows": [
                                [
                                        "Silhouette",
                                        "Border box (border-radius applies)",
                                        "Every glyph's outline",
                                        "Element's alpha shape (pixels)"
                                ],
                                [
                                        "Offsets",
                                        "X and Y",
                                        "X and Y",
                                        "X and Y"
                                ],
                                [
                                        "Blur",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Gaussian standard deviation (σ)"
                                ],
                                [
                                        "Spread",
                                        "Yes — 4th length",
                                        "No",
                                        "No"
                                ],
                                [
                                        "inset",
                                        "Yes",
                                        "No",
                                        "No"
                                ],
                                [
                                        "Multiple layers",
                                        "Comma-separated, first paints on top",
                                        "Comma-separated, first paints on top",
                                        "Chain functions: drop-shadow() drop-shadow()"
                                ],
                                [
                                        "Where it applies",
                                        "Any box-level element",
                                        "Text content",
                                        "Any element, via the filter property"
                                ]
                        ]
                }
        },
        {
                "heading": "The blur number does not transfer"
        },
        {
                "paragraphs": [
                        "This is the trap. box-shadow defines its blur radius so that the painted transition spans roughly that many pixels — per spec it is twice the standard deviation of the underlying Gaussian. drop-shadow() takes that standard deviation directly as its third length. The Filter Effects spec flags it: values are interpreted as for box-shadow, but the third value is the standard deviation, not the blur radius.",
                        "So filter: drop-shadow(0 4px 8px black) and box-shadow: 0 4px 8px black do not match — the filter version is twice as blurry. To port a box-shadow, halve the blur; to port a drop-shadow, double it. Offsets are literal in both, so only the third number moves."
                ],
                "code": {
                        "label": "Equivalent pair — same visual blur",
                        "content": "box-shadow: 0 4px 16px rgba(16, 24, 40, 0.25);\nfilter: drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25));"
                }
        },
        {
                "heading": "Layers behave differently too"
        },
        {
                "paragraphs": [
                        "box-shadow layers are peers in one list: each paints independently, first listed on top, so a crisp ring can sit above a soft drop in a single declaration. drop-shadow() has no comma list — the spec for this level accepts no spread and no multiple shadows. You can chain functions (filter: drop-shadow(...) drop-shadow(...)), but chained filters apply in sequence to the output of the previous one, so the second shadow falls on the first shadow's result rather than painting as a separate sheet.",
                        "inset is equally unavailable: a filter cannot draw inside the border box. Pressed wells, recessed inputs, and the dark half of soft-UI surfaces are box-shadow-only territory."
                ]
        },
        {
                "heading": "A practical rule"
        },
        {
                "list": [
                        "Cards, buttons, panels, inputs — anything rectangular or border-radius'd — box-shadow. It gives you spread for rings, inset for pressed states, and comma layers for contact-plus-ambient depth.",
                        "PNG cut-outs, SVG icons, masked shapes, emoji — drop-shadow(), because the silhouette should follow the artwork, not its bounding rectangle.",
                        "Headlines and labels — text-shadow, which traces the glyphs and works without filters.",
                        "Focus rings — box-shadow with zero blur and a spread (0 0 0 2px), one of the most-shipped shadows in our measurement of top-1,000 sites."
                ]
        },
        {
                "pageLink": {
                        "label": "Consulter l'article complet sur les vraies valeurs de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Consulter l'article complet sur les vraies valeurs de box-shadow"
                }
        },
        {
                "heading": "What about cost?"
        },
        {
                "paragraphs": [
                        "A filter operates on rendered pixels: when the element or its shadow changes, the browser re-renders the filtered layer. box-shadow participates in normal element painting. For static UI the difference is not something you will feel, but it is one reason drop-shadow() is not a drop-in upgrade for every card — reach for it when the shape demands it, not as a default. Honesty first: measure if you have a real problem, and skip the folklore benchmarks otherwise."
                ]
        }
]
    },
    "it": {
      title: "box-shadow vs filter: drop-shadow() — quale ombra CSS utilizzare",
      description: "Comprendi la differenza tra box-shadow e drop-shadow(): rettangolo di delimitazione vs canale alfa trasparente.",
      readingTime: "6 min di lettura",
      tags: ["css","box-shadow","drop-shadow","svg","design"],
      categoryLabel: "Sviluppatore",
      quickAnswer: "Usa box-shadow per superfici UI: rispetta il border-box e supporta spread e inset. Usa filter: drop-shadow() per immagini con trasparenza o icone SVG, proiettando l'ombra lungo i contorni reali.",
      keyTakeaway: "Scegli in base alla silhouette: box-shadow per schede e pulsanti, drop-shadow() per grafiche trasparenti e SVG.",
      toolCta: {"label":"Crea box-shadow visivamente con livelli multipli e anteprima dal vivo.","toolId":"box-shadow-generator"},
      seoTitle: "box-shadow vs filter: drop-shadow() in CSS | GainUtility",
      seoDescription: "Differenze chiave tra box-shadow e filter: drop-shadow() in CSS: gestione dell'alpha, diffusione, calcolo del blur e prestazioni.",
      content: [
        {
                "paragraphs": [
                        "CSS gives you three shadow primitives, and the choice between them is decided by one question: what shape should the shadow have? box-shadow shadows the element's box, text-shadow shadows each glyph, and filter: drop-shadow() shadows whatever pixels the element actually paints. The last two look like competitors, but they answer different questions — and copying a value from one to the other quietly changes how it renders.",
                        "Both demos below use the same transparent star image. The first applies box-shadow to the image element; the second applies filter: drop-shadow() to it. Watch where the shadow comes from."
                ]
        },
        {
                "heading": "Same element, different silhouette"
        },
        {
                "shadowDemo": {
                        "label": "box-shadow on a transparent image — a rectangle behind the whole box",
                        "property": "box-shadow",
                        "value": "0 8px 16px rgba(16, 24, 40, 0.25)",
                        "star": true
                }
        },
        {
                "shadowDemo": {
                        "label": "filter: drop-shadow() on the same image — the shadow follows the star",
                        "property": "filter",
                        "value": "drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25))",
                        "star": true
                }
        },
        {
                "paragraphs": [
                        "box-shadow is drawn from the border box, so it ignores transparency inside the element and fills the rectangle behind it — rounded if border-radius says so. drop-shadow() blurs and offsets the element's alpha mask, so the shadow only appears where the star's pixels do. On a fully opaque card both look nearly identical; on anything transparent they are completely different effects."
                ]
        },
        {
                "heading": "What each one accepts"
        },
        {
                "table": {
                        "caption": "box-shadow, text-shadow, and drop-shadow() side by side.",
                        "columns": [
                                "",
                                "box-shadow",
                                "text-shadow",
                                "filter: drop-shadow()"
                        ],
                        "rows": [
                                [
                                        "Silhouette",
                                        "Border box (border-radius applies)",
                                        "Every glyph's outline",
                                        "Element's alpha shape (pixels)"
                                ],
                                [
                                        "Offsets",
                                        "X and Y",
                                        "X and Y",
                                        "X and Y"
                                ],
                                [
                                        "Blur",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Gaussian standard deviation (σ)"
                                ],
                                [
                                        "Spread",
                                        "Yes — 4th length",
                                        "No",
                                        "No"
                                ],
                                [
                                        "inset",
                                        "Yes",
                                        "No",
                                        "No"
                                ],
                                [
                                        "Multiple layers",
                                        "Comma-separated, first paints on top",
                                        "Comma-separated, first paints on top",
                                        "Chain functions: drop-shadow() drop-shadow()"
                                ],
                                [
                                        "Where it applies",
                                        "Any box-level element",
                                        "Text content",
                                        "Any element, via the filter property"
                                ]
                        ]
                }
        },
        {
                "heading": "The blur number does not transfer"
        },
        {
                "paragraphs": [
                        "This is the trap. box-shadow defines its blur radius so that the painted transition spans roughly that many pixels — per spec it is twice the standard deviation of the underlying Gaussian. drop-shadow() takes that standard deviation directly as its third length. The Filter Effects spec flags it: values are interpreted as for box-shadow, but the third value is the standard deviation, not the blur radius.",
                        "So filter: drop-shadow(0 4px 8px black) and box-shadow: 0 4px 8px black do not match — the filter version is twice as blurry. To port a box-shadow, halve the blur; to port a drop-shadow, double it. Offsets are literal in both, so only the third number moves."
                ],
                "code": {
                        "label": "Equivalent pair — same visual blur",
                        "content": "box-shadow: 0 4px 16px rgba(16, 24, 40, 0.25);\nfilter: drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25));"
                }
        },
        {
                "heading": "Layers behave differently too"
        },
        {
                "paragraphs": [
                        "box-shadow layers are peers in one list: each paints independently, first listed on top, so a crisp ring can sit above a soft drop in a single declaration. drop-shadow() has no comma list — the spec for this level accepts no spread and no multiple shadows. You can chain functions (filter: drop-shadow(...) drop-shadow(...)), but chained filters apply in sequence to the output of the previous one, so the second shadow falls on the first shadow's result rather than painting as a separate sheet.",
                        "inset is equally unavailable: a filter cannot draw inside the border box. Pressed wells, recessed inputs, and the dark half of soft-UI surfaces are box-shadow-only territory."
                ]
        },
        {
                "heading": "A practical rule"
        },
        {
                "list": [
                        "Cards, buttons, panels, inputs — anything rectangular or border-radius'd — box-shadow. It gives you spread for rings, inset for pressed states, and comma layers for contact-plus-ambient depth.",
                        "PNG cut-outs, SVG icons, masked shapes, emoji — drop-shadow(), because the silhouette should follow the artwork, not its bounding rectangle.",
                        "Headlines and labels — text-shadow, which traces the glyphs and works without filters.",
                        "Focus rings — box-shadow with zero blur and a spread (0 0 0 2px), one of the most-shipped shadows in our measurement of top-1,000 sites."
                ]
        },
        {
                "pageLink": {
                        "label": "Leggi l'articolo completo sui valori reali di box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Leggi l'articolo completo sui valori reali di box-shadow"
                }
        },
        {
                "heading": "What about cost?"
        },
        {
                "paragraphs": [
                        "A filter operates on rendered pixels: when the element or its shadow changes, the browser re-renders the filtered layer. box-shadow participates in normal element painting. For static UI the difference is not something you will feel, but it is one reason drop-shadow() is not a drop-in upgrade for every card — reach for it when the shape demands it, not as a default. Honesty first: measure if you have a real problem, and skip the folklore benchmarks otherwise."
                ]
        }
]
    },
    "id": {
      title: "box-shadow vs filter: drop-shadow() — Bayangan CSS mana yang harus digunakan",
      description: "Pahami perbedaan visual antara box-shadow dan drop-shadow(): siluet kotak vs transparansi saluran alfa.",
      readingTime: "6 mnt baca",
      tags: ["css","box-shadow","drop-shadow","svg","desain"],
      categoryLabel: "Pengembang",
      quickAnswer: "Gunakan box-shadow untuk komponen UI (kartu, tombol): mengikuti border-box dan mendukung spread serta inset. Gunakan filter: drop-shadow() untuk bentuk transparan (PNG transparan, ikon SVG) karena mengikuti bentuk piksel asli.",
      keyTakeaway: "Pilih berdasarkan siluet: box-shadow untuk elemen kotak dan tombol; drop-shadow() untuk grafis transparan dan ikon SVG.",
      toolCta: {"label":"Rancang bayangan box-shadow dengan pratinjau interaktif langsung.","toolId":"box-shadow-generator"},
      seoTitle: "box-shadow vs drop-shadow() dalam CSS | GainUtility",
      seoDescription: "Panduan lengkap perbedaan box-shadow dan filter: drop-shadow() di CSS: penanganan transparansi, spread, dan performa render.",
      content: [
        {
                "paragraphs": [
                        "CSS gives you three shadow primitives, and the choice between them is decided by one question: what shape should the shadow have? box-shadow shadows the element's box, text-shadow shadows each glyph, and filter: drop-shadow() shadows whatever pixels the element actually paints. The last two look like competitors, but they answer different questions — and copying a value from one to the other quietly changes how it renders.",
                        "Both demos below use the same transparent star image. The first applies box-shadow to the image element; the second applies filter: drop-shadow() to it. Watch where the shadow comes from."
                ]
        },
        {
                "heading": "Same element, different silhouette"
        },
        {
                "shadowDemo": {
                        "label": "box-shadow on a transparent image — a rectangle behind the whole box",
                        "property": "box-shadow",
                        "value": "0 8px 16px rgba(16, 24, 40, 0.25)",
                        "star": true
                }
        },
        {
                "shadowDemo": {
                        "label": "filter: drop-shadow() on the same image — the shadow follows the star",
                        "property": "filter",
                        "value": "drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25))",
                        "star": true
                }
        },
        {
                "paragraphs": [
                        "box-shadow is drawn from the border box, so it ignores transparency inside the element and fills the rectangle behind it — rounded if border-radius says so. drop-shadow() blurs and offsets the element's alpha mask, so the shadow only appears where the star's pixels do. On a fully opaque card both look nearly identical; on anything transparent they are completely different effects."
                ]
        },
        {
                "heading": "What each one accepts"
        },
        {
                "table": {
                        "caption": "box-shadow, text-shadow, and drop-shadow() side by side.",
                        "columns": [
                                "",
                                "box-shadow",
                                "text-shadow",
                                "filter: drop-shadow()"
                        ],
                        "rows": [
                                [
                                        "Silhouette",
                                        "Border box (border-radius applies)",
                                        "Every glyph's outline",
                                        "Element's alpha shape (pixels)"
                                ],
                                [
                                        "Offsets",
                                        "X and Y",
                                        "X and Y",
                                        "X and Y"
                                ],
                                [
                                        "Blur",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Blur radius (2× the Gaussian σ)",
                                        "Gaussian standard deviation (σ)"
                                ],
                                [
                                        "Spread",
                                        "Yes — 4th length",
                                        "No",
                                        "No"
                                ],
                                [
                                        "inset",
                                        "Yes",
                                        "No",
                                        "No"
                                ],
                                [
                                        "Multiple layers",
                                        "Comma-separated, first paints on top",
                                        "Comma-separated, first paints on top",
                                        "Chain functions: drop-shadow() drop-shadow()"
                                ],
                                [
                                        "Where it applies",
                                        "Any box-level element",
                                        "Text content",
                                        "Any element, via the filter property"
                                ]
                        ]
                }
        },
        {
                "heading": "The blur number does not transfer"
        },
        {
                "paragraphs": [
                        "This is the trap. box-shadow defines its blur radius so that the painted transition spans roughly that many pixels — per spec it is twice the standard deviation of the underlying Gaussian. drop-shadow() takes that standard deviation directly as its third length. The Filter Effects spec flags it: values are interpreted as for box-shadow, but the third value is the standard deviation, not the blur radius.",
                        "So filter: drop-shadow(0 4px 8px black) and box-shadow: 0 4px 8px black do not match — the filter version is twice as blurry. To port a box-shadow, halve the blur; to port a drop-shadow, double it. Offsets are literal in both, so only the third number moves."
                ],
                "code": {
                        "label": "Equivalent pair — same visual blur",
                        "content": "box-shadow: 0 4px 16px rgba(16, 24, 40, 0.25);\nfilter: drop-shadow(0 4px 8px rgba(16, 24, 40, 0.25));"
                }
        },
        {
                "heading": "Layers behave differently too"
        },
        {
                "paragraphs": [
                        "box-shadow layers are peers in one list: each paints independently, first listed on top, so a crisp ring can sit above a soft drop in a single declaration. drop-shadow() has no comma list — the spec for this level accepts no spread and no multiple shadows. You can chain functions (filter: drop-shadow(...) drop-shadow(...)), but chained filters apply in sequence to the output of the previous one, so the second shadow falls on the first shadow's result rather than painting as a separate sheet.",
                        "inset is equally unavailable: a filter cannot draw inside the border box. Pressed wells, recessed inputs, and the dark half of soft-UI surfaces are box-shadow-only territory."
                ]
        },
        {
                "heading": "A practical rule"
        },
        {
                "list": [
                        "Cards, buttons, panels, inputs — anything rectangular or border-radius'd — box-shadow. It gives you spread for rings, inset for pressed states, and comma layers for contact-plus-ambient depth.",
                        "PNG cut-outs, SVG icons, masked shapes, emoji — drop-shadow(), because the silhouette should follow the artwork, not its bounding rectangle.",
                        "Headlines and labels — text-shadow, which traces the glyphs and works without filters.",
                        "Focus rings — box-shadow with zero blur and a spread (0 0 0 2px), one of the most-shipped shadows in our measurement of top-1,000 sites."
                ]
        },
        {
                "pageLink": {
                        "label": "Baca artikel lengkap tentang nilai nyata box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Baca artikel lengkap tentang nilai nyata box-shadow"
                }
        },
        {
                "heading": "What about cost?"
        },
        {
                "paragraphs": [
                        "A filter operates on rendered pixels: when the element or its shadow changes, the browser re-renders the filtered layer. box-shadow participates in normal element painting. For static UI the difference is not something you will feel, but it is one reason drop-shadow() is not a drop-in upgrade for every card — reach for it when the shape demands it, not as a default. Honesty first: measure if you have a real problem, and skip the folklore benchmarks otherwise."
                ]
        }
]
    },
  },
  "soft-shadow-css-recipes": {
    "pt-br": {
      title: "Receitas de sombras suaves em CSS que não ficam opacas nem pesadas",
      description: "Aprenda a construir sombras leves e realistas com camadas de baixo alfa em vez de desfoques gigantes e escuros.",
      readingTime: "5 min de leitura",
      tags: ["css","box-shadow","ui design","sombras suaves"],
      categoryLabel: "Desenvolvedor",
      quickAnswer: "Suavidade não significa sombra escura e gigante. Construa sombras suaves usando baixo alfa (0.05–0.12) e duas camadas sobrepostas (contato + ambiente), em vez de um borrão único e pesado de 40 px.",
      keyTakeaway: "Suavidade vem de opacidade baixa e camadas sutis, não de volume excessivo de desfoque.",
      toolCta: {"label":"Ajuste qualquer uma dessas receitas camada por camada no gerador.","toolId":"box-shadow-generator"},
      seoTitle: "Receitas de Sombras Suaves em CSS (Box-Shadow) | GainUtility",
      seoDescription: "Como criar sombras CSS modernas, suaves e elegantes: valores prontos de box-shadow em camadas para cards, botões e modais.",
      content: [
        {
                "paragraphs": [
                        "Soft shadows fail the same way every time: someone reaches for blur 40px, alpha 0.4, a blue-black tint — and gets a smudge that looks like a stain rather than depth. Softness is not produced by blur volume. It is produced by low contrast against the surface and a gradient that falls off gradually, which is a completely different set of knobs.",
                        "We measured this rather than guessed it: 33,438 box-shadow declarations across the shipped CSS of 533 reachable sites from the top 1,000. The recipes below stay inside the bands production actually uses."
                ],
                "pageLink": {
                        "label": "Ver o artigo completo sobre valores reais de box-shadow",
                        "path": "/blog/box-shadow-values-real-websites",
                        "text": "Ver o artigo completo sobre valores reais de box-shadow"
                }
        },
        {
                "heading": "Why soft shadows go muddy"
        },
        {
                "list": [
                        "Stacked alpha. Each translucent layer darkens the ones below it. Three layers at 0.3 black do not average out — they compound into a dark patch under the element.",
                        "Tinted colors. A navy or purple shadow reads as a stain on warm backgrounds. 73.8% of measured layers are achromatic — neutral black at low alpha — and neutral is what eyes read as 'shadow' rather than 'color'.",
                        "Identical rungs. Two layers with the same offset and near-same blur just double the darkness. Each rung needs a visibly different offset or blur to contribute anything new.",
                        "Blur without tuck. Big blurs grow the halo in every direction and swell the component's footprint. Pair large blurs with negative spread so the shadow tucks back under the card."
                ]
        },
        {
                "heading": "Recipe 1 — the one-layer raise"
        },
        {
                "paragraphs": [
                        "Start smaller than feels right. This value ships verbatim on real sites (including TinyURL and OpenStreetMap in our sample) and is enough for most list rows, settings panels, and quiet cards: X at zero, Y at one pixel, blur at two, black at 10%."
                ],
                "shadowDemo": {
                        "label": "One-layer raise — production-verified",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.1)",
                        "radius": 14
                }
        },
        {
                "heading": "Recipe 2 — contact + ambient"
        },
        {
                "paragraphs": [
                        "Real objects occlude light twice: a dark tight shadow where they nearly touch the surface, and a broader faint one spreading away. Two layers reproduce that — a small contact layer first (it paints on top), then a wide ambient layer with negative spread so it tucks under the card."
                ],
                "shadowDemo": {
                        "label": "Contact + ambient card",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -6px rgba(0, 0, 0, 0.12)",
                        "radius": 16
                }
        },
        {
                "heading": "Recipe 3 — floating panel"
        },
        {
                "paragraphs": [
                        "For a card that is visibly above the page — a dropdown, a popover, a hovered row — raise both rungs together. Alphas stay at or below 0.14; the lift comes from the spread of distances, not from darkness."
                ],
                "shadowDemo": {
                        "label": "Floating panel",
                        "property": "box-shadow",
                        "value": "0 4px 12px -2px rgba(16, 24, 40, 0.1), 0 12px 28px -8px rgba(16, 24, 40, 0.12)",
                        "radius": 20
                }
        },
        {
                "heading": "Recipe 4 — soft headline"
        },
        {
                "paragraphs": [
                        "Text needs its own primitive. text-shadow traces the glyphs, so a single moderate layer keeps headline copy readable over busy backgrounds without smudging the letterforms the way a filter would."
                ],
                "shadowDemo": {
                        "label": "Soft text shadow",
                        "property": "text-shadow",
                        "value": "0 2px 8px rgba(0, 0, 0, 0.45)",
                        "text": "Soft headline"
                }
        },
        {
                "heading": "The alpha-first method"
        },
        {
                "paragraphs": [
                        "Instead of tuning blur until it 'feels soft', fix the order of operations. Start every shadow from the color: set alpha around 0.08, then add only enough offset and blur for the edge to read. Raise alpha in small steps only when the shadow disappears against the background — and stop before it stains."
                ],
                "steps": [
                        "Set X to 0. Production pins X at zero on 93.1% of layers; sideways drift is not how depth reads.",
                        "Set Y to 1–4px — down a little, or straight down. Upward shadows were 1.3% of measured layers.",
                        "Set blur to single digits for raises (the median is 3px, the 75th percentile 10px). Save 24px+ for glows.",
                        "Set color to neutral black at 0.08–0.12 alpha — the busiest measured bands are near-zero and 0.1–0.15.",
                        "If it still looks flat, add a second wider rung with negative spread instead of darkening the first."
                ],
                "code": {
                        "label": "Tokenized soft shadow — paste into a stylesheet",
                        "content": ":root {\n  --shadow-contact: 0 1px 2px rgba(16, 24, 40, 0.08);\n  --shadow-ambient: 0 8px 24px -6px rgba(16, 24, 40, 0.12);\n}\n.card {\n  box-shadow: var(--shadow-contact), var(--shadow-ambient);\n}"
                }
        },
        {
                "pageLink": {
                        "label": "Ver o artigo completo sobre valores reais de box-shadow",
                        "path": "/css/box-shadow/examples",
                        "text": "Ver o artigo completo sobre valores reais de box-shadow"
                }
        }
]
    },
    "es-mx": {
      title: "Recetas de sombras suaves en CSS que no se ven pesadas ni borrosas",
      description: "Aprende a diseñar sombras realistas y elegantes usando capas de bajo alfa en lugar de desenfoques oscuros y gigantes.",
      readingTime: "5 min de lectura",
      tags: ["css","box-shadow","ui design","sombras suaves"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Suavidad no significa sombra grande y oscura. Diseña sombras sutiles con valores de alfa bajos (0.05 a 0.12) y dos capas complementarias (contacto + ambiente) en vez de un solo manchón oscuro de 40 px.",
      keyTakeaway: "La suavidad proviene de un alfa bajo y espaciado delicado, no de un blur desmedido.",
      toolCta: {"label":"Ajusta cualquiera de estas recetas capa por capa en el generador.","toolId":"box-shadow-generator"},
      seoTitle: "Recetas de Sombras CSS Suaves y Modernas | GainUtility",
      seoDescription: "Fórmulas de CSS box-shadow para crear sombras limpias y modernas: combinaciones de capas para tarjetas, modales y botones.",
      content: [
        {
                "paragraphs": [
                        "Soft shadows fail the same way every time: someone reaches for blur 40px, alpha 0.4, a blue-black tint — and gets a smudge that looks like a stain rather than depth. Softness is not produced by blur volume. It is produced by low contrast against the surface and a gradient that falls off gradually, which is a completely different set of knobs.",
                        "We measured this rather than guessed it: 33,438 box-shadow declarations across the shipped CSS of 533 reachable sites from the top 1,000. The recipes below stay inside the bands production actually uses."
                ],
                "pageLink": {
                        "label": "Ver el artículo completo sobre valores reales de box-shadow",
                        "path": "/blog/box-shadow-values-real-websites",
                        "text": "Ver el artículo completo sobre valores reales de box-shadow"
                }
        },
        {
                "heading": "Why soft shadows go muddy"
        },
        {
                "list": [
                        "Stacked alpha. Each translucent layer darkens the ones below it. Three layers at 0.3 black do not average out — they compound into a dark patch under the element.",
                        "Tinted colors. A navy or purple shadow reads as a stain on warm backgrounds. 73.8% of measured layers are achromatic — neutral black at low alpha — and neutral is what eyes read as 'shadow' rather than 'color'.",
                        "Identical rungs. Two layers with the same offset and near-same blur just double the darkness. Each rung needs a visibly different offset or blur to contribute anything new.",
                        "Blur without tuck. Big blurs grow the halo in every direction and swell the component's footprint. Pair large blurs with negative spread so the shadow tucks back under the card."
                ]
        },
        {
                "heading": "Recipe 1 — the one-layer raise"
        },
        {
                "paragraphs": [
                        "Start smaller than feels right. This value ships verbatim on real sites (including TinyURL and OpenStreetMap in our sample) and is enough for most list rows, settings panels, and quiet cards: X at zero, Y at one pixel, blur at two, black at 10%."
                ],
                "shadowDemo": {
                        "label": "One-layer raise — production-verified",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.1)",
                        "radius": 14
                }
        },
        {
                "heading": "Recipe 2 — contact + ambient"
        },
        {
                "paragraphs": [
                        "Real objects occlude light twice: a dark tight shadow where they nearly touch the surface, and a broader faint one spreading away. Two layers reproduce that — a small contact layer first (it paints on top), then a wide ambient layer with negative spread so it tucks under the card."
                ],
                "shadowDemo": {
                        "label": "Contact + ambient card",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -6px rgba(0, 0, 0, 0.12)",
                        "radius": 16
                }
        },
        {
                "heading": "Recipe 3 — floating panel"
        },
        {
                "paragraphs": [
                        "For a card that is visibly above the page — a dropdown, a popover, a hovered row — raise both rungs together. Alphas stay at or below 0.14; the lift comes from the spread of distances, not from darkness."
                ],
                "shadowDemo": {
                        "label": "Floating panel",
                        "property": "box-shadow",
                        "value": "0 4px 12px -2px rgba(16, 24, 40, 0.1), 0 12px 28px -8px rgba(16, 24, 40, 0.12)",
                        "radius": 20
                }
        },
        {
                "heading": "Recipe 4 — soft headline"
        },
        {
                "paragraphs": [
                        "Text needs its own primitive. text-shadow traces the glyphs, so a single moderate layer keeps headline copy readable over busy backgrounds without smudging the letterforms the way a filter would."
                ],
                "shadowDemo": {
                        "label": "Soft text shadow",
                        "property": "text-shadow",
                        "value": "0 2px 8px rgba(0, 0, 0, 0.45)",
                        "text": "Soft headline"
                }
        },
        {
                "heading": "The alpha-first method"
        },
        {
                "paragraphs": [
                        "Instead of tuning blur until it 'feels soft', fix the order of operations. Start every shadow from the color: set alpha around 0.08, then add only enough offset and blur for the edge to read. Raise alpha in small steps only when the shadow disappears against the background — and stop before it stains."
                ],
                "steps": [
                        "Set X to 0. Production pins X at zero on 93.1% of layers; sideways drift is not how depth reads.",
                        "Set Y to 1–4px — down a little, or straight down. Upward shadows were 1.3% of measured layers.",
                        "Set blur to single digits for raises (the median is 3px, the 75th percentile 10px). Save 24px+ for glows.",
                        "Set color to neutral black at 0.08–0.12 alpha — the busiest measured bands are near-zero and 0.1–0.15.",
                        "If it still looks flat, add a second wider rung with negative spread instead of darkening the first."
                ],
                "code": {
                        "label": "Tokenized soft shadow — paste into a stylesheet",
                        "content": ":root {\n  --shadow-contact: 0 1px 2px rgba(16, 24, 40, 0.08);\n  --shadow-ambient: 0 8px 24px -6px rgba(16, 24, 40, 0.12);\n}\n.card {\n  box-shadow: var(--shadow-contact), var(--shadow-ambient);\n}"
                }
        },
        {
                "pageLink": {
                        "label": "Ver el artículo completo sobre valores reales de box-shadow",
                        "path": "/css/box-shadow/examples",
                        "text": "Ver el artículo completo sobre valores reales de box-shadow"
                }
        }
]
    },
    "es-co": {
      title: "Recetas de sombras suaves en CSS que no se ven pesadas ni borrosas",
      description: "Aprende a diseñar sombras realistas y elegantes usando capas de bajo alfa en lugar de desenfoques oscuros y gigantes.",
      readingTime: "5 min de lectura",
      tags: ["css","box-shadow","ui design","sombras suaves"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Suavidad no significa sombra grande y oscura. Diseña sombras sutiles con valores de alfa bajos (0.05 a 0.12) y dos capas complementarias (contacto + ambiente) en vez de un solo manchón oscuro de 40 px.",
      keyTakeaway: "La suavidad proviene de un alfa bajo y espaciado delicado, no de un blur desmedido.",
      toolCta: {"label":"Ajusta cualquiera de estas recetas capa por capa en el generador.","toolId":"box-shadow-generator"},
      seoTitle: "Recetas de Sombras CSS Suaves y Modernas | GainUtility",
      seoDescription: "Fórmulas de CSS box-shadow para crear sombras limpias y modernas: combinaciones de capas para tarjetas, modales y botones.",
      content: [
        {
                "paragraphs": [
                        "Soft shadows fail the same way every time: someone reaches for blur 40px, alpha 0.4, a blue-black tint — and gets a smudge that looks like a stain rather than depth. Softness is not produced by blur volume. It is produced by low contrast against the surface and a gradient that falls off gradually, which is a completely different set of knobs.",
                        "We measured this rather than guessed it: 33,438 box-shadow declarations across the shipped CSS of 533 reachable sites from the top 1,000. The recipes below stay inside the bands production actually uses."
                ],
                "pageLink": {
                        "label": "Ver el artículo completo sobre valores reales de box-shadow",
                        "path": "/blog/box-shadow-values-real-websites",
                        "text": "Ver el artículo completo sobre valores reales de box-shadow"
                }
        },
        {
                "heading": "Why soft shadows go muddy"
        },
        {
                "list": [
                        "Stacked alpha. Each translucent layer darkens the ones below it. Three layers at 0.3 black do not average out — they compound into a dark patch under the element.",
                        "Tinted colors. A navy or purple shadow reads as a stain on warm backgrounds. 73.8% of measured layers are achromatic — neutral black at low alpha — and neutral is what eyes read as 'shadow' rather than 'color'.",
                        "Identical rungs. Two layers with the same offset and near-same blur just double the darkness. Each rung needs a visibly different offset or blur to contribute anything new.",
                        "Blur without tuck. Big blurs grow the halo in every direction and swell the component's footprint. Pair large blurs with negative spread so the shadow tucks back under the card."
                ]
        },
        {
                "heading": "Recipe 1 — the one-layer raise"
        },
        {
                "paragraphs": [
                        "Start smaller than feels right. This value ships verbatim on real sites (including TinyURL and OpenStreetMap in our sample) and is enough for most list rows, settings panels, and quiet cards: X at zero, Y at one pixel, blur at two, black at 10%."
                ],
                "shadowDemo": {
                        "label": "One-layer raise — production-verified",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.1)",
                        "radius": 14
                }
        },
        {
                "heading": "Recipe 2 — contact + ambient"
        },
        {
                "paragraphs": [
                        "Real objects occlude light twice: a dark tight shadow where they nearly touch the surface, and a broader faint one spreading away. Two layers reproduce that — a small contact layer first (it paints on top), then a wide ambient layer with negative spread so it tucks under the card."
                ],
                "shadowDemo": {
                        "label": "Contact + ambient card",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -6px rgba(0, 0, 0, 0.12)",
                        "radius": 16
                }
        },
        {
                "heading": "Recipe 3 — floating panel"
        },
        {
                "paragraphs": [
                        "For a card that is visibly above the page — a dropdown, a popover, a hovered row — raise both rungs together. Alphas stay at or below 0.14; the lift comes from the spread of distances, not from darkness."
                ],
                "shadowDemo": {
                        "label": "Floating panel",
                        "property": "box-shadow",
                        "value": "0 4px 12px -2px rgba(16, 24, 40, 0.1), 0 12px 28px -8px rgba(16, 24, 40, 0.12)",
                        "radius": 20
                }
        },
        {
                "heading": "Recipe 4 — soft headline"
        },
        {
                "paragraphs": [
                        "Text needs its own primitive. text-shadow traces the glyphs, so a single moderate layer keeps headline copy readable over busy backgrounds without smudging the letterforms the way a filter would."
                ],
                "shadowDemo": {
                        "label": "Soft text shadow",
                        "property": "text-shadow",
                        "value": "0 2px 8px rgba(0, 0, 0, 0.45)",
                        "text": "Soft headline"
                }
        },
        {
                "heading": "The alpha-first method"
        },
        {
                "paragraphs": [
                        "Instead of tuning blur until it 'feels soft', fix the order of operations. Start every shadow from the color: set alpha around 0.08, then add only enough offset and blur for the edge to read. Raise alpha in small steps only when the shadow disappears against the background — and stop before it stains."
                ],
                "steps": [
                        "Set X to 0. Production pins X at zero on 93.1% of layers; sideways drift is not how depth reads.",
                        "Set Y to 1–4px — down a little, or straight down. Upward shadows were 1.3% of measured layers.",
                        "Set blur to single digits for raises (the median is 3px, the 75th percentile 10px). Save 24px+ for glows.",
                        "Set color to neutral black at 0.08–0.12 alpha — the busiest measured bands are near-zero and 0.1–0.15.",
                        "If it still looks flat, add a second wider rung with negative spread instead of darkening the first."
                ],
                "code": {
                        "label": "Tokenized soft shadow — paste into a stylesheet",
                        "content": ":root {\n  --shadow-contact: 0 1px 2px rgba(16, 24, 40, 0.08);\n  --shadow-ambient: 0 8px 24px -6px rgba(16, 24, 40, 0.12);\n}\n.card {\n  box-shadow: var(--shadow-contact), var(--shadow-ambient);\n}"
                }
        },
        {
                "pageLink": {
                        "label": "Ver el artículo completo sobre valores reales de box-shadow",
                        "path": "/css/box-shadow/examples",
                        "text": "Ver el artículo completo sobre valores reales de box-shadow"
                }
        }
]
    },
    "de": {
      title: "Sanfte CSS-Schatten-Rezepte, die nicht matschig oder überladen wirken",
      description: "Erfahren Sie, wie Sie moderne, weiche Schatten mit niedrigem Alpha und zwei Ebenen statt riesiger dunkler Unschärfen erstellen.",
      readingTime: "5 Min. Lesezeit",
      tags: ["css","box-shadow","ui design","weiche schatten"],
      categoryLabel: "Entwickler",
      quickAnswer: "Sanftheit bedeutet nicht dunkle, riesige Schatten. Erzielen Sie Tiefe durch geringe Transparenz (Alpha 0,05–0,12) und zwei Ebenen (Kontaktschatten + Umgebungsschatten), anstatt eines 40px-Blocks.",
      keyTakeaway: "Weiche Schatten entstehen durch geringes Alpha und Schichtung, nicht durch extremes Blur.",
      toolCta: {"label":"Passen Sie diese Rezepte Ebene für Ebene im Schatten-Generator an.","toolId":"box-shadow-generator"},
      seoTitle: "Rezepte für sanfte CSS-Schatten (Box-Shadow) | GainUtility",
      seoDescription: "Praktische CSS-Schatten-Vorlagen für UI-Elemente: Mehrstufige Schatten für Karten, Modals und Navigationsleisten ohne Schmiereffekt.",
      content: [
        {
                "paragraphs": [
                        "Soft shadows fail the same way every time: someone reaches for blur 40px, alpha 0.4, a blue-black tint — and gets a smudge that looks like a stain rather than depth. Softness is not produced by blur volume. It is produced by low contrast against the surface and a gradient that falls off gradually, which is a completely different set of knobs.",
                        "We measured this rather than guessed it: 33,438 box-shadow declarations across the shipped CSS of 533 reachable sites from the top 1,000. The recipes below stay inside the bands production actually uses."
                ],
                "pageLink": {
                        "label": "Den vollständigen Artikel über reale box-shadow-Werte lesen",
                        "path": "/blog/box-shadow-values-real-websites",
                        "text": "Den vollständigen Artikel über reale box-shadow-Werte lesen"
                }
        },
        {
                "heading": "Why soft shadows go muddy"
        },
        {
                "list": [
                        "Stacked alpha. Each translucent layer darkens the ones below it. Three layers at 0.3 black do not average out — they compound into a dark patch under the element.",
                        "Tinted colors. A navy or purple shadow reads as a stain on warm backgrounds. 73.8% of measured layers are achromatic — neutral black at low alpha — and neutral is what eyes read as 'shadow' rather than 'color'.",
                        "Identical rungs. Two layers with the same offset and near-same blur just double the darkness. Each rung needs a visibly different offset or blur to contribute anything new.",
                        "Blur without tuck. Big blurs grow the halo in every direction and swell the component's footprint. Pair large blurs with negative spread so the shadow tucks back under the card."
                ]
        },
        {
                "heading": "Recipe 1 — the one-layer raise"
        },
        {
                "paragraphs": [
                        "Start smaller than feels right. This value ships verbatim on real sites (including TinyURL and OpenStreetMap in our sample) and is enough for most list rows, settings panels, and quiet cards: X at zero, Y at one pixel, blur at two, black at 10%."
                ],
                "shadowDemo": {
                        "label": "One-layer raise — production-verified",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.1)",
                        "radius": 14
                }
        },
        {
                "heading": "Recipe 2 — contact + ambient"
        },
        {
                "paragraphs": [
                        "Real objects occlude light twice: a dark tight shadow where they nearly touch the surface, and a broader faint one spreading away. Two layers reproduce that — a small contact layer first (it paints on top), then a wide ambient layer with negative spread so it tucks under the card."
                ],
                "shadowDemo": {
                        "label": "Contact + ambient card",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -6px rgba(0, 0, 0, 0.12)",
                        "radius": 16
                }
        },
        {
                "heading": "Recipe 3 — floating panel"
        },
        {
                "paragraphs": [
                        "For a card that is visibly above the page — a dropdown, a popover, a hovered row — raise both rungs together. Alphas stay at or below 0.14; the lift comes from the spread of distances, not from darkness."
                ],
                "shadowDemo": {
                        "label": "Floating panel",
                        "property": "box-shadow",
                        "value": "0 4px 12px -2px rgba(16, 24, 40, 0.1), 0 12px 28px -8px rgba(16, 24, 40, 0.12)",
                        "radius": 20
                }
        },
        {
                "heading": "Recipe 4 — soft headline"
        },
        {
                "paragraphs": [
                        "Text needs its own primitive. text-shadow traces the glyphs, so a single moderate layer keeps headline copy readable over busy backgrounds without smudging the letterforms the way a filter would."
                ],
                "shadowDemo": {
                        "label": "Soft text shadow",
                        "property": "text-shadow",
                        "value": "0 2px 8px rgba(0, 0, 0, 0.45)",
                        "text": "Soft headline"
                }
        },
        {
                "heading": "The alpha-first method"
        },
        {
                "paragraphs": [
                        "Instead of tuning blur until it 'feels soft', fix the order of operations. Start every shadow from the color: set alpha around 0.08, then add only enough offset and blur for the edge to read. Raise alpha in small steps only when the shadow disappears against the background — and stop before it stains."
                ],
                "steps": [
                        "Set X to 0. Production pins X at zero on 93.1% of layers; sideways drift is not how depth reads.",
                        "Set Y to 1–4px — down a little, or straight down. Upward shadows were 1.3% of measured layers.",
                        "Set blur to single digits for raises (the median is 3px, the 75th percentile 10px). Save 24px+ for glows.",
                        "Set color to neutral black at 0.08–0.12 alpha — the busiest measured bands are near-zero and 0.1–0.15.",
                        "If it still looks flat, add a second wider rung with negative spread instead of darkening the first."
                ],
                "code": {
                        "label": "Tokenized soft shadow — paste into a stylesheet",
                        "content": ":root {\n  --shadow-contact: 0 1px 2px rgba(16, 24, 40, 0.08);\n  --shadow-ambient: 0 8px 24px -6px rgba(16, 24, 40, 0.12);\n}\n.card {\n  box-shadow: var(--shadow-contact), var(--shadow-ambient);\n}"
                }
        },
        {
                "pageLink": {
                        "label": "Den vollständigen Artikel über reale box-shadow-Werte lesen",
                        "path": "/css/box-shadow/examples",
                        "text": "Den vollständigen Artikel über reale box-shadow-Werte lesen"
                }
        }
]
    },
    "fr": {
      title: "Recettes d'ombres douces en CSS sans effet lourd ni baveux",
      description: "Apprenez à concevoir des ombres fluides et naturelles avec des couches à faible opacité plutôt que de gros flous sombres.",
      readingTime: "5 min de lecture",
      tags: ["css","box-shadow","ui design","ombres douces"],
      categoryLabel: "Développeur",
      quickAnswer: "Douceur ne rime pas avec ombre noire et massive. Créez des ombres subtiles grâce à un faible niveau d'alpha (0,05–0,12) et deux couches complémentaires (contact + ambiance) plutôt qu'un seul flou de 40 px.",
      keyTakeaway: "La douceur d'une ombre vient de l'opacité légère et de la composition multicouche, non de la force du flou.",
      toolCta: {"label":"Ajustez chacune de ces recettes couche par couche dans le générateur.","toolId":"box-shadow-generator"},
      seoTitle: "Recettes d'ombres CSS douces et modernes | GainUtility",
      seoDescription: "Valeurs CSS box-shadow prêtes à l'emploi pour des ombres douces et élégantes : cartes, conteneurs flottants et boutons.",
      content: [
        {
                "paragraphs": [
                        "Soft shadows fail the same way every time: someone reaches for blur 40px, alpha 0.4, a blue-black tint — and gets a smudge that looks like a stain rather than depth. Softness is not produced by blur volume. It is produced by low contrast against the surface and a gradient that falls off gradually, which is a completely different set of knobs.",
                        "We measured this rather than guessed it: 33,438 box-shadow declarations across the shipped CSS of 533 reachable sites from the top 1,000. The recipes below stay inside the bands production actually uses."
                ],
                "pageLink": {
                        "label": "Consulter l'article complet sur les vraies valeurs de box-shadow",
                        "path": "/blog/box-shadow-values-real-websites",
                        "text": "Consulter l'article complet sur les vraies valeurs de box-shadow"
                }
        },
        {
                "heading": "Why soft shadows go muddy"
        },
        {
                "list": [
                        "Stacked alpha. Each translucent layer darkens the ones below it. Three layers at 0.3 black do not average out — they compound into a dark patch under the element.",
                        "Tinted colors. A navy or purple shadow reads as a stain on warm backgrounds. 73.8% of measured layers are achromatic — neutral black at low alpha — and neutral is what eyes read as 'shadow' rather than 'color'.",
                        "Identical rungs. Two layers with the same offset and near-same blur just double the darkness. Each rung needs a visibly different offset or blur to contribute anything new.",
                        "Blur without tuck. Big blurs grow the halo in every direction and swell the component's footprint. Pair large blurs with negative spread so the shadow tucks back under the card."
                ]
        },
        {
                "heading": "Recipe 1 — the one-layer raise"
        },
        {
                "paragraphs": [
                        "Start smaller than feels right. This value ships verbatim on real sites (including TinyURL and OpenStreetMap in our sample) and is enough for most list rows, settings panels, and quiet cards: X at zero, Y at one pixel, blur at two, black at 10%."
                ],
                "shadowDemo": {
                        "label": "One-layer raise — production-verified",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.1)",
                        "radius": 14
                }
        },
        {
                "heading": "Recipe 2 — contact + ambient"
        },
        {
                "paragraphs": [
                        "Real objects occlude light twice: a dark tight shadow where they nearly touch the surface, and a broader faint one spreading away. Two layers reproduce that — a small contact layer first (it paints on top), then a wide ambient layer with negative spread so it tucks under the card."
                ],
                "shadowDemo": {
                        "label": "Contact + ambient card",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -6px rgba(0, 0, 0, 0.12)",
                        "radius": 16
                }
        },
        {
                "heading": "Recipe 3 — floating panel"
        },
        {
                "paragraphs": [
                        "For a card that is visibly above the page — a dropdown, a popover, a hovered row — raise both rungs together. Alphas stay at or below 0.14; the lift comes from the spread of distances, not from darkness."
                ],
                "shadowDemo": {
                        "label": "Floating panel",
                        "property": "box-shadow",
                        "value": "0 4px 12px -2px rgba(16, 24, 40, 0.1), 0 12px 28px -8px rgba(16, 24, 40, 0.12)",
                        "radius": 20
                }
        },
        {
                "heading": "Recipe 4 — soft headline"
        },
        {
                "paragraphs": [
                        "Text needs its own primitive. text-shadow traces the glyphs, so a single moderate layer keeps headline copy readable over busy backgrounds without smudging the letterforms the way a filter would."
                ],
                "shadowDemo": {
                        "label": "Soft text shadow",
                        "property": "text-shadow",
                        "value": "0 2px 8px rgba(0, 0, 0, 0.45)",
                        "text": "Soft headline"
                }
        },
        {
                "heading": "The alpha-first method"
        },
        {
                "paragraphs": [
                        "Instead of tuning blur until it 'feels soft', fix the order of operations. Start every shadow from the color: set alpha around 0.08, then add only enough offset and blur for the edge to read. Raise alpha in small steps only when the shadow disappears against the background — and stop before it stains."
                ],
                "steps": [
                        "Set X to 0. Production pins X at zero on 93.1% of layers; sideways drift is not how depth reads.",
                        "Set Y to 1–4px — down a little, or straight down. Upward shadows were 1.3% of measured layers.",
                        "Set blur to single digits for raises (the median is 3px, the 75th percentile 10px). Save 24px+ for glows.",
                        "Set color to neutral black at 0.08–0.12 alpha — the busiest measured bands are near-zero and 0.1–0.15.",
                        "If it still looks flat, add a second wider rung with negative spread instead of darkening the first."
                ],
                "code": {
                        "label": "Tokenized soft shadow — paste into a stylesheet",
                        "content": ":root {\n  --shadow-contact: 0 1px 2px rgba(16, 24, 40, 0.08);\n  --shadow-ambient: 0 8px 24px -6px rgba(16, 24, 40, 0.12);\n}\n.card {\n  box-shadow: var(--shadow-contact), var(--shadow-ambient);\n}"
                }
        },
        {
                "pageLink": {
                        "label": "Consulter l'article complet sur les vraies valeurs de box-shadow",
                        "path": "/css/box-shadow/examples",
                        "text": "Consulter l'article complet sur les vraies valeurs de box-shadow"
                }
        }
]
    },
    "it": {
      title: "Ricette per ombre morbide in CSS che non risultano scure o pesanti",
      description: "Scopri come creare ombre leggere e realistiche con livelli a bassa opacità anziché sfocature scure esagerate.",
      readingTime: "5 min di lettura",
      tags: ["css","box-shadow","ui design","ombre morbide"],
      categoryLabel: "Sviluppatore",
      quickAnswer: "Morbidezza non significa un'ombra scura e ingombrante. Costruisci ombre naturali con alpha basso (0,05–0,12) e due strati combinati (contatto + ambiente), evitando sfocature singole da 40 px.",
      keyTakeaway: "La morbidezza nasce dalla bassa trasparenza e da strati graduati, non dall'eccessiva sfocatura.",
      toolCta: {"label":"Personalizza queste ricette livello per livello con anteprima in tempo reale.","toolId":"box-shadow-generator"},
      seoTitle: "Ricette CSS per ombre morbide e realistiche | GainUtility",
      seoDescription: "Formule CSS pronte per box-shadow naturali e moderne: codici per schede, finestre di dialogo e pulsanti eleganti.",
      content: [
        {
                "paragraphs": [
                        "Soft shadows fail the same way every time: someone reaches for blur 40px, alpha 0.4, a blue-black tint — and gets a smudge that looks like a stain rather than depth. Softness is not produced by blur volume. It is produced by low contrast against the surface and a gradient that falls off gradually, which is a completely different set of knobs.",
                        "We measured this rather than guessed it: 33,438 box-shadow declarations across the shipped CSS of 533 reachable sites from the top 1,000. The recipes below stay inside the bands production actually uses."
                ],
                "pageLink": {
                        "label": "Leggi l'articolo completo sui valori reali di box-shadow",
                        "path": "/blog/box-shadow-values-real-websites",
                        "text": "Leggi l'articolo completo sui valori reali di box-shadow"
                }
        },
        {
                "heading": "Why soft shadows go muddy"
        },
        {
                "list": [
                        "Stacked alpha. Each translucent layer darkens the ones below it. Three layers at 0.3 black do not average out — they compound into a dark patch under the element.",
                        "Tinted colors. A navy or purple shadow reads as a stain on warm backgrounds. 73.8% of measured layers are achromatic — neutral black at low alpha — and neutral is what eyes read as 'shadow' rather than 'color'.",
                        "Identical rungs. Two layers with the same offset and near-same blur just double the darkness. Each rung needs a visibly different offset or blur to contribute anything new.",
                        "Blur without tuck. Big blurs grow the halo in every direction and swell the component's footprint. Pair large blurs with negative spread so the shadow tucks back under the card."
                ]
        },
        {
                "heading": "Recipe 1 — the one-layer raise"
        },
        {
                "paragraphs": [
                        "Start smaller than feels right. This value ships verbatim on real sites (including TinyURL and OpenStreetMap in our sample) and is enough for most list rows, settings panels, and quiet cards: X at zero, Y at one pixel, blur at two, black at 10%."
                ],
                "shadowDemo": {
                        "label": "One-layer raise — production-verified",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.1)",
                        "radius": 14
                }
        },
        {
                "heading": "Recipe 2 — contact + ambient"
        },
        {
                "paragraphs": [
                        "Real objects occlude light twice: a dark tight shadow where they nearly touch the surface, and a broader faint one spreading away. Two layers reproduce that — a small contact layer first (it paints on top), then a wide ambient layer with negative spread so it tucks under the card."
                ],
                "shadowDemo": {
                        "label": "Contact + ambient card",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -6px rgba(0, 0, 0, 0.12)",
                        "radius": 16
                }
        },
        {
                "heading": "Recipe 3 — floating panel"
        },
        {
                "paragraphs": [
                        "For a card that is visibly above the page — a dropdown, a popover, a hovered row — raise both rungs together. Alphas stay at or below 0.14; the lift comes from the spread of distances, not from darkness."
                ],
                "shadowDemo": {
                        "label": "Floating panel",
                        "property": "box-shadow",
                        "value": "0 4px 12px -2px rgba(16, 24, 40, 0.1), 0 12px 28px -8px rgba(16, 24, 40, 0.12)",
                        "radius": 20
                }
        },
        {
                "heading": "Recipe 4 — soft headline"
        },
        {
                "paragraphs": [
                        "Text needs its own primitive. text-shadow traces the glyphs, so a single moderate layer keeps headline copy readable over busy backgrounds without smudging the letterforms the way a filter would."
                ],
                "shadowDemo": {
                        "label": "Soft text shadow",
                        "property": "text-shadow",
                        "value": "0 2px 8px rgba(0, 0, 0, 0.45)",
                        "text": "Soft headline"
                }
        },
        {
                "heading": "The alpha-first method"
        },
        {
                "paragraphs": [
                        "Instead of tuning blur until it 'feels soft', fix the order of operations. Start every shadow from the color: set alpha around 0.08, then add only enough offset and blur for the edge to read. Raise alpha in small steps only when the shadow disappears against the background — and stop before it stains."
                ],
                "steps": [
                        "Set X to 0. Production pins X at zero on 93.1% of layers; sideways drift is not how depth reads.",
                        "Set Y to 1–4px — down a little, or straight down. Upward shadows were 1.3% of measured layers.",
                        "Set blur to single digits for raises (the median is 3px, the 75th percentile 10px). Save 24px+ for glows.",
                        "Set color to neutral black at 0.08–0.12 alpha — the busiest measured bands are near-zero and 0.1–0.15.",
                        "If it still looks flat, add a second wider rung with negative spread instead of darkening the first."
                ],
                "code": {
                        "label": "Tokenized soft shadow — paste into a stylesheet",
                        "content": ":root {\n  --shadow-contact: 0 1px 2px rgba(16, 24, 40, 0.08);\n  --shadow-ambient: 0 8px 24px -6px rgba(16, 24, 40, 0.12);\n}\n.card {\n  box-shadow: var(--shadow-contact), var(--shadow-ambient);\n}"
                }
        },
        {
                "pageLink": {
                        "label": "Leggi l'articolo completo sui valori reali di box-shadow",
                        "path": "/css/box-shadow/examples",
                        "text": "Leggi l'articolo completo sui valori reali di box-shadow"
                }
        }
]
    },
    "id": {
      title: "Resep CSS bayangan lembut yang tidak tampak kusam atau berat",
      description: "Pelajari cara membuat bayangan UI yang halus dan realistis dengan transparansi alfa rendah daripada blur gelap berukuran raksasa.",
      readingTime: "5 mnt baca",
      tags: ["css","box-shadow","ui design","bayangan halus"],
      categoryLabel: "Pengembang",
      quickAnswer: "Lembut bukan berarti bayangan besar dan pekat. Bangun bayangan halus dengan nilai alfa rendah (0,05–0,12) dan dua lapisan (kontak + ambien), bukan satu blur gelap 40 px.",
      keyTakeaway: "Kelembutan berasal dari transparansi rendah dan kombinasi lapisan halus, bukan dari intensitas blur semata.",
      toolCta: {"label":"Sesuaikan resep bayangan ini lapis demi lapis di generator.","toolId":"box-shadow-generator"},
      seoTitle: "Resep Bayangan Lembut CSS (Box-Shadow) | GainUtility",
      seoDescription: "Resep siap pakai CSS box-shadow untuk bayangan lembut dan modern pada kartu antarmuka, dialog, dan tombol.",
      content: [
        {
                "paragraphs": [
                        "Soft shadows fail the same way every time: someone reaches for blur 40px, alpha 0.4, a blue-black tint — and gets a smudge that looks like a stain rather than depth. Softness is not produced by blur volume. It is produced by low contrast against the surface and a gradient that falls off gradually, which is a completely different set of knobs.",
                        "We measured this rather than guessed it: 33,438 box-shadow declarations across the shipped CSS of 533 reachable sites from the top 1,000. The recipes below stay inside the bands production actually uses."
                ],
                "pageLink": {
                        "label": "Baca artikel lengkap tentang nilai nyata box-shadow",
                        "path": "/blog/box-shadow-values-real-websites",
                        "text": "Baca artikel lengkap tentang nilai nyata box-shadow"
                }
        },
        {
                "heading": "Why soft shadows go muddy"
        },
        {
                "list": [
                        "Stacked alpha. Each translucent layer darkens the ones below it. Three layers at 0.3 black do not average out — they compound into a dark patch under the element.",
                        "Tinted colors. A navy or purple shadow reads as a stain on warm backgrounds. 73.8% of measured layers are achromatic — neutral black at low alpha — and neutral is what eyes read as 'shadow' rather than 'color'.",
                        "Identical rungs. Two layers with the same offset and near-same blur just double the darkness. Each rung needs a visibly different offset or blur to contribute anything new.",
                        "Blur without tuck. Big blurs grow the halo in every direction and swell the component's footprint. Pair large blurs with negative spread so the shadow tucks back under the card."
                ]
        },
        {
                "heading": "Recipe 1 — the one-layer raise"
        },
        {
                "paragraphs": [
                        "Start smaller than feels right. This value ships verbatim on real sites (including TinyURL and OpenStreetMap in our sample) and is enough for most list rows, settings panels, and quiet cards: X at zero, Y at one pixel, blur at two, black at 10%."
                ],
                "shadowDemo": {
                        "label": "One-layer raise — production-verified",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.1)",
                        "radius": 14
                }
        },
        {
                "heading": "Recipe 2 — contact + ambient"
        },
        {
                "paragraphs": [
                        "Real objects occlude light twice: a dark tight shadow where they nearly touch the surface, and a broader faint one spreading away. Two layers reproduce that — a small contact layer first (it paints on top), then a wide ambient layer with negative spread so it tucks under the card."
                ],
                "shadowDemo": {
                        "label": "Contact + ambient card",
                        "property": "box-shadow",
                        "value": "0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -6px rgba(0, 0, 0, 0.12)",
                        "radius": 16
                }
        },
        {
                "heading": "Recipe 3 — floating panel"
        },
        {
                "paragraphs": [
                        "For a card that is visibly above the page — a dropdown, a popover, a hovered row — raise both rungs together. Alphas stay at or below 0.14; the lift comes from the spread of distances, not from darkness."
                ],
                "shadowDemo": {
                        "label": "Floating panel",
                        "property": "box-shadow",
                        "value": "0 4px 12px -2px rgba(16, 24, 40, 0.1), 0 12px 28px -8px rgba(16, 24, 40, 0.12)",
                        "radius": 20
                }
        },
        {
                "heading": "Recipe 4 — soft headline"
        },
        {
                "paragraphs": [
                        "Text needs its own primitive. text-shadow traces the glyphs, so a single moderate layer keeps headline copy readable over busy backgrounds without smudging the letterforms the way a filter would."
                ],
                "shadowDemo": {
                        "label": "Soft text shadow",
                        "property": "text-shadow",
                        "value": "0 2px 8px rgba(0, 0, 0, 0.45)",
                        "text": "Soft headline"
                }
        },
        {
                "heading": "The alpha-first method"
        },
        {
                "paragraphs": [
                        "Instead of tuning blur until it 'feels soft', fix the order of operations. Start every shadow from the color: set alpha around 0.08, then add only enough offset and blur for the edge to read. Raise alpha in small steps only when the shadow disappears against the background — and stop before it stains."
                ],
                "steps": [
                        "Set X to 0. Production pins X at zero on 93.1% of layers; sideways drift is not how depth reads.",
                        "Set Y to 1–4px — down a little, or straight down. Upward shadows were 1.3% of measured layers.",
                        "Set blur to single digits for raises (the median is 3px, the 75th percentile 10px). Save 24px+ for glows.",
                        "Set color to neutral black at 0.08–0.12 alpha — the busiest measured bands are near-zero and 0.1–0.15.",
                        "If it still looks flat, add a second wider rung with negative spread instead of darkening the first."
                ],
                "code": {
                        "label": "Tokenized soft shadow — paste into a stylesheet",
                        "content": ":root {\n  --shadow-contact: 0 1px 2px rgba(16, 24, 40, 0.08);\n  --shadow-ambient: 0 8px 24px -6px rgba(16, 24, 40, 0.12);\n}\n.card {\n  box-shadow: var(--shadow-contact), var(--shadow-ambient);\n}"
                }
        },
        {
                "pageLink": {
                        "label": "Baca artikel lengkap tentang nilai nyata box-shadow",
                        "path": "/css/box-shadow/examples",
                        "text": "Baca artikel lengkap tentang nilai nyata box-shadow"
                }
        }
]
    },
  },
  "neumorphism-box-shadow-guide": {
    "pt-br": {
      title: "Box-shadow no neumorfismo: a fórmula de duas camadas e seus limites",
      description: "Como construir o efeito neumórfico clássico com duas sombras externas, quando ele funciona e por que a acessibilidade exige atenção.",
      readingTime: "6 min de leitura",
      tags: ["css","box-shadow","neumorfismo","ui design","acessibilidade"],
      categoryLabel: "Desenvolvedor",
      quickAnswer: "O neumorfismo usa duas sombras em um elemento com a mesma cor de fundo do contêiner: uma sombra clara no topo esquerdo e uma escura no canto inferior direito, criando a ilusão de extrusão na própria superfície.",
      keyTakeaway: "Neumorfismo = fundo idêntico + camada de luz superior esquerda + camada escura inferior direita. Reserve para controles decorativos e preserve anéis de foco para acessibilidade.",
      toolCta: {"label":"Comece pelo preset de Neumorfismo e ajuste as duas camadas no gerador.","toolId":"box-shadow-generator"},
      seoTitle: "Guia de Box-Shadow no Neumorfismo: Fórmula e Prática | GainUtility",
      seoDescription: "Aprenda a fórmula CSS do neumorfismo: valores de box-shadow, estados pressionados com inset e cuidados essenciais de contraste e acessibilidade.",
      content: [
        {
                "paragraphs": [
                        "Neumorphism (soft UI) breaks the normal shadow rule on purpose. Instead of lifting a white card off a gray page with one dark shadow, the element and the page are the same color, and two opposing shadows — one light, one dark — make the shape appear pressed out of (or into) the surface itself. There is no second surface color to hide behind: if the two layers are wrong, nothing else rescues the effect."
                ]
        },
        {
                "heading": "The formula"
        },
        {
                "paragraphs": [
                        "Two layers, opposed offsets, matching blur. The light layer goes up-left, the dark layer down-right, implying a light source from the top-left corner. On a light surface the light layer is near-opaque white; the dark layer stays low-alpha black so it reads as shading, not dirt."
                ],
                "code": {
                        "label": "The core declaration",
                        "content": "box-shadow:\n  -8px -8px 16px #ffffff,\n  8px 8px 16px rgba(0, 0, 0, 0.16);"
                }
        },
        {
                "paragraphs": [
                        "Here it is live — the same two layers the generator's Neumorphism preset ships, on a surface that matches its stage exactly, which is the whole trick:"
                ],
                "shadowDemo": {
                        "label": "Extruded — light up-left, dark down-right",
                        "property": "box-shadow",
                        "value": "-8px -8px 16px #ffffff, 8px 8px 16px rgba(0, 0, 0, 0.16)",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Why the background must match"
        },
        {
                "paragraphs": [
                        "The white layer only reads if the surface it lands on is the same color as the element — on a pure white page the light half vanishes, and you are left with an ordinary dark drop shadow. That is also why neumorphism forces a single flat background: move the element onto a card, a gradient, or a different section color and the illusion collapses at the boundary.",
                        "Dark mode works the same way with the roles kept: a dark surface color for both element and stage, a light layer at moderate alpha, and a deeper black layer for the opposite side. The formula is symmetric; only the palette flips."
                ]
        },
        {
                "heading": "The inset (pressed) variant"
        },
        {
                "paragraphs": [
                        "Flip both layers inside and the surface reads as pressed into the page — the classic soft-UI button-down and input-well state. Directions reverse with the inset: the dark layer now sits toward the top-left where light would be blocked, the light layer toward the bottom-right where it would catch the rim."
                ],
                "shadowDemo": {
                        "label": "Pressed — both layers inset",
                        "property": "box-shadow",
                        "value": "inset 6px 6px 12px rgba(0, 0, 0, 0.16), inset -6px -6px 12px #ffffff",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Where it works — and where it doesn't"
        },
        {
                "paragraphs": [
                        "Neumorphism is at its best on decorative, clearly-bounded surfaces: a dashboard of large stat tiles, a media-player knob, a toggle whose on/off state is obvious, a static hero panel. The extruded look is the point, and nothing depends on the tile being obviously clickable."
                ],
                "list": [
                        "Interactive controls need boundaries. When the button's color equals the page's color, only faint shading separates them — hover, focus, and disabled states all have to be solved separately, with a real focus ring (a zero-blur spread ring) rather than more shading.",
                        "Text-heavy UI gains nothing. The style adds no information to lists, forms, or tables; it only adds two shadows per element to keep consistent.",
                        "One background, ever. Sections with different backgrounds each need their own matched light/dark alphas, or the white layer blows out on the darker stage.",
                        "Stack carefully. Neumorphism's two layers plus a hover elevation layer compound — keep every additional layer at low alpha, or the extrusion turns into a smudge."
                ]
        },
        {
                "heading": "A working checklist"
        },
        {
                "steps": [
                        "Pick the surface color and use it for both the page stage and the element background — exactly the same value.",
                        "Add the light layer at -X -Y with a 16–24px blur; near-opaque white on light surfaces.",
                        "Add the dark layer at +X +Y with the same blur; keep it around 0.12–0.18 alpha.",
                        "Give interactive versions an explicit focus ring — for example 0 0 0 2px of an accent — so keyboard users are not relying on shading.",
                        "Pair the pressed state with the inset variant so the control has a clear down position."
                ],
                "pageLink": {
                        "label": "Ver o artigo completo sobre valores reais de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Ver o artigo completo sobre valores reais de box-shadow"
                }
        }
]
    },
    "es-mx": {
      title: "Box-shadow en neumorfismo: la fórmula de dos capas y sus límites",
      description: "Cómo implementar el efecto neumórfico con dos sombras CSS, cuándo utilizarlo y por qué el contraste accesible requiere cuidado.",
      readingTime: "6 min de lectura",
      tags: ["css","box-shadow","neumorfismo","ui design","accesibilidad"],
      categoryLabel: "Desarrollador",
      quickAnswer: "El neumorfismo consiste en dos sombras sobre un elemento con el mismo color de fondo del contenedor: una capa de luz arriba a la izquierda y una oscura abajo a la derecha, simulando extrusión sobre la superficie.",
      keyTakeaway: "Neumorfismo = fondo coincidente + capa clara arriba-izquierda + capa oscura abajo-derecha. Úsalo con moderación decorativa y mantén anillos de foco visibles.",
      toolCta: {"label":"Comienza con la plantilla de Neumorfismo y afina ambas capas en el generador.","toolId":"box-shadow-generator"},
      seoTitle: "Guia de Box-Shadow para Neumorfismo en CSS | GainUtility",
      seoDescription: "Domina la fórmula CSS de box-shadow para neumorfismo: capas claras y oscuras, estados de botón presionado y mejores prácticas de contraste.",
      content: [
        {
                "paragraphs": [
                        "Neumorphism (soft UI) breaks the normal shadow rule on purpose. Instead of lifting a white card off a gray page with one dark shadow, the element and the page are the same color, and two opposing shadows — one light, one dark — make the shape appear pressed out of (or into) the surface itself. There is no second surface color to hide behind: if the two layers are wrong, nothing else rescues the effect."
                ]
        },
        {
                "heading": "The formula"
        },
        {
                "paragraphs": [
                        "Two layers, opposed offsets, matching blur. The light layer goes up-left, the dark layer down-right, implying a light source from the top-left corner. On a light surface the light layer is near-opaque white; the dark layer stays low-alpha black so it reads as shading, not dirt."
                ],
                "code": {
                        "label": "The core declaration",
                        "content": "box-shadow:\n  -8px -8px 16px #ffffff,\n  8px 8px 16px rgba(0, 0, 0, 0.16);"
                }
        },
        {
                "paragraphs": [
                        "Here it is live — the same two layers the generator's Neumorphism preset ships, on a surface that matches its stage exactly, which is the whole trick:"
                ],
                "shadowDemo": {
                        "label": "Extruded — light up-left, dark down-right",
                        "property": "box-shadow",
                        "value": "-8px -8px 16px #ffffff, 8px 8px 16px rgba(0, 0, 0, 0.16)",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Why the background must match"
        },
        {
                "paragraphs": [
                        "The white layer only reads if the surface it lands on is the same color as the element — on a pure white page the light half vanishes, and you are left with an ordinary dark drop shadow. That is also why neumorphism forces a single flat background: move the element onto a card, a gradient, or a different section color and the illusion collapses at the boundary.",
                        "Dark mode works the same way with the roles kept: a dark surface color for both element and stage, a light layer at moderate alpha, and a deeper black layer for the opposite side. The formula is symmetric; only the palette flips."
                ]
        },
        {
                "heading": "The inset (pressed) variant"
        },
        {
                "paragraphs": [
                        "Flip both layers inside and the surface reads as pressed into the page — the classic soft-UI button-down and input-well state. Directions reverse with the inset: the dark layer now sits toward the top-left where light would be blocked, the light layer toward the bottom-right where it would catch the rim."
                ],
                "shadowDemo": {
                        "label": "Pressed — both layers inset",
                        "property": "box-shadow",
                        "value": "inset 6px 6px 12px rgba(0, 0, 0, 0.16), inset -6px -6px 12px #ffffff",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Where it works — and where it doesn't"
        },
        {
                "paragraphs": [
                        "Neumorphism is at its best on decorative, clearly-bounded surfaces: a dashboard of large stat tiles, a media-player knob, a toggle whose on/off state is obvious, a static hero panel. The extruded look is the point, and nothing depends on the tile being obviously clickable."
                ],
                "list": [
                        "Interactive controls need boundaries. When the button's color equals the page's color, only faint shading separates them — hover, focus, and disabled states all have to be solved separately, with a real focus ring (a zero-blur spread ring) rather than more shading.",
                        "Text-heavy UI gains nothing. The style adds no information to lists, forms, or tables; it only adds two shadows per element to keep consistent.",
                        "One background, ever. Sections with different backgrounds each need their own matched light/dark alphas, or the white layer blows out on the darker stage.",
                        "Stack carefully. Neumorphism's two layers plus a hover elevation layer compound — keep every additional layer at low alpha, or the extrusion turns into a smudge."
                ]
        },
        {
                "heading": "A working checklist"
        },
        {
                "steps": [
                        "Pick the surface color and use it for both the page stage and the element background — exactly the same value.",
                        "Add the light layer at -X -Y with a 16–24px blur; near-opaque white on light surfaces.",
                        "Add the dark layer at +X +Y with the same blur; keep it around 0.12–0.18 alpha.",
                        "Give interactive versions an explicit focus ring — for example 0 0 0 2px of an accent — so keyboard users are not relying on shading.",
                        "Pair the pressed state with the inset variant so the control has a clear down position."
                ],
                "pageLink": {
                        "label": "Ver el artículo completo sobre valores reales de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Ver el artículo completo sobre valores reales de box-shadow"
                }
        }
]
    },
    "es-co": {
      title: "Box-shadow en neumorfismo: la fórmula de dos capas y sus límites",
      description: "Cómo implementar el efecto neumórfico con dos sombras CSS, cuándo utilizarlo y por qué el contraste accesible requiere cuidado.",
      readingTime: "6 min de lectura",
      tags: ["css","box-shadow","neumorfismo","ui design","accesibilidad"],
      categoryLabel: "Desarrollador",
      quickAnswer: "El neumorfismo consiste en dos sombras sobre un elemento con el mismo color de fondo del contenedor: una capa de luz arriba a la izquierda y una oscura abajo a la derecha, simulando extrusión sobre la superficie.",
      keyTakeaway: "Neumorfismo = fondo coincidente + capa clara arriba-izquierda + capa oscura abajo-derecha. Úsalo con moderación decorativa y mantén anillos de foco visibles.",
      toolCta: {"label":"Comienza con la plantilla de Neumorfismo y afina ambas capas en el generador.","toolId":"box-shadow-generator"},
      seoTitle: "Guia de Box-Shadow para Neumorfismo en CSS | GainUtility",
      seoDescription: "Domina la fórmula CSS de box-shadow para neumorfismo: capas claras y oscuras, estados de botón presionado y mejores prácticas de contraste.",
      content: [
        {
                "paragraphs": [
                        "Neumorphism (soft UI) breaks the normal shadow rule on purpose. Instead of lifting a white card off a gray page with one dark shadow, the element and the page are the same color, and two opposing shadows — one light, one dark — make the shape appear pressed out of (or into) the surface itself. There is no second surface color to hide behind: if the two layers are wrong, nothing else rescues the effect."
                ]
        },
        {
                "heading": "The formula"
        },
        {
                "paragraphs": [
                        "Two layers, opposed offsets, matching blur. The light layer goes up-left, the dark layer down-right, implying a light source from the top-left corner. On a light surface the light layer is near-opaque white; the dark layer stays low-alpha black so it reads as shading, not dirt."
                ],
                "code": {
                        "label": "The core declaration",
                        "content": "box-shadow:\n  -8px -8px 16px #ffffff,\n  8px 8px 16px rgba(0, 0, 0, 0.16);"
                }
        },
        {
                "paragraphs": [
                        "Here it is live — the same two layers the generator's Neumorphism preset ships, on a surface that matches its stage exactly, which is the whole trick:"
                ],
                "shadowDemo": {
                        "label": "Extruded — light up-left, dark down-right",
                        "property": "box-shadow",
                        "value": "-8px -8px 16px #ffffff, 8px 8px 16px rgba(0, 0, 0, 0.16)",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Why the background must match"
        },
        {
                "paragraphs": [
                        "The white layer only reads if the surface it lands on is the same color as the element — on a pure white page the light half vanishes, and you are left with an ordinary dark drop shadow. That is also why neumorphism forces a single flat background: move the element onto a card, a gradient, or a different section color and the illusion collapses at the boundary.",
                        "Dark mode works the same way with the roles kept: a dark surface color for both element and stage, a light layer at moderate alpha, and a deeper black layer for the opposite side. The formula is symmetric; only the palette flips."
                ]
        },
        {
                "heading": "The inset (pressed) variant"
        },
        {
                "paragraphs": [
                        "Flip both layers inside and the surface reads as pressed into the page — the classic soft-UI button-down and input-well state. Directions reverse with the inset: the dark layer now sits toward the top-left where light would be blocked, the light layer toward the bottom-right where it would catch the rim."
                ],
                "shadowDemo": {
                        "label": "Pressed — both layers inset",
                        "property": "box-shadow",
                        "value": "inset 6px 6px 12px rgba(0, 0, 0, 0.16), inset -6px -6px 12px #ffffff",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Where it works — and where it doesn't"
        },
        {
                "paragraphs": [
                        "Neumorphism is at its best on decorative, clearly-bounded surfaces: a dashboard of large stat tiles, a media-player knob, a toggle whose on/off state is obvious, a static hero panel. The extruded look is the point, and nothing depends on the tile being obviously clickable."
                ],
                "list": [
                        "Interactive controls need boundaries. When the button's color equals the page's color, only faint shading separates them — hover, focus, and disabled states all have to be solved separately, with a real focus ring (a zero-blur spread ring) rather than more shading.",
                        "Text-heavy UI gains nothing. The style adds no information to lists, forms, or tables; it only adds two shadows per element to keep consistent.",
                        "One background, ever. Sections with different backgrounds each need their own matched light/dark alphas, or the white layer blows out on the darker stage.",
                        "Stack carefully. Neumorphism's two layers plus a hover elevation layer compound — keep every additional layer at low alpha, or the extrusion turns into a smudge."
                ]
        },
        {
                "heading": "A working checklist"
        },
        {
                "steps": [
                        "Pick the surface color and use it for both the page stage and the element background — exactly the same value.",
                        "Add the light layer at -X -Y with a 16–24px blur; near-opaque white on light surfaces.",
                        "Add the dark layer at +X +Y with the same blur; keep it around 0.12–0.18 alpha.",
                        "Give interactive versions an explicit focus ring — for example 0 0 0 2px of an accent — so keyboard users are not relying on shading.",
                        "Pair the pressed state with the inset variant so the control has a clear down position."
                ],
                "pageLink": {
                        "label": "Ver el artículo completo sobre valores reales de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Ver el artículo completo sobre valores reales de box-shadow"
                }
        }
]
    },
    "de": {
      title: "Neumorphismus mit box-shadow: Die Zwei-Ebenen-Formel und ihre Grenzen",
      description: "So erstellen Sie den extrudierten Neumorphismus-Effekt mit zwei CSS-Schatten, wann er funktioniert und warum Barrierefreiheit wichtig ist.",
      readingTime: "6 Min. Lesezeit",
      tags: ["css","box-shadow","neumorphismus","ui design","barrierefreiheit"],
      categoryLabel: "Entwickler",
      quickAnswer: "Neumorphismus basiert auf zwei Schatten auf einem Element, dessen Hintergrundfarbe exakt der des Containers entspricht: Ein heller Schatten oben links und ein dunkler unten rechts erzeugen den Eindruck einer extrudierten Oberfläche.",
      keyTakeaway: "Neumorphismus = identische Hintergrundfarbe + helles Licht oben links + dunkler Schatten unten rechts. Nur für dekorative Elemente nutzen und Fokusringe beibehalten.",
      toolCta: {"label":"Starten Sie mit dem Neumorphismus-Preset und optimieren Sie beide Ebenen.","toolId":"box-shadow-generator"},
      seoTitle: "CSS Neumorphismus Box-Shadow Anleitung & Formel | GainUtility",
      seoDescription: "CSS-Formel für Neumorphismus mit box-shadow: Licht- und Schattenebenen, Inset-Zustände bei Klicks und Kontrastrichtlinien.",
      content: [
        {
                "paragraphs": [
                        "Neumorphism (soft UI) breaks the normal shadow rule on purpose. Instead of lifting a white card off a gray page with one dark shadow, the element and the page are the same color, and two opposing shadows — one light, one dark — make the shape appear pressed out of (or into) the surface itself. There is no second surface color to hide behind: if the two layers are wrong, nothing else rescues the effect."
                ]
        },
        {
                "heading": "The formula"
        },
        {
                "paragraphs": [
                        "Two layers, opposed offsets, matching blur. The light layer goes up-left, the dark layer down-right, implying a light source from the top-left corner. On a light surface the light layer is near-opaque white; the dark layer stays low-alpha black so it reads as shading, not dirt."
                ],
                "code": {
                        "label": "The core declaration",
                        "content": "box-shadow:\n  -8px -8px 16px #ffffff,\n  8px 8px 16px rgba(0, 0, 0, 0.16);"
                }
        },
        {
                "paragraphs": [
                        "Here it is live — the same two layers the generator's Neumorphism preset ships, on a surface that matches its stage exactly, which is the whole trick:"
                ],
                "shadowDemo": {
                        "label": "Extruded — light up-left, dark down-right",
                        "property": "box-shadow",
                        "value": "-8px -8px 16px #ffffff, 8px 8px 16px rgba(0, 0, 0, 0.16)",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Why the background must match"
        },
        {
                "paragraphs": [
                        "The white layer only reads if the surface it lands on is the same color as the element — on a pure white page the light half vanishes, and you are left with an ordinary dark drop shadow. That is also why neumorphism forces a single flat background: move the element onto a card, a gradient, or a different section color and the illusion collapses at the boundary.",
                        "Dark mode works the same way with the roles kept: a dark surface color for both element and stage, a light layer at moderate alpha, and a deeper black layer for the opposite side. The formula is symmetric; only the palette flips."
                ]
        },
        {
                "heading": "The inset (pressed) variant"
        },
        {
                "paragraphs": [
                        "Flip both layers inside and the surface reads as pressed into the page — the classic soft-UI button-down and input-well state. Directions reverse with the inset: the dark layer now sits toward the top-left where light would be blocked, the light layer toward the bottom-right where it would catch the rim."
                ],
                "shadowDemo": {
                        "label": "Pressed — both layers inset",
                        "property": "box-shadow",
                        "value": "inset 6px 6px 12px rgba(0, 0, 0, 0.16), inset -6px -6px 12px #ffffff",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Where it works — and where it doesn't"
        },
        {
                "paragraphs": [
                        "Neumorphism is at its best on decorative, clearly-bounded surfaces: a dashboard of large stat tiles, a media-player knob, a toggle whose on/off state is obvious, a static hero panel. The extruded look is the point, and nothing depends on the tile being obviously clickable."
                ],
                "list": [
                        "Interactive controls need boundaries. When the button's color equals the page's color, only faint shading separates them — hover, focus, and disabled states all have to be solved separately, with a real focus ring (a zero-blur spread ring) rather than more shading.",
                        "Text-heavy UI gains nothing. The style adds no information to lists, forms, or tables; it only adds two shadows per element to keep consistent.",
                        "One background, ever. Sections with different backgrounds each need their own matched light/dark alphas, or the white layer blows out on the darker stage.",
                        "Stack carefully. Neumorphism's two layers plus a hover elevation layer compound — keep every additional layer at low alpha, or the extrusion turns into a smudge."
                ]
        },
        {
                "heading": "A working checklist"
        },
        {
                "steps": [
                        "Pick the surface color and use it for both the page stage and the element background — exactly the same value.",
                        "Add the light layer at -X -Y with a 16–24px blur; near-opaque white on light surfaces.",
                        "Add the dark layer at +X +Y with the same blur; keep it around 0.12–0.18 alpha.",
                        "Give interactive versions an explicit focus ring — for example 0 0 0 2px of an accent — so keyboard users are not relying on shading.",
                        "Pair the pressed state with the inset variant so the control has a clear down position."
                ],
                "pageLink": {
                        "label": "Den vollständigen Artikel über reale box-shadow-Werte lesen",
                        "path": "/css/box-shadow",
                        "text": "Den vollständigen Artikel über reale box-shadow-Werte lesen"
                }
        }
]
    },
    "fr": {
      title: "Box-shadow et neumorphisme : la formule à deux calques et ses limites",
      description: "Découvrez comment réaliser l'effet neumorphique avec deux ombres CSS, dans quels cas l'utiliser et comment préserver l'accessibilité.",
      readingTime: "6 min de lecture",
      tags: ["css","box-shadow","neumorphisme","ui design","accessibilité"],
      categoryLabel: "Développeur",
      quickAnswer: "Le neumorphisme applique deux ombres sur un élément partageant exactement la couleur de fond de son conteneur : une ombre claire en haut à gauche et une ombre sombre en bas à droite, créant une impression d'extrusion douce.",
      keyTakeaway: "Neumorphisme = fond identique + calque lumineux en haut à gauche + calque sombre en bas à droite. À réserver aux surfaces décoratives avec bagues de focus explicites.",
      toolCta: {"label":"Démarrez avec le préréglage Neumorphisme et réglez les deux couches en direct.","toolId":"box-shadow-generator"},
      seoTitle: "Guide du box-shadow neumorphique en CSS | GainUtility",
      seoDescription: "Comment concevoir un design neumorphique en CSS avec box-shadow : réglages d'ombres claires et sombres, état enfoncé et conseils d'accessibilité.",
      content: [
        {
                "paragraphs": [
                        "Neumorphism (soft UI) breaks the normal shadow rule on purpose. Instead of lifting a white card off a gray page with one dark shadow, the element and the page are the same color, and two opposing shadows — one light, one dark — make the shape appear pressed out of (or into) the surface itself. There is no second surface color to hide behind: if the two layers are wrong, nothing else rescues the effect."
                ]
        },
        {
                "heading": "The formula"
        },
        {
                "paragraphs": [
                        "Two layers, opposed offsets, matching blur. The light layer goes up-left, the dark layer down-right, implying a light source from the top-left corner. On a light surface the light layer is near-opaque white; the dark layer stays low-alpha black so it reads as shading, not dirt."
                ],
                "code": {
                        "label": "The core declaration",
                        "content": "box-shadow:\n  -8px -8px 16px #ffffff,\n  8px 8px 16px rgba(0, 0, 0, 0.16);"
                }
        },
        {
                "paragraphs": [
                        "Here it is live — the same two layers the generator's Neumorphism preset ships, on a surface that matches its stage exactly, which is the whole trick:"
                ],
                "shadowDemo": {
                        "label": "Extruded — light up-left, dark down-right",
                        "property": "box-shadow",
                        "value": "-8px -8px 16px #ffffff, 8px 8px 16px rgba(0, 0, 0, 0.16)",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Why the background must match"
        },
        {
                "paragraphs": [
                        "The white layer only reads if the surface it lands on is the same color as the element — on a pure white page the light half vanishes, and you are left with an ordinary dark drop shadow. That is also why neumorphism forces a single flat background: move the element onto a card, a gradient, or a different section color and the illusion collapses at the boundary.",
                        "Dark mode works the same way with the roles kept: a dark surface color for both element and stage, a light layer at moderate alpha, and a deeper black layer for the opposite side. The formula is symmetric; only the palette flips."
                ]
        },
        {
                "heading": "The inset (pressed) variant"
        },
        {
                "paragraphs": [
                        "Flip both layers inside and the surface reads as pressed into the page — the classic soft-UI button-down and input-well state. Directions reverse with the inset: the dark layer now sits toward the top-left where light would be blocked, the light layer toward the bottom-right where it would catch the rim."
                ],
                "shadowDemo": {
                        "label": "Pressed — both layers inset",
                        "property": "box-shadow",
                        "value": "inset 6px 6px 12px rgba(0, 0, 0, 0.16), inset -6px -6px 12px #ffffff",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Where it works — and where it doesn't"
        },
        {
                "paragraphs": [
                        "Neumorphism is at its best on decorative, clearly-bounded surfaces: a dashboard of large stat tiles, a media-player knob, a toggle whose on/off state is obvious, a static hero panel. The extruded look is the point, and nothing depends on the tile being obviously clickable."
                ],
                "list": [
                        "Interactive controls need boundaries. When the button's color equals the page's color, only faint shading separates them — hover, focus, and disabled states all have to be solved separately, with a real focus ring (a zero-blur spread ring) rather than more shading.",
                        "Text-heavy UI gains nothing. The style adds no information to lists, forms, or tables; it only adds two shadows per element to keep consistent.",
                        "One background, ever. Sections with different backgrounds each need their own matched light/dark alphas, or the white layer blows out on the darker stage.",
                        "Stack carefully. Neumorphism's two layers plus a hover elevation layer compound — keep every additional layer at low alpha, or the extrusion turns into a smudge."
                ]
        },
        {
                "heading": "A working checklist"
        },
        {
                "steps": [
                        "Pick the surface color and use it for both the page stage and the element background — exactly the same value.",
                        "Add the light layer at -X -Y with a 16–24px blur; near-opaque white on light surfaces.",
                        "Add the dark layer at +X +Y with the same blur; keep it around 0.12–0.18 alpha.",
                        "Give interactive versions an explicit focus ring — for example 0 0 0 2px of an accent — so keyboard users are not relying on shading.",
                        "Pair the pressed state with the inset variant so the control has a clear down position."
                ],
                "pageLink": {
                        "label": "Consulter l'article complet sur les vraies valeurs de box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Consulter l'article complet sur les vraies valeurs de box-shadow"
                }
        }
]
    },
    "it": {
      title: "Box-shadow e neumorfismo: la formula a due livelli e i suoi limiti",
      description: "Come riprodurre l'effetto neumorfico con due ombre CSS, quando conviene usarlo e come gestire i contrasti per l'accessibilità.",
      readingTime: "6 min de lettura",
      tags: ["css","box-shadow","neumorfismo","ui design","accessibilità"],
      categoryLabel: "Sviluppatore",
      quickAnswer: "Il neumorfismo impiega due ombre box-shadow su un elemento il cui sfondo coincide perfettamente con quello del contenitore: una luce in alto a sinistra e un'ombra scura in basso a destra per simulare un rilievo continuo.",
      keyTakeaway: "Neumorfismo = sfondo identico + luce in alto a sinistra + ombra scura in basso a destra. Usalo con prudenza decorativa senza rinunciare ai contorni di focus.",
      toolCta: {"label":"Parti dal preset Neumorfismo e regola entrambi i livelli con anteprima live.","toolId":"box-shadow-generator"},
      seoTitle: "Guida al Neumorfismo CSS con box-shadow | GainUtility",
      seoDescription: "Formula pratica per realizzare effetti neumorfici con CSS box-shadow: sfumature chiare, scure, versioni premute inset e requisiti di accessibilità.",
      content: [
        {
                "paragraphs": [
                        "Neumorphism (soft UI) breaks the normal shadow rule on purpose. Instead of lifting a white card off a gray page with one dark shadow, the element and the page are the same color, and two opposing shadows — one light, one dark — make the shape appear pressed out of (or into) the surface itself. There is no second surface color to hide behind: if the two layers are wrong, nothing else rescues the effect."
                ]
        },
        {
                "heading": "The formula"
        },
        {
                "paragraphs": [
                        "Two layers, opposed offsets, matching blur. The light layer goes up-left, the dark layer down-right, implying a light source from the top-left corner. On a light surface the light layer is near-opaque white; the dark layer stays low-alpha black so it reads as shading, not dirt."
                ],
                "code": {
                        "label": "The core declaration",
                        "content": "box-shadow:\n  -8px -8px 16px #ffffff,\n  8px 8px 16px rgba(0, 0, 0, 0.16);"
                }
        },
        {
                "paragraphs": [
                        "Here it is live — the same two layers the generator's Neumorphism preset ships, on a surface that matches its stage exactly, which is the whole trick:"
                ],
                "shadowDemo": {
                        "label": "Extruded — light up-left, dark down-right",
                        "property": "box-shadow",
                        "value": "-8px -8px 16px #ffffff, 8px 8px 16px rgba(0, 0, 0, 0.16)",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Why the background must match"
        },
        {
                "paragraphs": [
                        "The white layer only reads if the surface it lands on is the same color as the element — on a pure white page the light half vanishes, and you are left with an ordinary dark drop shadow. That is also why neumorphism forces a single flat background: move the element onto a card, a gradient, or a different section color and the illusion collapses at the boundary.",
                        "Dark mode works the same way with the roles kept: a dark surface color for both element and stage, a light layer at moderate alpha, and a deeper black layer for the opposite side. The formula is symmetric; only the palette flips."
                ]
        },
        {
                "heading": "The inset (pressed) variant"
        },
        {
                "paragraphs": [
                        "Flip both layers inside and the surface reads as pressed into the page — the classic soft-UI button-down and input-well state. Directions reverse with the inset: the dark layer now sits toward the top-left where light would be blocked, the light layer toward the bottom-right where it would catch the rim."
                ],
                "shadowDemo": {
                        "label": "Pressed — both layers inset",
                        "property": "box-shadow",
                        "value": "inset 6px 6px 12px rgba(0, 0, 0, 0.16), inset -6px -6px 12px #ffffff",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Where it works — and where it doesn't"
        },
        {
                "paragraphs": [
                        "Neumorphism is at its best on decorative, clearly-bounded surfaces: a dashboard of large stat tiles, a media-player knob, a toggle whose on/off state is obvious, a static hero panel. The extruded look is the point, and nothing depends on the tile being obviously clickable."
                ],
                "list": [
                        "Interactive controls need boundaries. When the button's color equals the page's color, only faint shading separates them — hover, focus, and disabled states all have to be solved separately, with a real focus ring (a zero-blur spread ring) rather than more shading.",
                        "Text-heavy UI gains nothing. The style adds no information to lists, forms, or tables; it only adds two shadows per element to keep consistent.",
                        "One background, ever. Sections with different backgrounds each need their own matched light/dark alphas, or the white layer blows out on the darker stage.",
                        "Stack carefully. Neumorphism's two layers plus a hover elevation layer compound — keep every additional layer at low alpha, or the extrusion turns into a smudge."
                ]
        },
        {
                "heading": "A working checklist"
        },
        {
                "steps": [
                        "Pick the surface color and use it for both the page stage and the element background — exactly the same value.",
                        "Add the light layer at -X -Y with a 16–24px blur; near-opaque white on light surfaces.",
                        "Add the dark layer at +X +Y with the same blur; keep it around 0.12–0.18 alpha.",
                        "Give interactive versions an explicit focus ring — for example 0 0 0 2px of an accent — so keyboard users are not relying on shading.",
                        "Pair the pressed state with the inset variant so the control has a clear down position."
                ],
                "pageLink": {
                        "label": "Leggi l'articolo completo sui valori reali di box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Leggi l'articolo completo sui valori reali di box-shadow"
                }
        }
]
    },
    "id": {
      title: "Box-shadow neumorphism: Rumus dua lapisan dan batasannya",
      description: "Cara membuat efek neumorphic halus dengan dua bayangan CSS, kapan menggunakannya, dan mengapa kontras aksesibilitas sangat penting.",
      readingTime: "6 mnt baca",
      tags: ["css","box-shadow","neumorphism","ui design","aksesibilitas"],
      categoryLabel: "Pengembang",
      quickAnswer: "Neumorphism menggabungkan dua bayangan luar pada elemen dengan warna latar belakang yang persis sama dengan wadahnya: satu bayangan terang di kiri-atas dan satu bayangan gelap di kanan-bawah, menciptakan efek tonjolan permukaan yang menyatu.",
      keyTakeaway: "Neumorphism = latar belakang identik + bayangan terang kiri-atas + bayangan gelap kanan-bawah. Gunakan untuk kontrol dekoratif dan tetap sediakan outline fokus yang jelas.",
      toolCta: {"label":"Mulai dari preset Neumorphism dan sesuaikan kedua lapisan di generator.","toolId":"box-shadow-generator"},
      seoTitle: "Panduan Box-Shadow Neumorphism CSS | GainUtility",
      seoDescription: "Pelajari rumus box-shadow CSS untuk efek neumorphism: kombinasi bayangan terang dan gelap, inset saat ditekan, serta standar kontras UI.",
      content: [
        {
                "paragraphs": [
                        "Neumorphism (soft UI) breaks the normal shadow rule on purpose. Instead of lifting a white card off a gray page with one dark shadow, the element and the page are the same color, and two opposing shadows — one light, one dark — make the shape appear pressed out of (or into) the surface itself. There is no second surface color to hide behind: if the two layers are wrong, nothing else rescues the effect."
                ]
        },
        {
                "heading": "The formula"
        },
        {
                "paragraphs": [
                        "Two layers, opposed offsets, matching blur. The light layer goes up-left, the dark layer down-right, implying a light source from the top-left corner. On a light surface the light layer is near-opaque white; the dark layer stays low-alpha black so it reads as shading, not dirt."
                ],
                "code": {
                        "label": "The core declaration",
                        "content": "box-shadow:\n  -8px -8px 16px #ffffff,\n  8px 8px 16px rgba(0, 0, 0, 0.16);"
                }
        },
        {
                "paragraphs": [
                        "Here it is live — the same two layers the generator's Neumorphism preset ships, on a surface that matches its stage exactly, which is the whole trick:"
                ],
                "shadowDemo": {
                        "label": "Extruded — light up-left, dark down-right",
                        "property": "box-shadow",
                        "value": "-8px -8px 16px #ffffff, 8px 8px 16px rgba(0, 0, 0, 0.16)",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Why the background must match"
        },
        {
                "paragraphs": [
                        "The white layer only reads if the surface it lands on is the same color as the element — on a pure white page the light half vanishes, and you are left with an ordinary dark drop shadow. That is also why neumorphism forces a single flat background: move the element onto a card, a gradient, or a different section color and the illusion collapses at the boundary.",
                        "Dark mode works the same way with the roles kept: a dark surface color for both element and stage, a light layer at moderate alpha, and a deeper black layer for the opposite side. The formula is symmetric; only the palette flips."
                ]
        },
        {
                "heading": "The inset (pressed) variant"
        },
        {
                "paragraphs": [
                        "Flip both layers inside and the surface reads as pressed into the page — the classic soft-UI button-down and input-well state. Directions reverse with the inset: the dark layer now sits toward the top-left where light would be blocked, the light layer toward the bottom-right where it would catch the rim."
                ],
                "shadowDemo": {
                        "label": "Pressed — both layers inset",
                        "property": "box-shadow",
                        "value": "inset 6px 6px 12px rgba(0, 0, 0, 0.16), inset -6px -6px 12px #ffffff",
                        "radius": 24,
                        "stageBg": "#E4E8E2",
                        "boxBg": "#E4E8E2"
                }
        },
        {
                "heading": "Where it works — and where it doesn't"
        },
        {
                "paragraphs": [
                        "Neumorphism is at its best on decorative, clearly-bounded surfaces: a dashboard of large stat tiles, a media-player knob, a toggle whose on/off state is obvious, a static hero panel. The extruded look is the point, and nothing depends on the tile being obviously clickable."
                ],
                "list": [
                        "Interactive controls need boundaries. When the button's color equals the page's color, only faint shading separates them — hover, focus, and disabled states all have to be solved separately, with a real focus ring (a zero-blur spread ring) rather than more shading.",
                        "Text-heavy UI gains nothing. The style adds no information to lists, forms, or tables; it only adds two shadows per element to keep consistent.",
                        "One background, ever. Sections with different backgrounds each need their own matched light/dark alphas, or the white layer blows out on the darker stage.",
                        "Stack carefully. Neumorphism's two layers plus a hover elevation layer compound — keep every additional layer at low alpha, or the extrusion turns into a smudge."
                ]
        },
        {
                "heading": "A working checklist"
        },
        {
                "steps": [
                        "Pick the surface color and use it for both the page stage and the element background — exactly the same value.",
                        "Add the light layer at -X -Y with a 16–24px blur; near-opaque white on light surfaces.",
                        "Add the dark layer at +X +Y with the same blur; keep it around 0.12–0.18 alpha.",
                        "Give interactive versions an explicit focus ring — for example 0 0 0 2px of an accent — so keyboard users are not relying on shading.",
                        "Pair the pressed state with the inset variant so the control has a clear down position."
                ],
                "pageLink": {
                        "label": "Baca artikel lengkap tentang nilai nyata box-shadow",
                        "path": "/css/box-shadow",
                        "text": "Baca artikel lengkap tentang nilai nyata box-shadow"
                }
        }
]
    },
  },
};
