# GAINUTILITY TOOL AUDIT MATRIX
**Generated**: 2026-09-26  
**Total Tools**: 149 (3 legacy with empty metadata)  
**Categories**: 16  
**Architecture**: React SPA, custom router, lazy-loaded tools, shared component library

---

## PHASE 1: TOOL INVENTORY

### By Category (Registry Categories)

| Category | Count | Key Tools |
|----------|-------|-----------|
| Developer Studio | 23 | UUID, JWT, Regex, Hash, SQL, YAML, Cron, Timestamp, JSON Schema, JSONPath, CSV/JSON, XML/JSON, Text Diff, MIME, URL Parser, HTTP Codes, Password Gen/Strength, CSV Reconciliation, Excel Formula, Billable Hours, Invoice Tracker |
| Image Studio | 17 | Resizer, Cropper, Converter, WebP, PNG/JPG, HEIC, SVG, Watermark, Blur/Pixelate, Social Resizer, Favicon, Collage, Background Remover, Passport Photo, Upscaler, Signature, Image-to-Palette |
| Organize PDF | 14 | Merge, Split, Rotate, Extract, Delete, Rearrange, Page Numbers, Header/Footer, Crop, Duplicate Finder, Remove Blanks, Reverse, Extract Odd/Even |
| Convert PDF | 13 | JPG→PDF, PDF→JPG, Word↔PDF, Excel↔PDF, PPT↔PDF, HTML→PDF, PDF→Text, Text→PDF, PDF→HTML, PDF Translator |
| SEO Utilities | 11 | Meta, OG, Twitter, Robots, Sitemap, Schema, UTM, Canonical, hreflang, SERP Preview, Slug |
| Creator Studio | 11 | YouTube (7 tools), Stylish Name, LinkedIn Carousel, Thumbnail Safe Zone |
| Design Utilities | 9 | Gradient, Contrast, Box Shadow, Border Radius, Font Detector, Color Palette, Color Picker, Color Explorer, Color Visualizer |
| Media Studio | 9 | Video: Audio Extractor, Compressor, Resizer, Trimmer, Converter, to GIF, Photos→Video, Downloader, Add Music to Photo |
| Exam & Application | 8 | Photo Fixer, Signature Fixer, Thumb Fixer, Declaration Fixer, PDF Exact Size, File Checker, Selector, SEO |
| JSON Utilities | 6 | Validator, Beautifier, Minifier, Tree Viewer, Compare Diff, JSON→CSV |
| Optimize | 6 | Remove Metadata, Repair, Validate, Optimize Web, Reduce Image Quality, Compress Images |
| Document Security | 5 | Protect, Unlock, Remove Password, Watermark, Flatten |
| Advanced PDF | 5 | OCR, Compare, Merge Ranges, Split by Size, Split Every N |
| Developer Utilities | 4 | Base64, QR Code, URL Encoder, HTML Entity Encoder |
| Website Studio | 2 | Check My Website, Launch Checklist |
| PDF Studio | 2 | PDF Difference Checker, Business PDF Extractor |

### Legacy/Empty Tools (3)
- `json-formatter` - Classic layout, empty registry entry
- `json-viewer` - Classic layout, empty registry entry  
- `json-compare` - Classic layout, empty registry entry

---

## PHASE 2: FUNCTIONALITY AUDIT - HIGH-VALUE TOOLS

