/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState, useRef } from "react";
import { ToolId, ViewState } from "./types";
import { Toast } from "./components/Common";
import { resetToolCompletion } from "./toolCompletion";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { pathToView, viewToPath, publicPathForView } from "./router";
import { SEO_PAGE_MAP, localizedSeoEntry } from "./seo/seoPageContent";
import { COMPARISON_PAGE_MAP, CATEGORY_BEST_MAP } from "./seo/comparisonPages";
import { LIBRARY_PAGE_MAP } from "./seo/libraryPages";
import { getTranslatorPair } from "./seo/translatorPairs";
import { ActiveColorProvider } from "./colorStudio/ActiveColorContext";
import { DEFAULT_LOCALE } from "./i18n/locales";
import { LocaleProvider } from "./i18n/LocaleContext";
import { isLocalizedView } from "./i18n/pages";
import { saveToolState, getToolState } from "./lib/toolStateStore";
import {
  initNavigationHistory,
  preparePushNavigation,
  scheduleScrollRestoration,
  handlePopStateEntry,
  getCurrentEntryId,
} from "./lib/navigationHistory";


// Heavy tool packs are code-split: each chunk downloads only when its tool opens.
const UuidGenerator = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.UuidGenerator }))
);
const JwtDecoder = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.JwtDecoder }))
);
const PasswordGenerator = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.PasswordGenerator }))
);
const PasswordStrengthChecker = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.PasswordStrengthChecker }))
);
const HashGenerator = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.HashGenerator }))
);
const RegexTester = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.RegexTester }))
);
const UnixTimestampConverter = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.UnixTimestampConverter }))
);
const CronExpressionBuilder = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.CronExpressionBuilder }))
);
const TextDiffChecker = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.TextDiffChecker }))
);
const JsonSchemaValidator = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.JsonSchemaValidator }))
);
const JsonpathTester = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.JsonpathTester }))
);
const CsvJsonConverter = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.CsvJsonConverter }))
);
const XmlJsonConverter = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.XmlJsonConverter }))
);
const SqlFormatter = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.SqlFormatter }))
);
const YamlFormatter = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.YamlFormatter }))
);
const HttpStatusCodeLookup = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.HttpStatusCodeLookup }))
);
const MimeTypeLookup = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.MimeTypeLookup }))
);
const UrlParser = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.UrlParser }))
);
const ImageMetadataRemover = React.lazy(() =>
  import("./components/AdvancedDeveloperTools").then(m => ({ default: m.ImageMetadataRemover }))
);
const MergePdf = React.lazy(() =>
  import("./components/MergePdf").then(m => ({ default: m.MergePdf }))
);
const SplitPdf = React.lazy(() =>
  import("./components/SplitPdf").then(m => ({ default: m.SplitPdf }))
);
const RotatePdf = React.lazy(() =>
  import("./components/RotatePdf").then(m => ({ default: m.RotatePdf }))
);
const JpgToPdf = React.lazy(() =>
  import("./components/JpgToPdf").then(m => ({ default: m.JpgToPdf }))
);
const PdfToJpg = React.lazy(() =>
  import("./components/PdfToJpg").then(m => ({ default: m.PdfToJpg }))
);
const ExtractPdf = React.lazy(() =>
  import("./components/ExtractPdf").then(m => ({ default: m.ExtractPdf }))
);
const DeletePdf = React.lazy(() =>
  import("./components/DeletePdf").then(m => ({ default: m.DeletePdf }))
);
const RearrangePdf = React.lazy(() =>
  import("./components/RearrangePdf").then(m => ({ default: m.RearrangePdf }))
);
const ProtectPdf = React.lazy(() =>
  import("./components/ProtectPdf").then(m => ({ default: m.ProtectPdf }))
);
const UnlockPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.UnlockPdf }))
);
const RemovePdfPassword = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.RemovePdfPassword }))
);
const AddPdfWatermark = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.AddPdfWatermark }))
);
const FlattenPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.FlattenPdf }))
);
const AddPdfPageNumbers = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.AddPdfPageNumbers }))
);
const AddPdfHeaderFooter = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.AddPdfHeaderFooter }))
);
const CropPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.CropPdf }))
);
const DuplicatePageFinderPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.DuplicatePageFinderPdf }))
);
const RemoveBlankPagesPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.RemoveBlankPagesPdf }))
);
const ReversePageOrderPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.ReversePageOrderPdf }))
);
const ExtractOddPagesPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.ExtractOddPagesPdf }))
);
const ExtractEvenPagesPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.ExtractEvenPagesPdf }))
);
const WordToPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.WordToPdf }))
);
const PdfToWord = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.PdfToWord }))
);
const ExcelToPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.ExcelToPdf }))
);
const PdfToExcel = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.PdfToExcel }))
);
const PowerpointToPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.PowerpointToPdf }))
);
const PdfToPowerpoint = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.PdfToPowerpoint }))
);
const HtmlToPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.HtmlToPdf }))
);
const PdfToText = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.PdfToText }))
);
const TextToPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.TextToPdf }))
);
const PdfToHtml = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.PdfToHtml }))
);
const PdfTranslator = React.lazy(() =>
  import("./components/PdfTranslator").then(m => ({ default: m.PdfTranslator }))
);
const TranslatorPairPage = React.lazy(() =>
  import("./components/TranslatorPairPage").then(m => ({ default: m.TranslatorPairPage }))
);
const RemovePdfMetadata = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.RemovePdfMetadata }))
);
const RepairPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.RepairPdf }))
);
const ValidatePdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.ValidatePdf }))
);
const OptimizePdfWeb = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.OptimizePdfWeb }))
);
const ReducePdfImageQuality = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.ReducePdfImageQuality }))
);
const CompressImagesInsidePdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.CompressImagesInsidePdf }))
);
const OcrPdf = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.OcrPdf }))
);
const CompareTwoPdfs = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.CompareTwoPdfs }))
);
const MergeSelectedPageRanges = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.MergeSelectedPageRanges }))
);
const SplitByFileSize = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.SplitByFileSize }))
);
const SplitEveryNPages = React.lazy(() =>
  import("./components/AdvancedPdfTools").then(m => ({ default: m.SplitEveryNPages }))
);
const BackgroundRemover = React.lazy(() => import("./components/BackgroundRemover"));
const PassportPhotoMaker = React.lazy(() => import("./components/PassportPhotoMaker"));
const ImageUpscaler = React.lazy(() => import("./components/ImageUpscaler"));
const SignatureMaker = React.lazy(() => import("./components/SignatureMaker"));
const ApplicationFileChecker = React.lazy(() => import("./components/exams/ApplicationFileChecker"));
const ExamPhotoFixer = React.lazy(() => import("./components/exams/ExamPhotoFixer"));
const ExamSignatureFixer = React.lazy(() => import("./components/exams/SignatureFixer"));
const ExamThumbFixer = React.lazy(() => import("./components/exams/ThumbImpressionFixer"));
const DeclarationFixer = React.lazy(() => import("./components/exams/DeclarationFixer"));
const PdfExactSize = React.lazy(() => import("./components/exams/PdfExactSize"));
const ExamFileRequirements = React.lazy(() => import("./components/exams/ExamFileRequirements"));
const FontDetector = React.lazy(() =>
  import("./components/FontDetector").then(m => ({ default: m.FontDetector }))
);
const LinkedInCarouselMaker = React.lazy(() =>
  import("./components/LinkedInCarouselMaker").then(m => ({ default: m.LinkedInCarouselMaker }))
);
const ColorStudioWorkspace = React.lazy(() =>
  import("./colorStudio/ColorStudio").then(m => ({ default: m.ColorStudioWorkspace }))
);
const ColorPages = React.lazy(() =>
  import("./colorStudio/ColorPages").then(m => ({ default: m.ColorPages }))
);
const PaletteGeneratorSection = React.lazy(() =>
  import("./colorStudio/sections/GeneratorSection").then(m => ({ default: m.PaletteGeneratorSection }))
);
const ColorPickerSection = React.lazy(() =>
  import("./colorStudio/sections/PickerSection").then(m => ({ default: m.ColorPickerSection }))
);
const ColorsSection = React.lazy(() =>
  import("./colorStudio/sections/ColorsSection").then(m => ({ default: m.ColorsSection }))
);
const VisualizerSection = React.lazy(() =>
  import("./colorStudio/sections/VisualizerSection").then(m => ({ default: m.VisualizerSection }))
);
const ImagePaletteSection = React.lazy(() =>
  import("./colorStudio/sections/ImagePaletteSection").then(m => ({ default: m.ImagePaletteSection }))
);
const SeoLandingPage = React.lazy(() =>
  import("./components/SeoLandingPage").then(m => ({ default: m.SeoLandingPage }))
);
const ComparisonPage = React.lazy(() =>
  import("./components/ComparisonPage").then(m => ({ default: m.ComparisonPage }))
);
const CategoryBestPage = React.lazy(() =>
  import("./components/CategoryBestPage").then(m => ({ default: m.CategoryBestPage }))
);
const LibraryPage = React.lazy(() =>
  import("./components/LibraryPage").then(m => ({ default: m.LibraryPage }))
);
// Layout is eagerly imported so the app shell (header, breadcrumbs, footer)
// renders immediately on every route — no Suspense flash.
import { Layout } from "./components/Layout";
const JsonFormatter = React.lazy(() =>
  import("./components/JsonFormatter").then(m => ({ default: m.JsonFormatter }))
);
const JsonViewer = React.lazy(() =>
  import("./components/JsonViewer").then(m => ({ default: m.JsonViewer }))
);
const JsonCompare = React.lazy(() =>
  import("./components/JsonCompare").then(m => ({ default: m.JsonCompare }))
);
const JsonValidator = React.lazy(() =>
  import("./components/JsonValidator").then(m => ({ default: m.JsonValidator }))
);
const JsonMinifier = React.lazy(() =>
  import("./components/JsonMinifier").then(m => ({ default: m.JsonMinifier }))
);
const JsonBeautifier = React.lazy(() =>
  import("./components/JsonBeautifier").then(m => ({ default: m.JsonBeautifier }))
);
const JsonTreeViewer = React.lazy(() =>
  import("./components/JsonTreeViewer").then(m => ({ default: m.JsonTreeViewer }))
);
const JsonCompareDiff = React.lazy(() =>
  import("./components/JsonCompareDiff").then(m => ({ default: m.JsonCompareDiff }))
);
const JsonToCsv = React.lazy(() =>
  import("./components/JsonToCsv").then(m => ({ default: m.JsonToCsv }))
);
const GradientGenerator = React.lazy(() =>
  import("./components/GradientGenerator").then(m => ({ default: m.GradientGenerator }))
);
const ContrastChecker = React.lazy(() =>
  import("./components/ContrastChecker").then(m => ({ default: m.ContrastChecker }))
);
const Base64Tool = React.lazy(() =>
  import("./components/Base64Tool").then(m => ({ default: m.Base64Tool }))
);
const BoxShadowGenerator = React.lazy(() =>
  import("./components/BoxShadowGenerator").then(m => ({ default: m.BoxShadowGenerator }))
);
const BorderRadiusGenerator = React.lazy(() =>
  import("./components/BorderRadiusGenerator").then(m => ({ default: m.BorderRadiusGenerator }))
);
const QrCodeGenerator = React.lazy(() =>
  import("./components/QrCodeGenerator").then(m => ({ default: m.QrCodeGenerator }))
);
const UrlEncoderDecoder = React.lazy(() =>
  import("./components/UrlEncoderDecoder").then(m => ({ default: m.UrlEncoderDecoder }))
);
const HtmlEntityEncoder = React.lazy(() =>
  import("./components/HtmlEntityEncoder").then(m => ({ default: m.HtmlEntityEncoder }))
);
const YoutubeThumbnailPreview = React.lazy(() =>
  import("./components/YoutubeThumbnailPreview").then(m => ({ default: m.YoutubeThumbnailPreview }))
);
const YoutubeTitleAnalyzer = React.lazy(() =>
  import("./components/YoutubeTitleAnalyzer").then(m => ({ default: m.YoutubeTitleAnalyzer }))
);
const YoutubeTimestampFormatter = React.lazy(() =>
  import("./components/YoutubeTimestampFormatter").then(m => ({ default: m.YoutubeTimestampFormatter }))
);
const YoutubeChapterGenerator = React.lazy(() =>
  import("./components/YoutubeChapterGenerator").then(m => ({ default: m.YoutubeChapterGenerator }))
);
const YoutubeEmbedGenerator = React.lazy(() =>
  import("./components/YoutubeEmbedGenerator").then(m => ({ default: m.YoutubeEmbedGenerator }))
);
const YoutubeUrlToolkit = React.lazy(() =>
  import("./components/YoutubeUrlToolkit").then(m => ({ default: m.YoutubeUrlToolkit }))
);
const ThumbnailSafeZone = React.lazy(() =>
  import("./components/ThumbnailSafeZone").then(m => ({ default: m.ThumbnailSafeZone }))
);
const YoutubeDescriptionFormatter = React.lazy(() =>
  import("./components/YoutubeDescriptionFormatter").then(m => ({ default: m.YoutubeDescriptionFormatter }))
);
const YoutubeKeywordExplorer = React.lazy(() =>
  import("./components/YoutubeKeywordExplorer").then(m => ({ default: m.YoutubeKeywordExplorer }))
);
const SlugGenerator = React.lazy(() =>
  import("./components/SlugGenerator").then(m => ({ default: m.SlugGenerator }))
);
const StylishNameGenerator = React.lazy(() =>
  import("./components/StylishNameGenerator").then(m => ({ default: m.StylishNameGenerator }))
);
const ImageResizer = React.lazy(() =>
  import("./components/ImageResizer").then(m => ({ default: m.ImageResizer }))
);
const ImageCropper = React.lazy(() =>
  import("./components/ImageCropper").then(m => ({ default: m.ImageCropper }))
);
const ImageConverter = React.lazy(() =>
  import("./components/ImageConverter").then(m => ({ default: m.ImageConverter }))
);
const ImageCategoryHub = React.lazy(() =>
  import("./components/ImageCategoryHub").then(m => ({ default: m.ImageCategoryHub }))
);
const VideoAudioExtractor = React.lazy(() =>
  import("./media/tools/flagshipTools").then(m => ({ default: m.VideoAudioExtractor }))
);
const VideoCompressor = React.lazy(() =>
  import("./media/tools/flagshipTools").then(m => ({ default: m.VideoCompressor }))
);
const VideoResizer = React.lazy(() =>
  import("./media/tools/flagshipTools").then(m => ({ default: m.VideoResizer }))
);
const VideoTrimmer = React.lazy(() =>
  import("./media/tools/flagshipTools").then(m => ({ default: m.VideoTrimmer }))
);
const VideoConverter = React.lazy(() =>
  import("./media/tools/flagshipTools").then(m => ({ default: m.VideoConverter }))
);
const VideoToGif = React.lazy(() =>
  import("./media/tools/flagshipTools").then(m => ({ default: m.VideoToGif }))
);
const PhotosToVideo = React.lazy(() =>
  import("./media/tools/photosToVideo").then(m => ({ default: m.PhotosToVideo }))
);
const VideoDownloader = React.lazy(() =>
  import("./media/tools/videoDownloader").then(m => ({ default: m.VideoDownloader }))
);
const AddMusicToPhoto = React.lazy(() =>
  import("./media/tools/addMusicToPhoto").then(m => ({ default: m.AddMusicToPhoto }))
);
const ImageWatermark = React.lazy(() =>
  import("./components/ImageWatermark").then(m => ({ default: m.ImageWatermark }))
);
const ImageBlurPixelate = React.lazy(() =>
  import("./components/ImageBlurPixelate").then(m => ({ default: m.ImageBlurPixelate }))
);
const SocialResizer = React.lazy(() =>
  import("./components/SocialResizer").then(m => ({ default: m.SocialResizer }))
);
const FaviconGenerator = React.lazy(() =>
  import("./components/FaviconGenerator").then(m => ({ default: m.FaviconGenerator }))
);
const LogoMaker = React.lazy(() =>
  import("./components/LogoMaker").then(m => ({ default: m.LogoMaker }))
);
const CollageMaker = React.lazy(() =>
  import("./components/CollageMaker").then(m => ({ default: m.CollageMaker }))
);
const SeoMetaGenerator = React.lazy(() =>
  import("./components/SeoMetaGenerator").then(m => ({ default: m.SeoMetaGenerator }))
);
const OgMetaGenerator = React.lazy(() =>
  import("./components/OgMetaGenerator").then(m => ({ default: m.OgMetaGenerator }))
);
const TwitterCardGenerator = React.lazy(() =>
  import("./components/TwitterCardGenerator").then(m => ({ default: m.TwitterCardGenerator }))
);
const RobotsTxtGenerator = React.lazy(() =>
  import("./components/RobotsTxtGenerator").then(m => ({ default: m.RobotsTxtGenerator }))
);
const XmlSitemapGenerator = React.lazy(() =>
  import("./components/XmlSitemapGenerator").then(m => ({ default: m.XmlSitemapGenerator }))
);
const SchemaMarkupGenerator = React.lazy(() =>
  import("./components/SchemaMarkupGenerator").then(m => ({ default: m.SchemaMarkupGenerator }))
);
const UtmBuilder = React.lazy(() =>
  import("./components/UtmBuilder").then(m => ({ default: m.UtmBuilder }))
);
const CanonicalUrlGenerator = React.lazy(() =>
  import("./components/CanonicalUrlGenerator").then(m => ({ default: m.CanonicalUrlGenerator }))
);
const HreflangTagGenerator = React.lazy(() =>
  import("./components/HreflangTagGenerator").then(m => ({ default: m.HreflangTagGenerator }))
);
const GoogleSerpPreview = React.lazy(() =>
  import("./components/GoogleSerpPreview").then(m => ({ default: m.GoogleSerpPreview }))
);
const CheckMyWebsite = React.lazy(() =>
  import("./components/CheckMyWebsite").then(m => ({ default: m.CheckMyWebsite }))
);
const LaunchChecklist = React.lazy(() =>
  import("./components/LaunchChecklist").then(m => ({ default: m.LaunchChecklist }))
);
const CsvReconciliation = React.lazy(() =>
  import("./components/CsvReconciliation").then(m => ({ default: m.CsvReconciliation }))
);
const ExcelFormulaGenerator = React.lazy(() =>
  import("./components/ExcelFormulaGenerator").then(m => ({ default: m.ExcelFormulaGenerator }))
);
const BillableHoursCalculator = React.lazy(() =>
  import("./components/BillableHoursCalculator").then(m => ({ default: m.BillableHoursCalculator }))
);
const PdfDifferenceChecker = React.lazy(() =>
  import("./components/PdfDifferenceChecker").then(m => ({ default: m.PdfDifferenceChecker }))
);
const BusinessPdfExtractor = React.lazy(() =>
  import("./components/BusinessPdfExtractor").then(m => ({ default: m.BusinessPdfExtractor }))
);
const InvoiceFollowUpTracker = React.lazy(() =>
  import("./components/InvoiceFollowUpTracker").then(m => ({ default: m.InvoiceFollowUpTracker }))
);

