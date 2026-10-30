# GainUtility — Outreach Templates

Signature: **Naveen, GainUtility** (gainutility.com). Every email ends with a plain, honest one-line product description. No DR/traffic/traffic-rank mentions. No "I've been following your site for years" filler. No fake familiarity.

**Global rules:**
- Personalize the `[BRACKET]` sections with the real quote/page detail from `backlink-prospects.csv` Notes — send nothing that reads as mail-merge.
- One target = one thread. Never batch-send to multiple contacts in the same company.
- Max 150 words in the body. Editors answer short mail.
- Honest claims only: "free, no account, files processed in the browser" — never "we never touch your files" where processing is external (OCR: disclose).
- Log the send in the CSV (`Date Contacted`), set a follow-up (+7 days), and never mark `Link Acquired` without a live URL check.
- If a page links with `rel="nofollow"`/`sponsored`, record it in `Link Type` anyway — a relevant nofollow from a real editorial page still beats a followed link from a link farm.

---

## Template 1 — Broken-link replacement

**When:** outbound link on the page is dead, DNS-failed, 301'd to unrelated site, or hijacked (rows 27, 30, 20 in CSV).
**Subject:** `[SPECIFIC PROBLEM] on your [PAGE TOPIC]`

```
Hi [NAME or "there"],

I found [N] links on your "[PAGE TITLE]" page that no longer resolve as described:
- [OLD LINK] → [what actually happens: DNS dead / now redirects to X / affiliate page]

[GainUtility URL] is a free, no-account [tool category] that runs in the browser —
a working replacement if you'd like to update the page.

Full link-status list for the page available if useful.

— Naveen, GainUtility (gainutility.com) — 140+ free browser tools, no sign-up,
files processed locally in your browser.
```

**Why it works:** leads with a gift (their bug), not our ask. Send the status list even if they don't reply — it often triggers a reply.

## Template 2 — Competitor-mention / editorial suggestion

**When:** page lists competitor tools and invites suggestions, or plainly has a slot our tool fits (rows 1, 2, 3, 9, 14, 15, 17, 18).
**Subject:** `Suggestion for your [PAGE TOPIC]`

```
Hi [NAME / TEAM],

Your [PAGE TITLE] covers [COMPETITOR(S)] — quote: "[REAL QUOTE FROM PAGE]".

[ONE SENTENCE: the reader gap our tool fills — e.g., "nothing there addresses
files that can't be uploaded to a cloud tool"].

GainUtility ([TARGET URL]) is free with no account and processes files in the
browser. [ONE PROOF POINT: e.g., "exact free-tier limits for X, Y, Z available
if you want to update the comparison"].

Happy to send screenshots/details in your format.

— Naveen, GainUtility (gainutility.com) — 140+ free browser tools, no sign-up.
```

**Why it works:** the quote proves we read their page; the "gap" line gives them an editorial reason, not a favor reason.

## Template 3 — Resource / library page inclusion

**When:** libguide, university resource page, curated directory (rows 6–10, 11).
**Subject:** `Free tool for your [PAGE TOPIC]`

```
Hello,

Your [libguide/resource page] recommends [COMPETITOR] for [TASK].
GainUtility ([TARGET URL]) offers the same task free, with no account —
files are processed in the browser, which fits [SENSITIVE CONTEXT:
law documents / student work on managed lab machines / accessibility workflows].

[DISCLOSURE LINE WHERE APPLICABLE: "Our OCR page documents exactly how files
are processed."]

Happy to provide a description in your page's format.

— Naveen, GainUtility (gainutility.com) — 140+ free browser tools, no sign-up.
```

**Why it works:** institutional curators need a reason to add *and* a format to paste. Offer both. Never claim compliance (FERPA/GDPR) we haven't certified.

## Template 4 — Guest contribution

**When:** site has write-for-us / proposer-article-invite / collabora (rows 5, 15, 18).
**Subject:** `Guest idea: [CONCRETE HEADLINE FOR THEIR AUDIENCE]`

```
Hi [TEAM],

I'd like to contribute a guest piece for [SITE]: "[WORKING HEADLINE]"
([N]-word outline below).

1. [Point 1]
2. [Point 2]
3. [Point 3]

[ONE LINE: why we're qualified — "I build GainUtility, a browser-based PDF
toolkit; the article includes no promotional claims beyond one tool mention
you can cut."]

Outline on request; happy to follow your editorial format.

— Naveen, GainUtility (gainutility.com)
```