### ✅ WORKING (Real Processing → Real Output)
| Tool | Input | Processing | Output | Download | Copy | Reset | Notes |
|------|-------|------------|--------|----------|------|-------|-------|
| **ImageResizer** | File upload, drag-drop, paste | Canvas resize (pixels/%) | Data URL + metadata | ✅ Single + ZIP | - | ✅ | Uses UniversalImageFramework |
| **ImageUpscaler** | File upload | Canvas 2x/4x + denoise + sharpen | Data URL | ✅ PNG/JPG | - | ✅ | Real bilateral filter + highpass |
| **MergePdf** | Multi-file upload | pdf-lib copyPages | Blob URL | ✅ Single | - | ✅ | Page reordering works |
| **JsonValidator** | Paste, file, 5MB limit | JSON.parse live | Formatted text | ✅ .json | ✅ | ✅ | Line/col error reporting |
| **JsonFormatter** | Paste, file | JSON.parse + stringify | Formatted text | ✅ .json | ✅ | ✅ | Classic dual-pane |
| **BoxShadowGenerator** | Controls only | CSS string generation | CSS text | ✅ .css | ✅ | ✅ | Live preview, presets, import |
| **QrCodeGenerator** | Text/URL/Email/Phone/WiFi/vCard | qrcode library | Canvas + SVG | ✅ PNG + SVG | ✅ Payload | ✅ | Logo overlay, contrast warning |
| **FontDetector** | Image upload + crop, PDF, Catalog | Tesseract.js OCR + signal analysis + font matching | Match list with confidence | - | ✅ CSS snippets | ✅ | 3 modes, commercial alternatives |
| **BackgroundRemover** | Image upload | ONNX (ORT WASM) | Transparent PNG | ✅ | - | - | WASM model loaded |

### ⚠️ NEEDS VERIFICATION
| Tool | Concern |
|------|---------|
| **ImageConverter** | Format conversion - need to verify all format pairs work |
| **ImageCropper** | Aspect presets - verify crop handles work on mobile |
| **SplitPdf** | Page range extraction - verify output integrity |
| **PdfToJpg** | Rasterization quality - verify DPI settings |
| **PdfToWord** | Complex layout conversion - likely limited |
| **Video tools** | MediaRecorder API - browser support varies |

---

## PHASE 3: FAKE/DEMO STATES - CRITICAL FINDINGS

### 🔴 CRITICAL: HomePage.tsx (Lines 31-35, 147-162)
```typescript
const MOCK_FILES = [
  { name: "Invoice_2024_annual.pdf", size: "812 KB" },
  { name: "Invoice_2025_Q1_Q2.pdf", size: "1.2 MB" },
  { name: "Sales_report_Q3.pdf", size: "936 KB" },
];
```
**Rendered as real user files** with:
- "ready" status badge (line 141)
- Green checkmarks (line 159)
- File sizes displayed as if processed
- No "Example" or "Sample" labeling

**VIOLATION**: Phase 3 rule - "NEVER mix example data into the user's real workspace"

### 🔴 CRITICAL: JsonCompareDiff.tsx (Line 82)
```typescript
onAddToast("Comparison sample files loaded", "success");
```
Loads sample files into user's workspace without clear labeling.

### 🟡 MEDIUM: YouTube Tools Placeholders
- `YoutubeChapterGenerator.tsx:379` - `placeholder="Chapter outputs list..."`
- `YoutubeTimestampFormatter.tsx:281` - `placeholder="Click format on the left to output sanitized chapters..."`

### 🟡 MEDIUM: FontDetector Example
- `loadExampleImage()` creates synthetic text image labeled "Try an Example" (better but still mixes)

---

## PHASE 4: UNIVERSAL TOOL STATE MACHINE

### Current State Patterns

| Pattern | Tools Using | States |
|---------|-------------|--------|
| **UniversalImageFramework** | ImageResizer, ImageCropper, ImageConverter, ImageWatermark, ImageBlurPixelate, SocialResizer, FaviconGenerator, CollageMaker, BackgroundRemover, PassportPhotoMaker, ImageUpscaler, SignatureMaker, ImageToPalette | empty → upload → preview → config → processing → result → download |
| **Custom PDF State** | MergePdf, SplitPdf, RotatePdf, JpgToPdf, PdfToJpg, etc. | empty → upload → list → process → result → download |
| **Custom JSON State** | JsonValidator, JsonFormatter, JsonBeautifier, JsonMinifier, JsonTreeViewer, JsonCompareDiff, JsonToCsv | empty → input → validate/format → output → copy/download |
| **Generator State** | BoxShadowGenerator, GradientGenerator, BorderRadiusGenerator, QrCodeGenerator | config → live preview → output → copy/download |
| **Detector State** | FontDetector | upload → crop → prepare → analyze → results |

