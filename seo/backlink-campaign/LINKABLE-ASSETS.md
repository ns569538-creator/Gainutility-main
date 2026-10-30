# GainUtility — Linkable Asset Roadmap

Status: **SPEC ONLY — no site code changes this phase.** Each asset below is a build spec for review; implementation happens after sign-off.
Every asset must be reachable from the sitemap and internally linked per the architecture in §6.

**Linkability test an asset must pass before build:** (1) a journalist/librarian/blogger can cite it without reading the whole page, (2) it states something competitors don't already state, (3) it exists at a stable URL we can pitch for months.

---

## 1. PDF Tools Hub — `https://gainutility.com/pdf`

**Status today:** exists (`/pdf` in sitemap, hub content in `src/i18n/hubs.ts`).
**Upgrade spec:**
- Position as the citable directory: 44 PDF tools grouped by job (Organize / Convert / Compress / Secure / Edit), each with a one-line "when to use this" description.
- Add a comparison strip: GainUtility vs Smallpdf vs iLovePDF vs PDF24 on three verifiable axes only — *account required?*, *file uploaded to a server?*, *free tier limits*. **No DR/traffic/quality claims.**
- Add FAQ block (schema-marked): "Do I need an account?", "Are my files uploaded?", "What's the file size limit?" — these become featured-snippet targets for libguide-style pages that currently link out to Smallpdf.
**Pitched to:** Techshali (#3), The Business Dive (#4), OutrightCRM (#5), URV libguide (#8).

## 2. File Size Guide — new URL (proposed `https://gainutility.com/blog/pdf-file-size-limits`)

**Why it's linkable:** every institutional prospect in the Top 20 (USC, Penn State, ASU, URV) teaches compression in the context of *upload limits* — LMS portals, government portals, job portals. No competitor owns a neutral "how big can my PDF be for X" reference.
**Spec:**
- Table: common destinations (Moodle/Canvas, email attachments, gov portals, job boards, WhatsApp) with their real limits — **each limit must have a source link or be marked "verify before publishing."**
- Tier chart: what "100 KB / 500 KB / 2 MB / 10 MB" realistically looks like (pages, scan DPI, images) — derived from our own test runs (§4), not vendor claims.
- Every tier links to `/pdf/compress`.
**Pitched to:** r/pdf threads (500 MB portfolio → 10 MB), Quora "resize to specific size", Penn State (#7), TechRadar (#1 — the free-tier-limits angle lives here).

## 3. Compression Guide — `https://gainutility.com/blog/how-to-compress-a-pdf`

**Status today:** exists.
**Upgrade spec:** add "compression levels explained" (what actually gets thrown away at each level: image downsampling vs font subsetting vs object-stream dedup) with before/after examples produced by our own tool.
**Pitched to:** ASU Print Lab (#10), Penn State (#7), CHIP.de (#17), wecomm.fr (#18), MRW.it (#15), Giz (#14), Kumparan (#16).

## 4. Privacy Guide — new URL (proposed `https://gainutility.com/blog/are-online-pdf-tools-safe`)

**Why it's linkable:** the r/pdf and r/smallbusiness threads in the prospect CSV are literally "I uploaded confidential docs to iLovePDF — damage control" and "merging client PDFs without uploading." A neutral, non-fearmongering explainer — what happens to files on upload-based tools, retention disclosures, how to check — is the only asset that can be cited in those threads without looking like an ad.
**Spec:** third-party-tool audit table (what each major tool's ToS says about retention — **quote + link, verify dates**), checklist for evaluating any tool, and an honest disclosure section on how GainUtility itself processes files (including OCR's external processing — do not over-claim "everything is local").
**Pitched to:** Reddit threads #55/#59/#61/#62, Quora #63, USC Gould (#6).

## 5. Conversion Guides — existing `/blog/how-to-convert-pdf-to-jpg`, `/blog/how-to-convert-jpg-to-pdf`, plus word↔pdf equivalents

**Status today:** JPG↔PDF guides exist; **PDF↔Word guides do not exist yet** (needed as targets for FreewareGenius #12 and Globinch-adjacent OCR pitches #13).
**Spec:** one guide per conversion pair, same template: 3 steps → quality/size trade-off table → common failure modes → tool link. Localized versions follow the 6 non-EN locales already in the repo.

## 6. Troubleshooting Library — new section (proposed `/blog/fix-*`)

**Status today:** one exists: `/blog/fix-pdf-too-big-to-upload`.
**Spec:** expand to the recurring asks observed in communities: PDF won't open / corrupted after scan, OCR produced garbage text, merge blurred output, password-protected PDF can't be compressed, image-heavy PDF still huge after compression. Each article: cause → 3 fixes ranked by effort → tool link where applicable.
**Why it's linkable:** Super User / r/pdf answers get cited for years; troubleshooting pages are the only content type those communities accept without downvoting.

## 7. Benchmark Study — new URL (proposed `https://gainutility.com/pdf-compression-benchmark`)

**This is the flagship PR asset — but NO numbers ship until tests run.**

**Methodology spec (must be published alongside results):**
1. Test corpus: N PDFs (scans, text, image-heavy, mixed) at published starting sizes — corpus files or generation scripts published (GitHub) so results are reproducible.
2. Compare: GainUtility vs Smallpdf vs iLovePDF vs PDF24 vs Adobe online — same files, default + strongest settings.
3. Metrics: output size (bytes, % reduction), visual quality (blind side-by-side or a standard metric), time, account required y/n, upload required y/n.
4. Run date + tool versions recorded. Re-run quarterly; publish run date prominently.
5. Publish results even if we lose some columns. A study that shows competitors winning somewhere is the only kind journalists trust.

**Pitched to:** MakeUseOf (#2), TechRadar (#1), Techshali (#3), digital-PR platforms (HARO/Connectively — see `CAMPAIGN-PLAN.md`).

## 8. OSS Feasibility Checklist — decision gate before any GitHub strategy

Before pursuing `py-pdf/awesome-pdf` (#53 in CSV) or SourceForge:
- [ ] Is there any GainUtility code we can legitimately open-source? (e.g., a single-purpose CLI for one converter)
- [ ] License choice (MIT/Apache-2.0) — does it conflict with how the site is served?
- [ ] Repo ready: README, example, tests, screenshots; no secrets/keys.
- [ ] Maintenance owner + triage cadence identified (an abandoned repo hurts more than none).
- [ ] If any answer is "no" → **skip GitHub list placements entirely** (they require a hosted OSS product, not a website). Alternative.me (#50) and awesome-selfhosted require self-hostable software — same gate.

## 9. Internal-Link Architecture

Required flow for every asset and tool page:

```
Homepage → Hub (/pdf, /pdf/best, /tools)
        → Tool (/tools/merge-pdf, /pdf/compress, ...)
        → Guide (/blog/how-to-*, /blog/fix-*)
        → Related Tool (guide CTA → next tool)
        ↺ back to Hub (breadcrumb)
```

Rules:
- Every guide links to exactly one primary tool + the hub; every tool page links to its how-to guide.
- Localized pages link only to their own locale equivalents (no EN→DE cross-links).
- New assets (§2, §4, §7) must be added to `sitemap.xml` at launch and linked from the hub — **a pitch target that isn't internally linked converts its new backlink poorly.**
- Breadcrumb + FAQ schema on guides; `HowTo` schema only where steps are genuinely followed in order.

## Build order (after review)

| Phase | Asset | Depends on |
|-------|-------|-----------|
| 1 | Privacy Guide (§4), PDF↔Word guides (§5) | none — unblocks #6, #12, #63 |
| 2 | File Size Guide (§2), hub upgrade (§1) | internal test data |
| 3 | Benchmark study (§7) | test corpus + runs (numbers only after) |
| 4 | Troubleshooting expansion (§6), image guides | community-answer tracking |
| 5 | OSS decision (§8) | owner decision; only then GitHub pitches |
