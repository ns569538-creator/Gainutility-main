import React from "react";

/**
 * Barrel for the rebuilt Advanced PDF tool suite.
 * Every export is a REAL implementation — see src/components/pdf/*.
 */

export { AdvancedPdfToolPage } from "./pdf/PdfToolShell";
export type { ProcessResult } from "./pdf/PdfToolShell";

// Office / document conversions
export { PdfToWord, WordToPdf } from "./pdf/pdfConvertersOffice";
export { PdfToExcel, ExcelToPdf } from "./pdf/pdfConvertersExcel";
export {
  PdfToPowerpoint,
  PowerpointToPdf,
  PdfToText,
  TextToPdf,
  HtmlToPdf,
  PdfToHtml,
} from "./pdf/pdfConvertersDocs";

// Annotate
export {
  CropPdf,
  AddPdfPageNumbers,
  AddPdfWatermark,
  RemovePdfMetadata,
  FlattenPdf,
  AddPdfHeaderFooter,
} from "./pdf/pdfAnnotate";

// Organize
export {
  ReversePageOrderPdf,
  ExtractOddPagesPdf,
  ExtractEvenPagesPdf,
  MergeSelectedPageRanges,
  SplitEveryNPages,
} from "./pdf/pdfOrganizeA";
export {
  SplitByFileSize,
  DuplicatePageFinderPdf,
  RemoveBlankPagesPdf,
  RepairPdf,
} from "./pdf/pdfOrganizeB";

// Security & analysis
export { UnlockPdf, RemovePdfPassword, OcrPdf } from "./pdf/pdfSecurityA";
export {
  ValidatePdf,
  OptimizePdfWeb,
  ReducePdfImageQuality,
  CompressImagesInsidePdf,
  CompareTwoPdfs,
} from "./pdf/pdfSecurityB";