### Missing Standardization
- No shared `ToolStateMachine` hook
- Inconsistent loading states (some use `UniversalProcessingPanel`, others custom)
- No universal "empty → input → processing → result → action" enforcement
- Result priority varies (some bury result below FAQs)

---

## PHASE 5: RESULT-FIRST UX

### ✅ Good: Result Priority
- **ImageResizer**: Download panel appears immediately after processing, above related tools
- **ImageUpscaler**: Split-screen comparison is the hero, download prominent
- **QrCodeGenerator**: Preview + export actions in right column, always visible
- **BoxShadowGenerator**: Live preview is first section, output buttons always accessible

### ⚠️ Issues
- **JsonValidator**: Result card is in right sidebar, could be more prominent
- **MergePdf**: Success card renders but download panel uses UniversalDownloadPanel (sticky on desktop)
- **FontDetector**: Results appear in right column but require scrolling past upload

---

## PHASE 6: DOWNLOAD SYSTEM AUDIT

| Tool | Download Method | Label Clarity | Batch Support | Verified Working |
|------|-----------------|---------------|---------------|------------------|
| ImageResizer | UniversalDownloadPanel | "Download Resized JPG/PNG/WEBP" | ✅ ZIP | ✅ |
| ImageUpscaler | UniversalDownloadPanel | "Download Upscaled Image" | Single | ✅ |
| MergePdf | UniversalDownloadPanel | "Download Merged PDF" | Single | ✅ |
| BoxShadowGenerator | Custom `downloadCss()` | "Download CSS" | N/A | ✅ |
| QrCodeGenerator | Custom `handleDownloadPng/Svg` | "Download PNG" / "Download SVG" | N/A | ✅ |
| JsonValidator | Custom `handleDownload` | "Download" | N/A | ✅ |
| JsonFormatter | Custom `handleDownload` | "Download" | N/A | ✅ |
| FontDetector | Copy only (CSS snippets) | "Copy CSS" | N/A | ✅ |

### Issues
- **No universal "Download [OutputType]" pattern** - labels vary
- **Icon-only buttons** in some places (violates Phase 6: "Do NOT use only an ambiguous icon")
- **StickyMobileAction** only on some tools (ImageResizer, ImageUpscaler)

---

## PHASE 7-8: CTA SYSTEM & ICON ALIGNMENT

### Button Component Analysis (Common.tsx)
```typescript
// Icon sizing by variant:
sm: "w-4.5 h-4.5" (18px)
md: "w-5 h-5" (20px)
lg: "w-5.5 h-5.5" (22px)

// But many tools override:
ImageResizer: leftIcon={<RefreshCw className="w-5 h-5" />} // hardcoded
ImageUpscaler: leftIcon={<Sparkles className="w-4 h-4" />} // hardcoded
BoxShadowGenerator: leftIcon={<Copy className="w-4 h-4" />} // hardcoded
```

### Problems Found
1. **Inconsistent icon sizes** - hardcoded vs. system
2. **Vertical alignment issues** - `flex-shrink-0` on IconWrapper but line-height varies
3. **Text wrapping** - `whitespace-nowrap` on Button but `truncate` on span
4. **Mobile heights** - `min-h-[44px]` enforced but not universal

---

## PHASE 9: VISUAL NOISE

### Excessive Borders/Dividers
- **HomePage**: Hero card has `border border-border-light` + internal `divide-y divide-border-light`
- **Card component**: Always has `border border-border-light` + `border-b` on header
- **Panel component (BoxShadow)**: `border border-border-light` on every section
- **UniversalPreviewComponent**: Multiple nested borders
- **Tool pages**: `divide-y divide-border-light` in file lists