// Business & productivity pack (code-split)

interface AppProps {
  /**
   * Optional SSR seed. The prerender pipeline server-renders the real React
   * tree for safe (lazy-bodied) routes by passing the resolved view/locale,
   * so the static HTML matches exactly what the browser hydrates for that
   * URL. On the client `main.tsx` always mounts <App /> with no props, so the
   * initial state derives from `window.location` as before.
   */
  initialView?: ViewState;
  initialLocale?: string;
}

export default function App({ initialView, initialLocale }: AppProps = {}) {
  // Initialize the view from the current URL so every tool/page has a
  // real, shareable, crawlable address (e.g. /tools/pdf-to-jpg). When an
  // `initialView` seed is supplied (server render of a specific route), it
  // wins so the server markup matches the client hydration render.
  const [view, setView] = useState<ViewState>(() => {
    if (initialView) return initialView;
    if (typeof window === "undefined") return { type: "home" } as ViewState;
    const route = pathToView(window.location.pathname);
    if (route.redirectTo) {
      window.history.replaceState({ view: route.view }, "", route.redirectTo);
    }
    return route.view;
  });
  const [locale, setLocale] = useState<string>(() => {
    if (initialLocale) return initialLocale;
    if (typeof window === "undefined") return DEFAULT_LOCALE;
    return pathToView(window.location.pathname).locale;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Gate the code-split tool/SEO/color bodies until AFTER the first committed
  // render (hydration). On the server and on hydration's very first render this
  // stays `false`, so the Suspense fallback (native loading skeleton) is shown
  // and matches the server-rendered markup exactly — no React.lazy resolution
  // can race hydration and cause a "server/client markup mismatch" (#419) when
  // the tool chunk happens to load before the first paint. After this effect
  // flips it to `true`, the real lazy tool mounts via its normal Suspense
  // loading state. On pure client-side navigation this is already `true` (the
  // effect ran on the initial mount), so in-SPA tool switches are unaffected.
  const [bodyReady, setBodyReady] = useState(false);
  useEffect(() => { setBodyReady(true); }, []);

  // Keep a ref so handleViewChange stays stable while always reading the
  // latest locale (mirrors Astro's currentLocale in the SPA).
  const localeRef = React.useRef(locale);
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  // Initialize global tool state serializer registry
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__gainutility_tool_serializers__ = new Map();
  }, []);

  // Initialize site-wide navigation history & scroll restoration
  useEffect(() => {
    const cleanup = initNavigationHistory();
    return cleanup;
  }, []);

  // Save current tool state before navigating away
  const saveCurrentToolState = useCallback(() => {
    if (view.type === "tool" && typeof window !== "undefined") {
      const registry = (window as any).__gainutility_tool_serializers__;
      const serializer = registry?.get(view.id);
      if (serializer) {
        try {
          const state = serializer();
          const url = window.location.pathname + window.location.search;
          saveToolState(view.id, state, url);
        } catch {
          /* serialization failed — ignore */
        }
      }
    }
  }, [view]);

  // Keep the address bar in sync on every navigation (pushState SPA routing).
  const handleViewChange = useCallback((nextView: ViewState, options?: { clickedElementId?: string }) => {
    const nextEntryId = preparePushNavigation(options);
    saveCurrentToolState();
    resetToolCompletion();
    const currentLocale = localeRef.current;
    // Views that aren't genuinely localized for the active locale navigate to
    // their canonical English public path so the URL always matches an emitted page.
    // The active locale in state/ref is preserved across navigation so users stay in their chosen language.
    const isTargetLocalized = isLocalizedView(nextView, currentLocale);
    const pathLocale = isTargetLocalized ? currentLocale : DEFAULT_LOCALE;
    const path = publicPathForView(nextView, pathLocale);
    const apply = () => {
      setView(nextView);
      window.history.pushState({ view: nextView, guEntryId: nextEntryId }, "", path);
    };
    const scrollTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      const transition = (document as any).startViewTransition(apply);
      scrollTop();
      transition?.finished?.then(() => scrollTop());
    } else {
      apply();
      scrollTop();
    }
  }, [saveCurrentToolState]);

  // Switch the language of the current view (used by the language selector).
  const handleChangeLocale = useCallback((nextLocale: string, targetView: ViewState) => {
    try {
      localStorage.setItem("gainutility_locale", nextLocale);
    } catch {}
    localeRef.current = nextLocale;

    // If targetView is localized in nextLocale, navigate directly to its localized URL.
    // If not yet localized (e.g. unlocalized tools), keep the tool mounted at its canonical English URL
    // while switching shared chrome/navigation/footer to nextLocale — never dump to home!
    const isTargetLocalized = isLocalizedView(targetView, nextLocale);
    const resolved = targetView;
    const path = isTargetLocalized ? viewToPath(resolved, nextLocale) : viewToPath(resolved, DEFAULT_LOCALE);
    const entryId = getCurrentEntryId();
    const scrollTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    const apply = () => {
      setView(resolved);
      setLocale(nextLocale);
      window.history.replaceState({ view: resolved, guEntryId: entryId }, "", path);
    };
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      const transition = (document as any).startViewTransition(apply);
      scrollTop();
      transition?.finished?.then(() => scrollTop());
    } else {
      apply();
      scrollTop();
    }
  }, []);

  // Support browser back/forward buttons with rock-solid scroll & state restoration.
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const { entryId, snapshot } = handlePopStateEntry(event.state);
      const stateView = (event.state as { view?: ViewState } | null)?.view;
      const route = pathToView(window.location.pathname);
      setLocale(route.locale);
      const nextView = stateView && stateView.type ? stateView : route.view;
      setView(nextView);

      // Restore scroll position after content layout settles
      if (snapshot && (snapshot.scrollY > 0 || snapshot.clickedElementId)) {
        scheduleScrollRestoration(snapshot.scrollY, snapshot.scrollX, snapshot.clickedElementId);
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      }

      // If we navigated to a tool, fire an event so it can restore its state
      if (nextView.type === "tool") {
        const key = window.location.pathname + window.location.search;
        window.dispatchEvent(new CustomEvent("gainutility:restore-tool-state", {
          detail: { toolId: nextView.id, url: key }
        }));
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Toast dispatch action
  const handleAddToast = (message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      // Keep at most one error on screen so repeated failures don't stack.
      const base = type === "error" ? prev.filter((t) => t.type !== "error") : prev;
      return [...base, { id, type, message }];
    });

    // Errors carry action-required information: they stay until dismissed so a
    // failure is never gone before the user has read it.
    if (type === "error") return;
    const ttl = type === "warning" ? 8000 : 3500;
    setTimeout(() => {
      handleCloseToast(id);
    }, ttl);
  };

  const handleCloseToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Safe global copy helper
  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          handleAddToast("Copied to clipboard successfully!", "success");
        })
        .catch(() => {
          handleAddToast("Failed to copy automatically. Please copy manually.", "error");
        });
    } else {
      handleAddToast("Clipboard API not supported in this frame.", "warning");
    }
    // Remember copied hex colors so the Color Studio home can show "Copied earlier".
    const hex = text.trim().match(/^#?[0-9a-fA-F]{6}$/)?.[0];
    if (hex) {
      try {
        const key = "gainutility:colorstudio:recent";
        const norm = hex.startsWith("#") ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
        const list = JSON.parse(window.localStorage.getItem(key) ?? "[]") as string[];
        window.localStorage.setItem(key, JSON.stringify([norm, ...list.filter((c) => c !== norm)].slice(0, 12)));
      } catch {
        /* storage unavailable (private mode) — ignore */
      }
    }
  };

  const renderActiveTool = () => {
    if (view.type !== "tool") return null;
    const activeTool = view.id as ToolId;

    switch (activeTool) {
      case "json-validator":
        return <JsonValidator onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "json-beautifier":
        return <JsonBeautifier onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "json-minifier":
        return <JsonMinifier onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "json-tree-viewer":
        return <JsonTreeViewer onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "json-compare-diff":
        return <JsonCompareDiff onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "json-to-csv":
        return <JsonToCsv onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "json-formatter":
        return <JsonFormatter onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "json-viewer":
        return <JsonViewer onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "json-compare":
        return <JsonCompare onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "gradient-generator":
        return <GradientGenerator onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "contrast-checker":
        return <ContrastChecker onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "base64-tool":
        return <Base64Tool onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "box-shadow-generator":
        return <BoxShadowGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "border-radius-generator":
        return <BorderRadiusGenerator onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "qr-code-generator":
        return <QrCodeGenerator onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "url-encoder-decoder":
        return <UrlEncoderDecoder onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "html-entity-encoder":
        return <HtmlEntityEncoder onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "youtube-thumbnail-preview":
        return <YoutubeThumbnailPreview onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "youtube-title-analyzer":
        return <YoutubeTitleAnalyzer onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "youtube-timestamp-formatter":
        return <YoutubeTimestampFormatter onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "youtube-chapter-generator":
        return <YoutubeChapterGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "youtube-embed-generator":
        return <YoutubeEmbedGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "youtube-url-toolkit":
        return <YoutubeUrlToolkit onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "thumbnail-safe-zone":
        return <ThumbnailSafeZone onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "youtube-description-formatter":
        return <YoutubeDescriptionFormatter onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "youtube-keyword-explorer":
        return <YoutubeKeywordExplorer onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "slug-generator":
        return <SlugGenerator onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "stylish-name-generator":
        return <StylishNameGenerator onCopy={handleCopy} onAddToast={handleAddToast} />;
      case "image-resizer":
        return <ImageResizer onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "image-cropper":
        return <ImageCropper onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "image-converter":
      case "webp-converter":
      case "png-jpg-converter":
      case "heic-jpg-converter":
      case "svg-converter":
        return <ImageConverter onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "image-watermark":
        return <ImageWatermark onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "image-blur-pixelate":
        return <ImageBlurPixelate onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "social-resizer":
        return <SocialResizer onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "favicon-generator":
        return <FaviconGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "logo-maker":
        return <LogoMaker onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "collage-maker":
        return <CollageMaker onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "background-remover":
        return <BackgroundRemover onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "passport-photo-maker":
        return <PassportPhotoMaker onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "image-upscaler":
        return <ImageUpscaler onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "signature-maker":
        return <SignatureMaker onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "application-file-checker":
        return <ApplicationFileChecker onAddToast={handleAddToast} />;
      case "exam-photo-fixer":
        return <ExamPhotoFixer onAddToast={handleAddToast} />;
      case "exam-signature-fixer":
        return <ExamSignatureFixer onAddToast={handleAddToast} />;
      case "exam-thumb-fixer":
        return <ExamThumbFixer onAddToast={handleAddToast} />;
      case "declaration-fixer":
        return <DeclarationFixer onAddToast={handleAddToast} />;
      case "pdf-exact-size":
        return <PdfExactSize onAddToast={handleAddToast} />;
      case "exam-file-requirements":
        return <ExamFileRequirements onAddToast={handleAddToast} />;
      case "seo-meta-generator":
        return <SeoMetaGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "og-meta-generator":
        return <OgMetaGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "twitter-card-generator":
        return <TwitterCardGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "robots-txt-generator":
        return <RobotsTxtGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "xml-sitemap-generator":
        return <XmlSitemapGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "schema-markup-generator":
        return <SchemaMarkupGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "utm-builder":
        return <UtmBuilder onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "canonical-url-generator":
        return <CanonicalUrlGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "hreflang-tag-generator":
        return <HreflangTagGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "google-serp-preview":
        return <GoogleSerpPreview onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "check-my-website":
        return <CheckMyWebsite onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "launch-checklist":
        return <LaunchChecklist onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "merge-pdf":
        return <MergePdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "split-pdf":
        return <SplitPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "rotate-pdf":
        return <RotatePdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "jpg-to-pdf":
        return <JpgToPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "pdf-to-jpg":
        return <PdfToJpg onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "extract-pdf":
        return <ExtractPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "delete-pdf":
        return <DeletePdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "rearrange-pdf":
        return <RearrangePdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "protect-pdf":
        return <ProtectPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "unlock-pdf":
        return <UnlockPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "remove-pdf-password":
        return <RemovePdfPassword onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "add-pdf-watermark":
        return <AddPdfWatermark onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "flatten-pdf":
        return <FlattenPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "add-pdf-page-numbers":
        return <AddPdfPageNumbers onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "add-pdf-header-footer":
        return <AddPdfHeaderFooter onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "crop-pdf":
        return <CropPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "duplicate-page-finder-pdf":
        return <DuplicatePageFinderPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "remove-blank-pages-pdf":
        return <RemoveBlankPagesPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "reverse-page-order-pdf":
        return <ReversePageOrderPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "extract-odd-pages-pdf":
        return <ExtractOddPagesPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "extract-even-pages-pdf":
        return <ExtractEvenPagesPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "word-to-pdf":
        return <WordToPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "pdf-to-word":
        return <PdfToWord onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "excel-to-pdf":
        return <ExcelToPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "pdf-to-excel":
        return <PdfToExcel onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "powerpoint-to-pdf":
        return <PowerpointToPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "pdf-to-powerpoint":
        return <PdfToPowerpoint onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "html-to-pdf":
        return <HtmlToPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "pdf-to-text":
        return <PdfToText onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "text-to-pdf":
        return <TextToPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "pdf-to-html":
        return <PdfToHtml onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "pdf-translator":
        return <PdfTranslator onAddToast={handleAddToast} />;
      case "remove-pdf-metadata":
        return <RemovePdfMetadata onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "repair-pdf":
        return <RepairPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "validate-pdf":
        return <ValidatePdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "optimize-pdf-web":
        return <OptimizePdfWeb onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "reduce-pdf-image-quality":
        return <ReducePdfImageQuality onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "compress-images-inside-pdf":
        return <CompressImagesInsidePdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "ocr-pdf":
        return <OcrPdf onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "compare-two-pdfs":
        return <CompareTwoPdfs onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "merge-selected-page-ranges":
        return <MergeSelectedPageRanges onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "split-by-file-size":
        return <SplitByFileSize onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "split-every-n-pages":
        return <SplitEveryNPages onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "uuid-generator":
        return <UuidGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "jwt-decoder":
        return <JwtDecoder onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "password-generator":
        return <PasswordGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "password-strength-checker":
        return <PasswordStrengthChecker onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "hash-generator":
        return <HashGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "regex-tester":
        return <RegexTester onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "unix-timestamp-converter":
        return <UnixTimestampConverter onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "cron-expression-builder":
        return <CronExpressionBuilder onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "text-diff-checker":
        return <TextDiffChecker onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "json-schema-validator":
        return <JsonSchemaValidator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "jsonpath-tester":
        return <JsonpathTester onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "csv-json-converter":
        return <CsvJsonConverter onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "xml-json-converter":
        return <XmlJsonConverter onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "sql-formatter":
        return <SqlFormatter onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "yaml-formatter":
        return <YamlFormatter onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "http-status-code-lookup":
        return <HttpStatusCodeLookup onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "mime-type-lookup":
        return <MimeTypeLookup onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "url-parser":
        return <UrlParser onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "image-metadata-remover":
        return <ImageMetadataRemover onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      
      // Business & productivity pack
      case "csv-reconciliation":
        return <CsvReconciliation onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "excel-formula-generator":
        return <ExcelFormulaGenerator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "billable-hours-calculator":
        return <BillableHoursCalculator onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "pdf-difference-checker":
        return <PdfDifferenceChecker onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "business-pdf-extractor":
        return <BusinessPdfExtractor onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "invoice-follow-up-tracker":
        return <InvoiceFollowUpTracker onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "font-detector":
        return <FontDetector onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "linkedin-carousel-maker":
        return <LinkedInCarouselMaker onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "color-palette-generator":
        return <PaletteGeneratorSection onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "color-picker":
        return <ColorPickerSection onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "color-explorer":
        return <ColorsSection onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "color-visualizer":
        return <VisualizerSection onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "image-to-palette":
        return <ImagePaletteSection onCopy={handleCopy} onAddToast={handleAddToast} onChangeView={handleViewChange} />;
      case "video-audio-extractor":
        return <VideoAudioExtractor onAddToast={handleAddToast} />;
      case "video-compressor":
        return <VideoCompressor onAddToast={handleAddToast} />;
      case "video-resizer":
        return <VideoResizer onAddToast={handleAddToast} />;
      case "video-trimmer":
        return <VideoTrimmer onAddToast={handleAddToast} />;
      case "video-converter":
        return <VideoConverter onAddToast={handleAddToast} />;
      case "video-to-gif":
        return <VideoToGif onAddToast={handleAddToast} />;
      case "photos-to-video":
        return <PhotosToVideo onAddToast={handleAddToast} />;
      case "add-music-to-photo":
        return <AddMusicToPhoto onAddToast={handleAddToast} />;
      case "video-downloader":
        return <VideoDownloader onAddToast={handleAddToast} />;

      default:
        // Never render a different tool as a silent fallback - be explicit.
        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center">
            <p className="font-sans font-bold text-text-main">This tool isn't wired up yet.</p>
            <p className="text-sm text-text-muted max-w-sm">The link points to a tool that exists in the registry but has no implementation registered.</p>
            <button
              onClick={() => handleViewChange({ type: "home" })}
              className="text-brand-primary text-sm font-bold hover:underline cursor-pointer"
            >
              Back to all tools
            </button>
          </div>
        );
    }
  };

  const renderSeoPageTool = (toolId: string) => {
    const onCopy = handleCopy;
    const onAddToast = handleAddToast;
    const onChangeView = handleViewChange;
    switch (toolId) {
      case "merge-pdf": return <MergePdf onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "split-pdf": return <SplitPdf onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "rotate-pdf": return <RotatePdf onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "jpg-to-pdf": return <JpgToPdf onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "pdf-to-word": return <PdfToWord onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "word-to-pdf": return <WordToPdf onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "pdf-to-jpg": return <PdfToJpg onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "optimize-pdf-web": return <OptimizePdfWeb onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "reduce-pdf-image-quality": return <ReducePdfImageQuality onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "compress-images-inside-pdf": return <CompressImagesInsidePdf onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "json-formatter": return <JsonFormatter onCopy={onCopy} onAddToast={onAddToast} />;
      case "json-validator": return <JsonValidator onCopy={onCopy} onAddToast={onAddToast} />;
      case "json-viewer": return <JsonViewer onCopy={onCopy} onAddToast={onAddToast} />;
      case "json-minifier": return <JsonMinifier onCopy={onCopy} onAddToast={onAddToast} />;
      case "json-schema-validator": return <JsonSchemaValidator onCopy={onCopy} onAddToast={onAddToast} />;
      case "image-resizer": return <ImageResizer onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "image-cropper": return <ImageCropper onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "gradient-generator": return <GradientGenerator onCopy={onCopy} onAddToast={onAddToast} />;
      case "box-shadow-generator": return <BoxShadowGenerator onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "contrast-checker": return <ContrastChecker onCopy={onCopy} onAddToast={onAddToast} />;
      case "qr-code-generator": return <QrCodeGenerator onCopy={onCopy} onAddToast={onAddToast} />;
      case "base64-tool": return <Base64Tool onCopy={onCopy} onAddToast={onAddToast} />;
      case "url-encoder-decoder": return <UrlEncoderDecoder onCopy={onCopy} onAddToast={onAddToast} />;
      case "password-generator": return <PasswordGenerator onCopy={onCopy} onAddToast={onAddToast} onChangeView={onChangeView} />;
      case "hash-generator": return <HashGenerator onCopy={onCopy} onAddToast={onAddToast} />;
      case "video-audio-extractor": return <VideoAudioExtractor onAddToast={onAddToast} />;
      case "video-compressor": return <VideoCompressor onAddToast={onAddToast} />;
      case "video-resizer": return <VideoResizer onAddToast={onAddToast} />;
      case "video-trimmer": return <VideoTrimmer onAddToast={onAddToast} />;
      case "video-converter": return <VideoConverter onAddToast={onAddToast} />;
      case "video-to-gif": return <VideoToGif onAddToast={onAddToast} />;
      case "photos-to-video": return <PhotosToVideo onAddToast={onAddToast} />;
      case "add-music-to-photo": return <AddMusicToPhoto onAddToast={onAddToast} />;
      case "video-downloader": return <VideoDownloader onAddToast={onAddToast} />;
      default: return null;
    }
  };

  return (
    <ActiveColorProvider onAddToast={handleAddToast}>
      <LocaleProvider value={locale}>
      <Layout
        view={view}
        locale={locale}
        onChangeView={handleViewChange}
        onChangeLocale={handleChangeLocale}
        toasts={toasts}
        onCloseToast={handleCloseToast}
        onAddToast={handleAddToast}
      >
      <ErrorBoundary resetKey={viewToPath(view)} label="tool">
      {view.type === "tool" && (() => {
        const fallback = (
          <div className="flex-1 flex flex-col gap-6" role="status" aria-live="polite">
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4">
              <div className="h-8 w-64 bg-surface-muted rounded-lg" />
              <div className="h-4 w-96 bg-surface-muted/60 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="h-12 bg-surface-muted rounded-xl" />
                <div className="h-12 bg-surface-muted rounded-xl" />
              </div>
              <div className="h-10 w-48 bg-surface-muted rounded-xl mt-4" />
            </div>
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4 min-h-[300px]">
              <div className="h-8 w-56 bg-surface-muted rounded-lg" />
              <div className="h-4 w-80 bg-surface-muted/60 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 bg-surface-muted rounded-xl border border-border-light/50" />
                ))}
              </div>
            </div>
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-3">
              <div className="h-8 w-48 bg-surface-muted rounded-lg" />
              <div className="h-4 w-72 bg-surface-muted/60 rounded-md" />
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-32 bg-surface-muted rounded-full" />
                ))}
              </div>
            </div>
          </div>
        );
        return (
          <div className="flex-1 flex flex-col gap-6" id={`tool-panel-${view.id}`}>
            <React.Suspense fallback={fallback}>
              {bodyReady ? renderActiveTool() : fallback}
            </React.Suspense>
          </div>
        );
      })()}
      {view.type === "seo-page" && (() => {
        const fallback = (
          <div className="flex-1 flex flex-col gap-6" role="status" aria-live="polite">
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4">
              <div className="h-8 w-64 bg-surface-muted rounded-lg" />
              <div className="h-4 w-96 bg-surface-muted/60 rounded-md" />
              <div className="h-16 w-full bg-surface-muted/40 rounded-xl mt-4" />
            </div>
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4 min-h-[200px]">
              <div className="h-8 w-56 bg-surface-muted rounded-lg" />
              <div className="h-4 w-80 bg-surface-muted/60 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="h-20 bg-surface-muted rounded-xl border border-border-light/50" />
                <div className="h-20 bg-surface-muted rounded-xl border border-border-light/50" />
              </div>
            </div>
          </div>
        );

        if (view.id === "image") {
          return (
            <React.Suspense fallback={fallback}>
              {bodyReady ? (
                <ImageCategoryHub
                  locale={locale}
                  onChangeView={handleViewChange}
                />
              ) : fallback}
            </React.Suspense>
          );
        }

        const entry = SEO_PAGE_MAP[view.id];
        if (!entry) return null;
        const locEntry = localizedSeoEntry(entry, locale);
        const toolNode = locEntry.primaryTool ? renderSeoPageTool(locEntry.primaryTool) : null;
        return (
          <React.Suspense fallback={fallback}>
            {bodyReady ? (
              <SeoLandingPage
                entry={locEntry}
                locale={locale}
                toolComponent={toolNode}
                onChangeView={handleViewChange}
              />
            ) : fallback}
          </React.Suspense>
        );
      })()}
      {view.type === "translator-pair" && (() => {
        const entry = getTranslatorPair(view.pair);
        if (!entry) return null;
        const fallback = (
          <div className="flex-1 flex flex-col gap-6" role="status" aria-live="polite">
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4">
              <div className="h-10 w-72 bg-surface-muted rounded-lg" />
              <div className="h-5 w-96 bg-surface-muted/60 rounded-md" />
              <div className="h-16 w-full bg-surface-muted/40 rounded-xl mt-4" />
            </div>
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4 min-h-[200px]">
              <div className="h-8 w-56 bg-surface-muted rounded-lg" />
              <div className="h-4 w-80 bg-surface-muted/60 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="h-24 bg-surface-muted rounded-xl border border-border-light/50" />
                <div className="h-24 bg-surface-muted rounded-xl border border-border-light/50" />
              </div>
            </div>
          </div>
        );
        return (
          <React.Suspense fallback={fallback}>
            {bodyReady ? (
              <TranslatorPairPage
                entry={entry}
                onChangeView={handleViewChange}
                onAddToast={handleAddToast}
              />
            ) : fallback}
          </React.Suspense>
        );
      })()}
      {view.type === "comparison-page" && (() => {
        const entry = COMPARISON_PAGE_MAP[view.id];
        if (!entry) return null;
        const toolA = renderSeoPageTool(entry.toolA.id);
        const toolB = renderSeoPageTool(entry.toolB.id);
        const fallback = (
          <div className="flex-1 flex flex-col gap-6" role="status" aria-live="polite">
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4">
              <div className="h-10 w-72 bg-surface-muted rounded-lg" />
              <div className="h-5 w-96 bg-surface-muted/60 rounded-md" />
              <div className="h-16 w-full bg-surface-muted/40 rounded-xl mt-4" />
            </div>
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4 min-h-[200px]">
              <div className="h-8 w-56 bg-surface-muted rounded-lg" />
              <div className="h-4 w-80 bg-surface-muted/60 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="h-24 bg-surface-muted rounded-xl border border-border-light/50" />
                <div className="h-24 bg-surface-muted rounded-xl border border-border-light/50" />
              </div>
            </div>
          </div>
        );
        return (
          <React.Suspense fallback={fallback}>
            {bodyReady ? (
              <ComparisonPage
                entry={entry}
                toolAComponent={toolA}
                toolBComponent={toolB}
                onChangeView={handleViewChange}
              />
            ) : fallback}
          </React.Suspense>
        );
      })()}
      {view.type === "category-best" && (() => {
        const entry = CATEGORY_BEST_MAP[view.id];
        if (!entry) return null;
        const fallback = (
          <div className="flex-1 flex flex-col gap-6" role="status" aria-live="polite">
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4">
              <div className="h-10 w-72 bg-surface-muted rounded-lg" />
              <div className="h-5 w-96 bg-surface-muted/60 rounded-md" />
              <div className="h-16 w-full bg-surface-muted/40 rounded-xl mt-4" />
            </div>
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4 min-h-[200px]">
              <div className="h-8 w-56 bg-surface-muted rounded-lg" />
              <div className="h-4 w-80 bg-surface-muted/60 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="h-24 bg-surface-muted rounded-xl border border-border-light/50" />
                <div className="h-24 bg-surface-muted rounded-xl border border-border-light/50" />
              </div>
            </div>
          </div>
        );
        return (
          <React.Suspense fallback={fallback}>
            {bodyReady ? (
              <CategoryBestPage
                entry={entry}
                onChangeView={handleViewChange}
              />
            ) : fallback}
          </React.Suspense>
        );
      })()}
      {view.type === "library-page" && (() => {
        const entry = LIBRARY_PAGE_MAP[view.id];
        if (!entry) return null;
        const fallback = (
          <div className="flex-1 flex flex-col gap-6" role="status" aria-live="polite">
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4">
              <div className="h-10 w-72 bg-surface-muted rounded-lg" />
              <div className="h-5 w-96 bg-surface-muted/60 rounded-md" />
              <div className="h-16 w-full bg-surface-muted/40 rounded-xl mt-4" />
            </div>
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4 min-h-[200px]">
              <div className="h-8 w-56 bg-surface-muted rounded-lg" />
              <div className="h-4 w-80 bg-surface-muted/60 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="h-20 bg-surface-muted rounded-xl border border-border-light/50" />
                <div className="h-20 bg-surface-muted rounded-xl border border-border-light/50" />
                <div className="h-20 bg-surface-muted rounded-xl border border-border-light/50" />
              </div>
            </div>
          </div>
        );
        return (
          <React.Suspense fallback={fallback}>
            {bodyReady ? (
              <LibraryPage
                entry={entry}
                onChangeView={handleViewChange}
              />
            ) : fallback}
          </React.Suspense>
        );
      })()}
      {view.type === "color-studio" && (() => {
        const fallback = (
          <div className="flex-1 flex flex-col gap-6" role="status" aria-live="polite">
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4">
              <div className="h-10 w-72 bg-surface-muted rounded-lg" />
              <div className="h-5 w-96 bg-surface-muted/60 rounded-md" />
              <div className="h-16 w-full bg-surface-muted/40 rounded-xl mt-4" />
            </div>
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4 min-h-[300px]">
              <div className="h-8 w-56 bg-surface-muted rounded-lg" />
              <div className="h-4 w-80 bg-surface-muted/60 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-20 bg-surface-muted rounded-xl border border-border-light/50" />
                ))}
              </div>
            </div>
          </div>
        );
        return (
          <div className="flex-1 flex flex-col gap-6" id="color-studio-workspace-host">
            <React.Suspense fallback={fallback}>
              {bodyReady ? (
                <ColorStudioWorkspace
                  section={view.section}
                  onChangeView={handleViewChange}
                  onAddToast={handleAddToast}
                  onCopy={handleCopy}
                />
              ) : fallback}
            </React.Suspense>
          </div>
        );
      })()}
      {view.type === "color-page" && (() => {
        const fallback = (
          <div className="flex-1 flex flex-col gap-6" role="status" aria-live="polite">
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4">
              <div className="h-10 w-72 bg-surface-muted rounded-lg" />
              <div className="h-5 w-96 bg-surface-muted/60 rounded-md" />
              <div className="h-16 w-full bg-surface-muted/40 rounded-xl mt-4" />
            </div>
            <div className="bg-surface-base rounded-2xl border border-border-light p-5 sm:p-6 animate-pulse space-y-4 min-h-[200px]">
              <div className="h-8 w-56 bg-surface-muted rounded-lg" />
              <div className="h-4 w-80 bg-surface-muted/60 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-20 bg-surface-muted rounded-xl border border-border-light/50" />
                ))}
              </div>
            </div>
          </div>
        );
        return (
          <div className="flex-1 flex flex-col gap-6" id="color-page-host">
            <React.Suspense fallback={fallback}>
              {bodyReady ? (
                <ColorPages
                  kind={view.kind}
                  id={view.id}
                  onChangeView={handleViewChange}
                  onAddToast={handleAddToast}
                  onCopy={handleCopy}
                />
              ) : fallback}
            </React.Suspense>
          </div>
        );
      })()}
      </ErrorBoundary>
      </Layout>
      </LocaleProvider>
    </ActiveColorProvider>
  );
}
