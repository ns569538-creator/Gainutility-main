# GainUtility — Backlink Campaign Plan (30 Days + Ongoing)

Campaign start: 2026-10-01. Deliverables: this file + `backlink-prospects.csv` (78 rows) + `TOP-20-TARGETS.md` + `LINKABLE-ASSETS.md` + `OUTREACH-TEMPLATES.md`.
Rules of engagement: no PBNs, link farms, paid links, spam comments, fake guest sites, scraped/AI-content sites. No fabricated metrics or contacts. No "link acquired" without a live URL.

---

## §1 Competitor pattern analysis (where competitor links actually come from)

Evidence base: live-fetched pages — TechRadar, MakeUseOf, pdf.net, Smallpdf blog, iLovePDF blog, PDF24 FAQ, plus all 78 CSV rows. **Not verified:** PCWorld (403), Adobe's own pages — treat anything about them as unconfirmed.

**Smallpdf** — the most consistently linked brand in our prospect set: appears in TechRadar, MakeUseOf, Techshali, The Business Dive, OutrightCRM, USC/Penn State/ASU libguides, and every regional listicle we checked. Sources of its links: listicle ubiquity, blog/help-center content others cite, and step-by-step tutorials institutions embed ("Go to smallpdf.com…"). *Takeaway: competitors win links by being the default instruction, not by being listed.*

**iLovePDF** — same listicle coverage, plus localized subpaths (`/es`, `/fr`, `/pt`) that earn regional placements. Its blog publishes how-to content other sites reference. *Takeaway: localization is a link strategy, not a translation chore — we already ship 6 locales.*

**PDF24** — dominant in DE; linked from CHIP via download-page integrations, not editorial love. *Takeaway: DE placements need the Web-App/Gratis framing.*

**Adobe** — the premium anchor in every listicle ("best overall"). We cannot and should not compete there; our slot is the free/no-account/privacy column.

**Sejda** — wins single-tool reviews (The Business Dive, Softlookup) rather than list slots. *Takeaway: a dedicated review angle exists for us if we ever offer a free desktop-style tier worth reviewing.*