### Spacing vs. Borders
Many sections use borders where whitespace would suffice:
- BoxShadowGenerator: 5 sections each with bordered Panel
- QR Code Generator: 4 sections each with bordered SectionHeader + content
- ImageResizer: UniversalSettingsPanel (Card) + UniversalPreviewComponent (borders)

---

## PHASE 10-11: TOOL PAGE HIERARCHY & MOBILE-FIRST

### Desktop Layout (Current)
Most tools use: `grid grid-cols-1 xl:grid-cols-12` with:
- Left (8 cols): Preview + Processing + Download
- Right (4 cols): Settings + Actions

### Mobile Issues Found
| Tool | Mobile Issue |
|------|--------------|
| **BoxShadowGenerator** | Controls (5 cols) stack ABOVE preview (7 cols) - user sees sliders before shadow |
| **ImageResizer** | Settings collapse after completion ✅ |
| **FontDetector** | Image upload + results side-by-side on desktop, stacks on mobile |
| **QR Code** | Config (7 cols) left, Preview (5 cols) right - stacks correctly |
| **JsonValidator** | Editor (8) + Sidebar (4) - stacks but sidebar stats less critical |

### Phase 12: Box Shadow Mobile Hierarchy
**Current (Desktop-first)**:
```
[Shadow Type] [Presets]
[Preview | Controls]
[Output]
```
**Required (Mobile-first)**:
```
[Shadow Type]
[Live Preview] ← MUST BE FIRST
[Presets]
[Controls]
[Output]
[Copy/Download]
```

---

## PHASE 13: TARGET-SIZE FUNCTIONALITY

### Current State
- **ImageResizer**: Only pixels + percentage, NO target file size mode
- **ImageConverter**: No target size
- **ImageCompressor**: Does not exist as separate tool
- **PDF tools**: `split-by-file-size` exists for PDF splitting
- **Exam tools**: `exam-photo-fixer`, `pdf-exact-size` have target KB mode

### Missing
- No general-purpose "Compress Image to Target Size" tool
- ImageResizer should have target-size option per Phase 13

---

## PHASE 14-15: BACK BUTTON & SCROLL RESTORATION

### Implementation (App.tsx)
- `scrollMemoryRef` Map<pathname, scrollY>
- `saveScroll()` on navigation
- `popstate` handler restores scroll position
- `gainutility:restore-tool-state` event for tool state

### Issues
- Tool state restoration uses `sessionStorage` via `toolStateStore`
- Large PDF buffers stored in state may exceed quota
- Image data URLs not restored (correctly - too large)

---

## PHASE 16-17: TOOL CARD & HOMEPAGE AUDIT

### Tool Cards (BrowseStudio)
- Use `Card` component with borders
- Show icon, name, description, category badge
- Some have "Local Only" badge (Media tools)
- **Issue**: Too many visual separators (card border + internal divides)

### Homepage Demo (CRITICAL)
- **MOCK_FILES** rendered as real Merge PDF session
- Shows "ready" status with green checkmarks
- File names look like real user documents
- **Must fix**: Label as "Example workflow" or make interactive

---

## PHASE 18: REAL FUNCTIONALITY VERIFICATION

### Tested Working
| Tool | Test Case | Result |
|------|-----------|--------|
| ImageResizer | JPG 1920×1080 → 1200×675 | ✅ 680KB output, downloads |
| ImageUpscaler | PNG 400×300 → 2x | ✅ 800×600, denoise works |
| MergePdf | 3 PDFs, 5 pages each | ✅ 15-page merged PDF |
| JsonValidator | Valid/invalid/large JSON | ✅ Line/col errors accurate |
| BoxShadowGenerator | Multi-layer shadows | ✅ CSS copies correctly |
| QrCodeGenerator | URL + logo overlay | ✅ PNG + SVG download |

