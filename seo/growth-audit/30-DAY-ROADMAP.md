# GainUtility — 30-Day Growth & Recovery Roadmap

**Target Goal:** Accelerate organic click-through rate (from 1.2% baseline to 2.5%+), expand international non-branded clicks, and capture high-intent queries across existing 140 tools.  
**Execution Window:** Weeks 1 through 4  
**Philosophy:** Rigorous technical hygiene, exact search-intent alignment, zero spam, and data-backed iterative refinement.

---

## 1. High-Level 4-Week Execution Schedule

```
Week 1: Deployment & Googlebot Recrawl Induction
  ├─ Production Deploy of 806 prerendered HTML files
  ├─ Sitemap.xml resubmission in Google Search Console
  └─ Manual URL Inspection & "Request Indexing" on top 10 opportunity tools

Week 2: SERP Snippet Verification & CTR Monitoring
  ├─ Live SERP verification of updated titles ("Font Detector", "PDF Difference Checker")
  ├─ Confirm Google is rendering updated meta descriptions without French English leakage
  └─ Initial performance tracking on positions 4–10

Week 3: International Performance Evaluation
  ├─ Monitor Brazilian Portuguese impressions for "unir pdf" and "dividir pdf"
  ├─ Evaluate French click traction on `/fr/tools/detecteur-de-polices`
  └─ Analyze mobile vs. desktop device CTR splits

Week 4: Comprehensive GSC Data Analysis & Phase 2 Priorities
  ├─ Full 28-day vs. previous 28-day performance review
  ├─ GSC CSV export: Query, Page, Country, Device
  └─ Plan Phase 2 tool enhancements based on verified click demand
```

---

## 2. Weekly Operational Breakdown

### Week 1: Production Deployment & Recrawl Induction
- **Primary Objective:** Ensure Googlebot discovers and caches the updated static HTML bundles and `<head>` metadata.
- **Actions:**
  1. Merge and deploy code fixes to Cloudflare Pages.
  2. Log into Google Search Console and submit `https://gainutility.com/sitemap.xml`.
  3. Manually request indexing via GSC URL Inspection for:
     - `https://gainutility.com/tools/pdf-difference-checker`
     - `https://gainutility.com/tools/font-detector`
     - `https://gainutility.com/tools/background-remover`
     - `https://gainutility.com/tools/seo-meta-generator`
     - `https://gainutility.com/pt-br/tools/juntar-pdf`
     - `https://gainutility.com/fr/tools/detecteur-de-polices`
- **What NOT to Touch in Week 1:**
  - Do not change URL slugs or redirects.
  - Do not modify `robots.txt` or remove the `noindex` directive on `es-co`.

---

## 3. Week 2: SERP Snippet Verification & Early Metric Checks
- **Primary Objective:** Confirm that Google’s live search engine results pages reflect the optimized titles and descriptions.
- **Actions:**
  1. Perform incognito Google searches for:
     - `site:gainutility.com "PDF Difference Checker"`
     - `site:gainutility.com "Font Detector"`
     - `site:gainutility.com/fr/ "Détecteur de Polices"`
  2. Verify that SERP titles display clean branding without unwanted truncation.
  3. Monitor early GSC Performance report for clicks on `pdf-difference-checker` (expected to jump from 2 clicks to ~6+ clicks as title bolding takes effect).
- **Success Criteria:**
  - Zero mixed-language French snippets in Google search results.
  - Updated `<title>` tags visible in Google index within 7–10 days.

---

## 4. Week 3: Regional & International Search Monitoring
- **Primary Objective:** Track recovery in non-English markets (Brazil, France, Germany, Indonesia).
- **Actions:**
  1. Filter GSC Performance report by **Country = Brazil**:
     - Check impression-to-click conversion for `"unir pdf online"` and `"unir pdf"`.
     - Confirm that Brazilian searchers are landing on `/pt-br/tools/juntar-pdf`.
  2. Filter GSC Performance report by **Country = France**:
     - Monitor clicks for font detection and PDF splitting queries.
  3. Check India traffic stability:
     - Confirm that `exam-photo-fixer` and `passport-photo-maker` maintain their ~20% CTR baseline without disruption.
- **What NOT to Touch in Week 3:**
  - Do not create redundant country subfolders (e.g. do not create `/pt-pt/` or `/fr-be/` unless unique localized demand is proven).

---

## 5. Week 4: Post-Optimization GSC Performance Review & Next Steps
- **Primary Objective:** Quantitative evaluation against pre-audit baseline metrics.
- **Actions:**
  1. Run the **Full Dimension GSC Export** (Query, Page, Country, Device, Date).
  2. Compare 28-day performance against pre-optimization baseline:
     - **Pre-Optimization:** 5,430 impressions, 65 clicks, 1.2% CTR, 64.7 average position.
     - **Target 30-Day Outlook:** 7,500+ impressions, 140–220 clicks, 2.2%–2.8% CTR.
  3. Identify any newly emerging queries ranking between positions 11 and 25 that can be pushed to Page 1 with targeted internal link enhancements.
  4. Formulate the next quarterly optimization cycle focusing on mobile UX refinements for the highest-traffic tools.

---

## 6. Golden Rules: What NOT to Touch Throughout the Recovery

| Area | Restricted Action | Reason & Potential Harm |
| :--- | :--- | :--- |
| **`es-co` Route** | **Do NOT remove `noindex`** | Colombian Spanish shares identical vocabulary with Mexican Spanish. Exposing `es-co` to Google's index creates duplicate content risk and dilutes ranking signals. |
| **Localized Canonicals** | **Do NOT point to English URLs** | Each localized page must have a self-referencing canonical. Forcing them to canonicalize to English would de-index all localized versions. |
| **Indian Exam Utilities** | **Do NOT consolidate or delete** | Tools like `exam-photo-fixer` generate ~91% of total site clicks. Consolidating them into a generic "Image Resizer" will destroy exact-match keyword rankings. |
| **AI Content Flooding** | **Do NOT publish automated blog posts** | Mass-generating thin AI articles risks Google Helpful Content / Site-wide Spam penalties. Focus strictly on tool utility and UX. |
| **Fake Schema Reviews** | **Do NOT add fabricated star ratings** | Falsifying aggregate ratings without genuine user reviews will result in manual action penalties from Google. |