**Rival-vendor listicles (pdf.net, pdnob.com, trulyfreetools.com, toolisthub.com, fynepdf.com — CSV rows 74–78, RESEARCHED)** — competitors link each other through "alternatives" content. This is the same mechanic Techshali (#3) runs at scale. They are link targets *and* a content model to borrow.

### Cross-competitor link triggers (the 6 mechanisms we can act on)

| # | Trigger | Example in our set | Our lever |
|---|---------|--------------------|-----------|
| 1 | Listicle "free" slot | Giz, MRW, CHIP, wecomm, Techshali | `/pdf` hub + localized guides |
| 2 | Dead/hijacked outbound link | FreewareGenius, Globinch, TechSupportAlert | existing tools, no new build |
| 3 | Institution needs free/no-account tool | USC, Penn State, URV, ASU, King's | existing tools + honesty on processing |
| 4 | Upload-limit / size question | Penn State tutorial, r/pdf, Quora | File Size Guide (§Content gaps) |
| 5 | Tool-submission program | The Business Dive, SaaSHub, Product Hunt | owner action, copy ready |
| 6 | Guest-post route | OutrightCRM, wecomm, MRW | one guest piece per site max |

### Content gaps competitors leave open (ranked)

1. **Neutral file-size / upload-limit reference** — nobody publishes "how big can my PDF be for X" without selling a tool. Unblocks Penn State, r/pdf, Quora, TechRadar. → `LINKABLE-ASSETS.md` §2.
2. **Privacy/upload-risk explainer** — communities literally ask "what happens to uploaded docs"; incumbents can't answer it credibly. → §4.
3. **Published-method compression benchmark** — every listicle is editorial opinion; one reproducible study gets cited by all of them. → §7 (numbers only after tests).
4. **PDF↔Word + troubleshooting guides we don't have** — needed as pitch targets for rows 12/13. → §5, §6.
5. **OSS presence** — blocked behind the feasibility gate; only then GitHub lists. → §8.

**Ranked recommendation:** build gap assets in the order above, but *send week-1 outreach against existing pages only* — never promise an asset that doesn't exist yet in an email.

---

## §2 Directories

| Directory | Priority | Status | Route |
|-----------|----------|--------|-------|
| SaaSHub | A | OWNER ACTION REQUIRED (rules fetched) | submit page; email on gainutility.com domain = priority queue; must list competitors |
| Product Hunt | A | OWNER ACTION REQUIRED (rules fetched) | maker account; wait ~1 week after signup; schedule up to 1 month ahead; frame as privacy-first suite |
| DEV.to | A | OWNER ACTION REQUIRED | org account; technical article (e.g., "how client-side PDF compression works") — no marketing posts |
| Alternative.me | B | VERIFIED | open submission |
| Uneed | B | VERIFIED | free queue + paid tiers (free only — **no paid links**) |
| py-pdf/awesome-pdf | B | VERIFIED | PR route — **gated on OSS gate (§8)** |
| G2 | D | VERIFIED (rules) — B2C excluded | skip |
| Capterra, SourceForge | D | NOT YET VERIFIED (403/522) | skip until verified; SourceForge also gated on OSS |
| AlternativeTo | D | VERIFIED | skip — PDF tools explicitly declined |
| toolfinder.co | D | VERIFIED | skip — paid placement = paid link |
| awesome-selfhosted | D | VERIFIED | skip — requires self-hostable software |

**No directory is paid for.** If a directory's only route is payment, it leaves the plan.

---

## §3 Regional

Locales shipped: en, pt-br, id, es-mx, es-co, de, fr, it. Regional pitches go out **in the page's language** with **localized GainUtility URLs** (all confirmed in sitemap: `/pt-br/blog/how-to-compress-a-pdf`, `/de/...`, `/fr/...`, `/it/...`, `/id/...`).

- **A-group:** Giz Brasil (PT tip line), MRW.it (IT, "Vai al sito" format), Kumparan (ID — publish a full contributor article, no pitch), CHIP.de (DE Web-App slot), wecomm.fr (FR list + guest).
- **B-group:** CNN Indonesia (ID), CeoTech (IT), anymp4.fr (FR), IONOS (DE), ONLYOFFICE (ES vendor blog), Wondershare ES (competitor site — low odd, monitor).
- **C-group:** TechTudo (PT) — monitor.
- **Locale coverage note:** es-mx/es-co have guides but no A-group target yet — add one Spanish publication to the CSV in week 4 (research gap to close, don't improvise one).

---

## §4 Communities & digital PR

**Community rows (CSV 55–68) are RESEARCHED + OWNER ACTION REQUIRED** — Reddit/Quora fetches hit login walls; answers cannot be posted by this agent. Drafts are ready in `OUTREACH-TEMPLATES.md` (Drafts A–D).

- **A-group:** r/pdf client-side/sensitive-doc threads (55, 56, 59), Quora size question (63), Super User 1000-PDFs (67 — answer with `gs`/qpdf first, tool mention incidental).
- **Disclose affiliation every time** ("I build this tool"). One answer per thread, never repeated text, never before the account is established.
- **Hacker News (68):** D — wait for an established non-promotional account; a launch post from a fresh account dies.
- **Digital PR:** HARO (A — free source subscription), Connectively (B — relaunched June 2026), Featured (B), Qwoted (B), SourceBottle (C). Target queries about remote work privacy, file sharing, small-business docs. **Harvest 2–3 query alerts before signing up to anything paid.**

---

## §5 30-Day Plan

### Week 1 — Foundations + highest-probability sends
- **Day 1:** CSV imported into tracking sheet; create send log; verify target URLs still 200 (spot-check Top 20).
- **Day 1–2:** Submit **SaaSHub** and prepare **Product Hunt** account (owner action; PH posts no earlier than day ~8).
- **Day 2:** Broken-link batch — email TechSupportAlert (#11), FreewareGenius (#12), Globinch (#13) using Template 1 with verified link-status lists.
- **Day 3:** Institutional batch — USC (#6), Penn State (#7), King's (#9) using Template 3 (3 emails, separate days preferred; max 1/day).
- **Day 4:** URV (#8), ASU Print Lab (#10) — Template 3.
- **Day 5:** Editorial start — Techshali (#3, public editor email, fastest), The Business Dive (#4, submit form). **Re-pull quotes for #4/#5 before sending** (marked in CSV).
- **Day 7:** Follow-ups begin on day-0 sends (7-day rule).

### Week 2 — Editorial EN + assets kickoff
- **Days 8–10:** TechRadar (#1), MakeUseOf (#2), OutrightCRM (#5) — Templates 2 and 4. Product Hunt launch (if account mature).
- **Days 8–12 (parallel build track):** Privacy Guide + PDF↔Word guides enter build (Phase 1 of `LINKABLE-ASSETS.md`) — **implementation only after user review of specs.**
- **Day 11:** DEV.to technical article drafted (owner publishes).
- **Day 12–14:** First benchmark *runs* may start (corpus prep) — results stay private until methodology + runs complete.

### Week 3 — Regional + community
- **Days 15–17:** PT/IT/DE/FR pitches — Giz (#14), MRW (#15), CHIP (#17), wecomm (#18), all Template 5 in-language.
- **Days 15–19:** Kumparan contributor article submitted (#16, owner action).
- **Days 18–21:** Community answers — Draft A/B on the two hottest r/pdf threads, Draft D on Super User (owner posts from established accounts; disclose).
- **Day 21:** Mid-campaign audit: replies, live links, dead ends (see §6 metrics).

### Week 4 — PR + directories + consolidation
- **Days 22–24:** HARO/Connectively queries — only respond where GainUtility genuinely informs the story.
- **Days 22–26:** Remaining directories (Alternative.me, Uneed free tier, DEV.to article live).
- **Days 25–28:** Second follow-up round (day-14 final emails) on all non-responders; close loops per schedule.
- **Days 28–30:** Full CSV audit: every row has status; re-verify every claimed link live; write month-1 report; roll non-responders/second-tier prospects into month 2.

**Cadence rule: ≤5 new outreach emails/day, 1 per domain ever per week.** This is a reputation-limited resource.

---

## §6 Metrics (measured only from the CSV — no estimated metrics)

| Metric | Source | Month-1 target |
|--------|--------|----------------|
| Emails sent | `Date Contacted` | 30–40 (Top 20 + B-tier spillover) |
| Replies | `Response` | report actual % — no benchmark invented |
| Links acquired | `Link Acquired` + **live fetch check** | report actual count |
| Live dofollow links | `Link Type` verified | report actual |
| Directory listings live | manual check | SaaSHub/PH/DEV submitted; 1–2 live |
| Community answers posted | owner log | 3–5 (disclosed) |
| Assets shipped | build log | Phase 1 (Privacy + PDF↔Word) |

**Quality gates:** a link counts only if (a) page is live, (b) outbound URL returns 200, (c) we know its rel type. Nofollow editorial links are reported separately, never hidden. DR/Traffic columns get filled **only from the user's Ahrefs export** — never estimated.

**Monthly rituals:** re-verify all acquired links (links die); re-pull quotes for RESEARCHED rows before use; refresh benchmark quarterly if shipped.

---

## §7 Risk list — never (regardless of results)

1. Buying links, sponsored posts without `rel="sponsored"`, or paid directories (Toolfinder precedent).
2. PBNs, link farms, sitewide footer/widget links, unrelated directory spam.
3. Spam comments/forums with links; mass-posting the same community answer.
4. Fake "guest-post sites" and AI-content farms — check a site's human editorial footprint before pitching.
5. Private/indirect link exchanges ("I'll link you if…") at scale.
6. Over-optimized anchors — anchor distribution comes from the CSV `Suggested Anchor` column varied by context, exact-match spam patterns avoided.
7. Claiming DR/traffic/backlinks we didn't measure; claiming a link exists without fetching it.
8. Emailing scraped personal addresses — only published role/editorial contacts.
9. Any AI-generated guest content presented as expert human writing.

**Status legend (used across all files):** VERIFIED = fetched + quoted live 2026-10-01 · RESEARCHED = known but fetch blocked (login wall) · OWNER ACTION REQUIRED = needs account/submission only the owner can do · NOT YET VERIFIED = could not fetch (403/522) — do not pitch from it.