**Rules:** headline must be for *their* audience, never "Why GainUtility is great". Agree the tool mention (usually 1, with link) before writing. Non-exclusive, they own editing rights.

## Template 5 — Regional / localized pitch

**When:** non-EN listicles and tip lines (rows 14–18). **Write in the page's language.**

Skeleton (translate properly, don't machine-literal):

- **PT-BR (Giz):** `Dica: ferramenta gratuita de PDF que roda no navegador` — "gratuita, sem cadastro, processa arquivos no navegador".
- **IT (MRW):** `Voce da aggiungere: strumento PDF gratuito (senza registrazione)` — mirror their "Vai al sito" entry format.
- **DE (CHIP):** `Web-App-Vorschlag für Ihren [THEMA]-Ratgeber` — target the explicit Web-App section; kostenlos / keine Anmeldung.
- **FR (wecomm):** `Outil à ajouter : [THÈME] gratuit, sans compte` — mention article-invite route if list inclusion stalls.
- **ID (Kumparan):** submit a complete Bahasa how-to via the contributor program (see Top 20 #16) — no pitch email needed.

Localized pitches must reference the **localized GainUtility URL** (`/pt-br/...`, `/de/...`, `/fr/...`, `/it/...`, `/id/...`) and offer localized screenshots.

## Template 6 — Directory submission (copy-paste fields)

**SaaSHub:** see `TOP-20-TARGETS.md` #19. **Product Hunt:** see #20. Both are `OWNER ACTION REQUIRED` — the agent cannot create accounts.

---

## Community answers (value-first drafts — OWNER ACTION REQUIRED)

**Hard rule:** post only from an established, transparent account. Disclose affiliation in the first or last line ("full disclosure: I build this tool"). Communities listed below downvote promo; the disclosure is what makes a tool link survivable. Never paste the same text twice.

### Draft A — r/pdf, confidential-docs threads (CSV rows 55, 59)

> If the files can't leave your machine, the honest answer is: use a tool that processes them locally in the browser instead of uploading them. Browser-based tools (GainUtility, PDFsam's web build, or a desktop tool like PDF Arranger) do the merge/compress without a server ever seeing the file. Check the tool's page for a "files are processed locally" statement and verify it in the network tab if you're paranoid — that's what I'd do. Full disclosure: I build one of these (GainUtility).

### Draft B — r/pdf / job-portal size threads (CSV rows 56, 58)

> Before compressing blindly, check the portal's actual limit — most job portals cap at 2–10 MB and the fix is usually image downsampling inside the PDF, not object-level tricks. Compress to a target: if you're over the limit because of scans, downsample images to 150–200 DPI; if it's fonts/vector, size barely moves. [Link to our File Size Guide once published — until then, no link, just the advice.] Full disclosure: I build a free browser-based compressor.

### Draft C — Quora "specific size" question (CSV row 63)

> [Answer the full mechanics first: PDF size = embedded images (usually 80%+), fonts, object streams. Steps: (1) identify what's heavy — print-to-PDF vs scans, (2) re-render images at the DPI you actually need, (3) re-save with object-stream compression, (4) verify against the portal limit.] A free browser-based tool can do steps 2–4 without uploading the file — e.g., gainutility.com/pdf/compress. Full disclosure: I build it.

### Draft D — Super User (Stack Exchange, row 67 — 1000 government PDFs under 2 MB)

> [Technical answer first: batch compression of 1000 PDFs is a scriptable job — qpdf / Ghostscript `gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook` runs headless. Give the actual command. Then: for occasional use without a shell, browser-based tools handle it one file at a time but won't beat a batch script at this volume.] Disclosure: I build a browser-based PDF toolkit.

**Why Draft D leads with `gs`:** Stack Exchange explicitly allows product mentions only as *incidental* to a complete non-promotional answer. A scripted answer earns the link; a tool-only answer earns a moderator flag.

---

## Follow-up schedule (all templates)

| Step | Timing | Action |
|------|--------|--------|
| 1 | Day 0 | Send |
| 2 | Day 7 | One bump: " circling back in case this got buried — happy to send the status list / screenshots" (no new pitch) |
| 3 | Day 14 | Final: "Closing the loop — if you'd like the material later, just reply 'yes'. Wish you the best with the page." |
| 4 | Day 21 | No reply → mark `Response: no reply`, move to next prospect. Never send a 4th email. |