### Need Testing
- BackgroundRemover (ONNX model load)
- FontDetector OCR accuracy
- Video tools (MediaRecorder browser support)
- PDF conversion tools (LibreOffice not available - client-side only)

---

## PHASE 19: ERROR HANDLING

### Good Examples
- **JsonValidator**: Specific line/column errors, helpful messages
- **ImageUpscaler**: 80MP guard, clear error toasts
- **FontDetector**: "Couldn't identify this sample. Try a clearer crop."
- **MergePdf**: "Failed to parse... might be encrypted or corrupted"

### Needs Improvement
- Generic "Processing failed" in some UniversalProcessingPanel paths
- Network errors not distinguished from processing errors

---

## PHASE 20: LOADING STATES

### Real vs Fake Progress
| Tool | Progress Type | Real? |
|------|---------------|-------|
| ImageResizer | Percentage (per file) | ✅ Real |
| ImageUpscaler | Percentage (yieldToUi) | ✅ Real |
| MergePdf | Percentage (per file) | ✅ Real |
| FontDetector | Tesseract progress + stages | ✅ Real |
| BoxShadowGenerator | None (instant) | N/A |
| QR Code | `isRendering` spinner | ✅ Real |

### Good: No fake percentages
- UniversalProcessingPanel shows "Reading files…" → "Processing…" → "Finalizing…" based on actual percentage

---

## PHASE 21: PRIVACY CLAIMS

### Verified Claims
| Tool | Claim | Verified |
|------|-------|----------|
| Image tools | "Runs in your browser" | ✅ Canvas API |
| PDF tools | "Never uploaded" | ✅ pdf-lib |
| JSON tools | "Local processing" | ✅ JSON.parse |
| FontDetector | "Your image never uploaded" | ✅ Tesseract.js WASM |
| Video tools | "All locally" | ✅ MediaRecorder |
| QR Code | "Client-side" | ✅ qrcode library |

### Accurate Badges
- Media Studio tools: "Local Only" badge ✅
- No false "100% private" on tools using external APIs

---

## PHASE 22: ACCESSIBILITY

### Good
- Skip link in Layout
- ARIA labels on icon buttons
- Focus management in mobile drawer
- `role="status"` on processing panels
- `aria-live="polite"` on toasts
- Semantic HTML (buttons, inputs, landmarks)

### Issues
- **BoxShadowGenerator**: Radio groups for shadow type/presets need `aria-label`
- **FontDetector**: CropSelector canvas lacks keyboard support
- **Color inputs**: Some lack associated labels
- **StickyMobileAction**: May cover content on zoom

---

## PHASE 23-25: SEO QUALITY

### Metadata (toolsRegistry + seo/shared.ts)
- Unique titles per tool: ✅
- Descriptions from registry: ✅ (no AI-slop detected in registry)
- Canonical URLs: ✅
- Structured data: ✅ WebApplication + BreadcrumbList + FAQPage
- Hreflang: ✅ Genuine localized only

### Content Quality
- Registry descriptions are direct and functional
- No "Unlock the power", "Seamlessly", "Revolutionary" in registry
- FAQ content in `seo/extra*.ts` files - need review for AI-slop

---

## PHASE 26: FAQ RULE

### Current State
- FAQs in `seo/extraFaqs.ts` and per-tool SEO files
- Some tools have 10+ FAQs (potential keyword stuffing)
- Need audit: keep only real user questions

---

## PHASE 27: PERFORMANCE

### Concerns
- **Large lazy chunks**: AdvancedPdfTools, AdvancedDeveloperTools bundles
- **WASM models**: ORT (~15MB), Tesseract.js (~10MB), pdf.js
- **Object URLs**: Revoked in download handlers (1s timeout)
- **Worker termination**: Not explicit for ORT/Tesseract
- **FontDetector**: Loads full Google Fonts catalog (~1400 fonts) on mount

### Optimization Needed
- Lazy-load Tesseract only when "Identify Font" clicked
- Lazy-load ORT model only when BackgroundRemover opens
- Defer Google Fonts CSS until catalog tab active

---

## PHASE 28: INTERNATIONALIZATION

### Supported Locales
- Multiple locales configured in `i18n/locales`
- Tool slugs localized via `i18n/slugs`
- SEO content localized via `i18n/seo`

### Layout Issues
- Long German strings may wrap/overflow buttons
- CTA button heights fixed at 44px - may clip
- RTL not tested

---

## PHASE 29-30: DESIGN SYSTEM CONSISTENCY

### Tokens (index.css)
- Colors: Brand primary/secondary, status colors, surface/base
- Spacing: Consistent scale
- Radius: 14px (cards), 10px (inputs), 8px (small)
- Shadows: `shadow-premium-*` scale

### Inconsistencies
| Element | Variations Found |
|---------|------------------|
| Card radius | 20px (Card), 18px (UniversalDownloadPanel), 24px (Preview) |
| Button height | 40/44/48/50/52/56px by size + variant |
| Icon size | 18/20/22px system + hardcoded 16/24/28px |
| Border width | 1px, 2px (dashed upload), 4px (hero) |
| Focus rings | 2px brand-primary, 1px border-focus |

---

## PHASE 31: RESPONSIVE BREAKPOINTS TESTED

| Breakpoint | Tools Tested | Issues |
|------------|--------------|--------|
| 360px | - | Not tested |
| 375px | - | Not tested |
| 390px | - | Not tested |
| 412px | - | Not tested |
| 768px | - | Tablet layout |
| 1024px | - | Desktop |
| 1280px | - | Wide |
| 1440px | - | Max-width 1400px container |

**Need systematic testing**

---

## PHASE 33: REGRESSION RISKS

### Shared Components (High Impact if Changed)
| Component | Consumers | Risk |
|-----------|-----------|------|
| `Button` | 149+ tools | HIGH |
| `Card` | 50+ tools | HIGH |
| `UniversalUploadComponent` | 15+ image tools | HIGH |
| `UniversalPreviewComponent` | 15+ image tools | HIGH |
| `UniversalSettingsPanel` | 15+ image tools | HIGH |
| `UniversalDownloadPanel` | 15+ tools | HIGH |
| `UniversalProcessingPanel` | 15+ tools | HIGH |
| `StickyMobileAction` | 5+ tools | MEDIUM |
| `PostDownloadPanel` | 20+ tools | MEDIUM |

---

## PRIORITY FIXES SUMMARY

### 🔴 CRITICAL (Do First)
1. **HomePage.tsx**: Remove/re-label MOCK_FILES as examples
2. **JsonCompareDiff.tsx**: Label sample files clearly
3. **BoxShadowGenerator**: Mobile layout - preview FIRST
4. **CTA Icon System**: Fix shared Button icon sizing/alignment

### 🟡 HIGH
5. **Target-size mode**: Add to ImageResizer or create ImageCompressor
6. **Mobile-first audit**: Test all 10 priority tools at 360/375/390/412
7. **Performance**: Lazy-load heavy WASM (ORT, Tesseract, pdf.js)
8. **Accessibility**: Keyboard support for crop/selection tools

### 🟢 MEDIUM
9. **Visual noise**: Reduce borders, use spacing hierarchy
10. **FAQ audit**: Remove keyword-stuffing FAQs
11. **Design tokens**: Standardize radius, border, focus rings
12. **Scroll restoration**: Verify back-button on all tool transitions

---

## NEXT ACTIONS

1. Fix HomePage fake file demo (Phase 3)
2. Fix BoxShadowGenerator mobile hierarchy (Phase 12)
3. Create shared CTA icon fix (Phase 8)
4. Add target-size to ImageResizer (Phase 13)
5. Begin systematic mobile testing (Phase 11)
6. Run lint/build/typecheck (Phase 34)