import React, { useState } from "react";
import { FileCode, FileText, MonitorPlay, Printer, Presentation } from "lucide-react";
import { AdvancedPdfToolPage } from "./PdfToolShell";
import {
  OFFICE_LIMITATIONS,
  baseName,
  escapeXml,
  extractPageLines,
  openWithPdfJs,
  renderPageToCanvas,
  canvasToJpegBytes,
  sanitizeText,
  unescapeXmlEntities,
  wrapWithMetrics,
} from "./helpers";
import { Button } from "../Common";
import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";

/* ============================ PPTX XML boilerplate ========================= */

const PPTX_THEME_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Blank"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="44546A"/></a:dk2><a:lt2><a:srgbClr val="E7E6E6"/></a:lt2><a:accent1><a:srgbClr val="4472C4"/></a:accent1><a:accent2><a:srgbClr val="ED7D31"/></a:accent2><a:accent3><a:srgbClr val="A5A5A5"/></a:accent3><a:accent4><a:srgbClr val="FFC000"/></a:accent4><a:accent5><a:srgbClr val="5B9BD5"/></a:accent5><a:accent6><a:srgbClr val="70AD47"/></a:accent6><a:hlink><a:srgbClr val="0563C1"/></a:hlink><a:folHlink><a:srgbClr val="954F72"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Calibri Light"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="1"/></a:gradFill><a:noFill/></a:fillStyleLst><a:lnStyleLst><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="63000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:noFill/><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="33000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="1"/></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;

const SLIDE_W_EMU = 12192000;
const SLIDE_H_EMU = 6858000;

const buildPptxFromImages = async (
  jpegs: Uint8Array[],
  setProgress: (m: string) => void
): Promise<Blob> => {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const n = jpegs.length;
  const CT = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/>` +
    `<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>` +
    `<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>` +
    `<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>` +
    `<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>` +
    Array.from({ length: n }, (_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("") +
    `</Types>`;
  zip.file("[Content_Types].xml", CT);
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`
  );
  const media = zip.folder("ppt")!.folder("media")!;
  jpegs.forEach((bytes, i) => media.file(`image${i + 1}.jpeg`, bytes));

  const slideIds = Array.from({ length: n }, (_, i) => ({ rid: `rId${i + 2}`, id: 256 + i }));
  zip.folder("ppt")!.file(
    "presentation.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${slideIds
      .map((s) => `<p:sldId id="${s.id}" r:id="${s.rid}"/>`)
      .join(
        ""
      )}</p:sldIdLst><p:sldSz cx="${SLIDE_W_EMU}" cy="${SLIDE_H_EMU}"/><p:notesSz cx="${SLIDE_H_EMU}" cy="${SLIDE_W_EMU}"/></p:presentation>`
  );
  zip.folder("ppt")!.folder("_rels")!.file(
    "presentation.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>${slideIds
      .map((s) => `<Relationship Id="${s.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${s.id - 255}.xml"/>`)
      .join("")}<Relationship Id="rId${n + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>`
  );

  for (let i = 0; i < n; i++) {
    setProgress(`Assembling slide ${i + 1} of ${n}…`);
    zip.folder("ppt")!.folder("slides")!.file(
      `slide${i + 1}.xml`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:pic><p:nvPicPr><p:cNvPr id="2" name="Page ${i + 1}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rIdImg"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${SLIDE_W_EMU}" cy="${SLIDE_H_EMU}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic></p:spTree></p:cSld><p:clrMapOvr><a:overrideClrMapping bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/></p:clrMapOvr></p:sld>`
    );
    zip.folder("ppt")!.folder("slides")!.folder("_rels")!.file(
      `slide${i + 1}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdImg" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i + 1}.jpeg"/></Relationships>`
    );
  }

  zip.folder("ppt")!.folder("slideMasters")!.file(
    "slideMaster1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`
  );
  zip.folder("ppt")!.folder("slideMasters")!.folder("_rels")!.file(
    "slideMaster1.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`
  );
  zip.folder("ppt")!.folder("slideLayouts")!.file(
    "slideLayout1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`
  );
  zip.folder("ppt")!.folder("slideLayouts")!.folder("_rels")!.file(
    "slideLayout1.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`
  );
  zip.folder("ppt")!.folder("theme")!.file("theme1.xml", PPTX_THEME_XML);

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
};

export const PdfToPowerpoint: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="pdf-to-powerpoint"
    title="PDF to PowerPoint"
    desc="Convert every PDF page into a full-bleed slide image inside a genuine .pptx deck that opens in PowerPoint, Keynote and Google Slides."
    supportedFormats=".pdf"
    maxSizeStr="100 MB"
    accept=".pdf"
    icon={<Presentation className="h-6 w-6" />}
    limitations={[
      "Slides are high-resolution page snapshots: visually faithful and presentable, but text inside them is not editable.",
    ]}
    onAddToast={onAddToast}
    processFiles={async ([file]: File[], _opts, setProgress) => {
      setProgress("Reading PDF…");
      const bytes = await file.arrayBuffer();
      const doc = await openWithPdfJs(bytes);
      const jpegs: Uint8Array[] = [];
      for (let i = 0; i < doc.numPages; i++) {
        setProgress(`Rendering page ${i + 1} of ${doc.numPages}…`);
        const page = await doc.getPage(i + 1);
        const canvas = await renderPageToCanvas(page, 2);
        jpegs.push(await canvasToJpegBytes(canvas, 0.85));
        canvas.width = 0;
        canvas.height = 0;
      }
      setProgress("Building .pptx package…");
      const blob = await buildPptxFromImages(jpegs, setProgress);
      return { blob, name: `${baseName(file.name)}.pptx`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Why are slides images instead of editable text boxes?",
        acceptedAnswer:
          "PPT has no concept of a 'page' like PDF does, and mapping arbitrary PDF drawing commands back into native shapes reliably isn't feasible in-browser. Snapshot slides preserve appearance exactly; use PDF→Word if you need editable text.",
      },
      {
        question: "Will it open in Google Slides?",
        acceptedAnswer: "Yes — upload the .pptx to Drive and open with Slides.",
      },
    ]}
  />
);

/* ============================ POWERPOINT → PDF ============================= */

const parsePptxSlides = async (
  file: File
): Promise<{ texts: string[][]; images: ArrayBuffer[] }[]> => {
  const JSZip = (await import("jszip")).default;
  let zip: any;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    throw new Error("This is not a valid .pptx package. Re-save it from PowerPoint first (.pptx, not .ppt).");
  }
  const slideFiles = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)![1], 10);
      const nb = parseInt(b.match(/slide(\d+)/)![1], 10);
      return na - nb;
    });
  if (slideFiles.length === 0) throw new Error("No slides found inside this .pptx.");
  const out: { texts: string[][]; images: ArrayBuffer[] }[] = [];
  for (const path of slideFiles) {
    const num = path.match(/slide(\d+)\.xml/)![1];
    const xml: string = await zip.file(path)!.async("string");
    const paragraphs: string[][] = [];
    for (const paraXml of xml.split(/<a:p[ >]/).slice(1)) {
      const runs = [...paraXml.matchAll(/<a:t(?: [^>]*)?>([\s\S]*?)<\/a:t>/g)].map((m) =>
        unescapeXmlEntities(m[1])
      );
      const text = runs.join("").trim();
      if (text) paragraphs.push([text]);
    }
    const relPath = `ppt/slides/_rels/slide${num}.xml.rels`;
    const images: ArrayBuffer[] = [];
    const relsRaw = zip.file(relPath) ? await zip.file(relPath)!.async("string") : "";
    const targets = [...relsRaw.matchAll(/Target="([^"]*media\/[^"]*)"/g)].map((m) =>
      m[1].replace(/^\.\.\//, "ppt/")
    );
    for (const t of targets.slice(0, 4)) {
      const f = zip.file(t);
      if (!f) continue;
      try {
        images.push(await f.async("arraybuffer"));
      } catch {
        /* skip unreadable media */
      }
    }
    out.push({ texts: paragraphs, images });
  }
  return out;
};

export const PowerpointToPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="powerpoint-to-pdf"
    title="PowerPoint to PDF"
    desc="Convert a real .pptx deck to a PDF handout — slide text becomes selectable text and embedded images are carried over."
    supportedFormats=".pptx"
    maxSizeStr="50 MB"
    accept=".pptx"
    icon={<MonitorPlay className="h-6 w-6" />}
    limitations={[
      "Text and images are extracted onto clean 16:9 pages; gradients, SmartArt, animations and exact positioning are simplified.",
      "Legacy binary .ppt files must be re-saved as .pptx first.",
    ]}
    onAddToast={onAddToast}
    processFiles={async ([file]: File[], _opts, setProgress) => {
      setProgress("Unpacking presentation…");
      const slides = await parsePptxSlides(file);
      const pdf = await PDFDocument.create();
      pdf.setTitle(baseName(file.name));
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const body = await pdf.embedFont(StandardFonts.Helvetica);
      const W = 960;
      const H = 540;

      for (let s = 0; s < slides.length; s++) {
        setProgress(`Rendering slide ${s + 1} of ${slides.length}…`);
        const page = pdf.addPage([W, H]);
        const paras = slides[s].texts.flat().slice(0, 14);
        let y = H - 70;
        paras.forEach((text, idx) => {
          const isTitle = idx === 0;
          const size = isTitle ? 30 : 16;
          const font = isTitle ? bold : body;
          const lines = wrapWithMetrics(text, font, size, W - 120);
          for (const line of lines.slice(0, isTitle ? 2 : 6)) {
            page.drawText(sanitizeText(line), {
              x: 60,
              y,
              size,
              font,
              color: rgb(isTitle ? 0.05 : 0.15, 0.15, 0.18),
            });
            y -= size * 1.35;
          }
          y -= isTitle ? 12 : 6;
        });
        // place up to 4 extracted images in a bottom strip
        const imgs = slides[s].images;
        const stripH = imgs.length ? 150 : 0;
        if (stripH > 0 && y - stripH < 40) y = Math.max(y, 210);
        for (let i = 0; i < imgs.length; i++) {
          try {
            const emb =
              new Uint8Array(imgs[i])[0] === 0xff && new Uint8Array(imgs[i])[1] === 0xd8
                ? await pdf.embedJpg(imgs[i])
                : await pdf.embedPng(imgs[i]);
            const ratio = Math.min(180 / emb.width, stripH / emb.height || 150 / emb.height);
            const w = emb.width * ratio;
            const h = emb.height * ratio;
            page.drawImage(emb, {
              x: 60 + i * 200,
              y: 40 + (stripH - h) / 2,
              width: w,
              height: h,
            });
          } catch {
            /* unsupported image format inside deck */
          }
        }
        page.drawText(`Slide ${s + 1}`, { x: W - 80, y: 24, size: 10, font: body, color: rgb(0.6, 0.62, 0.66) });
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Will animations be preserved?",
        acceptedAnswer: "No — PDF is a static format, and this handout focuses on your content: slide titles, bullet text and images.",
      },
      {
        question: "My .ppt failed — what do I do?",
        acceptedAnswer: "Open it in PowerPoint or Keynote and Save As → .pptx (Open XML). The old binary .ppt format can't be parsed safely in-browser.",
      },
    ]}
  />
);

/* ================================ PDF → TEXT =============================== */

export const PdfToText: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="pdf-to-text"
    title="PDF to Text"
    desc="Extract every character of embedded text from a PDF into a plain .txt file — reading order preserved."
    supportedFormats=".pdf"
    maxSizeStr="100 MB"
    accept=".pdf"
    icon={<FileText className="h-6 w-6" />}
    limitations={["Scanned PDFs contain no text — use “OCR PDF” for image-only documents."]}
    onAddToast={onAddToast}
    defaultOptions={{ pageMarkers: true }}
    optionsPanel={({ options, setOptions }) => (
      <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={!!options.pageMarkers}
          onChange={(e) => setOptions((o: any) => ({ ...o, pageMarkers: e.target.checked }))}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        Insert “— Page N —” separators
      </label>
    )}
    processFiles={async ([file]: File[], options, setProgress) => {
      setProgress("Opening document…");
      const doc = await openWithPdfJs(await file.arrayBuffer());
      const chunks: string[] = [];
      let totalChars = 0;
      for (let i = 0; i < doc.numPages; i++) {
        setProgress(`Extracting page ${i + 1} of ${doc.numPages}…`);
        if (options.pageMarkers) chunks.push(`— Page ${i + 1} —\n`);
        const lines = await extractPageLines(doc, i);
        chunks.push(lines.join("\n"));
        totalChars += lines.join("\n").length;
        chunks.push("\n\n");
      }
      if (totalChars === 0) {
        throw new Error("No embedded text found — this looks like a scan. Try “OCR PDF” instead.");
      }
      const blob = new Blob([chunks.join("")], { type: "text/plain;charset=utf-8" });
      return { blob, name: `${baseName(file.name)}.txt`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Is the text reflowed or kept as-is?",
        acceptedAnswer:
          "Lines are grouped exactly as they appear visually on the page (top-to-bottom, left-to-right), giving you faithful reading order without artificial re-wrapping.",
      },
    ]}
  />
);

/* ================================ TEXT → PDF =============================== */

export const TextToPdf: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="text-to-pdf"
    title="Text to PDF"
    desc="Typeset pasted or uploaded plain text into a properly paginated PDF with true word wrapping using real font metrics."
    supportedFormats=".txt, .md"
    maxSizeStr="10 MB"
    accept=".txt,.md"
    icon={<FileText className="h-6 w-6" />}
    onAddToast={onAddToast}
    defaultOptions={{ fontSize: 11, fontFamily: "sans" }}
    optionsPanel={({ options, setOptions }) => (
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
          Font size
          <select
            value={options.fontSize}
            onChange={(e) => setOptions((o: any) => ({ ...o, fontSize: Number(e.target.value) }))}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {[9, 10, 11, 12, 14, 16].map((s) => (
              <option key={s} value={s}>{`${s} pt`}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
          Typeface
          <select
            value={options.fontFamily}
            onChange={(e) => setOptions((o: any) => ({ ...o, fontFamily: e.target.value }))}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="sans">Helvetica</option>
            <option value="serif">Times</option>
            <option value="mono">Courier</option>
          </select>
        </label>
      </div>
    )}
    processFiles={async ([file]: File[], options) => {
      const raw = sanitizeText(await file.text());
      if (!raw.trim()) throw new Error("The file is empty.");
      const pdf = await PDFDocument.create();
      pdf.setTitle(baseName(file.name));
      const family =
        options.fontFamily === "serif"
          ? [StandardFonts.TimesRoman, StandardFonts.TimesRomanBold]
          : options.fontFamily === "mono"
          ? [StandardFonts.Courier, StandardFonts.CourierBold]
          : [StandardFonts.Helvetica, StandardFonts.HelveticaBold];
      const reg = await pdf.embedFont(family[0]);
      const bld = await pdf.embedFont(family[1]);
      const size = Number(options.fontSize) || 11;
      const margin = 56;
      const W = 595.28;
      const H = 841.89;
      let page = pdf.addPage([W, H]);
      let y = H - margin;
      for (const para of raw.split(/\n/)) {
        const heading = para.match(/^(#{1,2})\s+(.*)$/);
        const f = heading ? bld : reg;
        const sz = heading ? (heading[1].length === 1 ? size + 8 : size + 4) : size;
        const lines = heading
          ? wrapWithMetrics(heading[2], f, sz, W - margin * 2)
          : wrapWithMetrics(para, f, sz, W - margin * 2);
        for (const line of lines.length ? lines : [""]) {
          if (y - sz * 1.45 < margin) {
            page = pdf.addPage([W, H]);
            y = H - margin;
          }
          if (line)
            page.drawText(line, { x: margin, y: y - sz, size: sz, font: f, color: rgb(0.1, 0.12, 0.16) });
          y -= sz * 1.45;
        }
        if (heading) y -= 6;
      }
      const bytes = await pdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      return { blob, name: `${baseName(file.name)}.pdf`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "How is wrapping calculated?",
        acceptedAnswer:
          "Every candidate line is measured with the actual embedded font's metrics, so breaks land exactly where the printed width would overflow — no crude character-count guessing.",
      },
    ]}
  />
);

/* ================================ HTML → PDF =============================== */

const SAMPLE_HTML = `<h1 style="font-family:sans-serif">Quarterly Summary</h1>\n<p style="font-family:sans-serif;color:#444">Paste any HTML here, preview it live, then send it to the print engine.</p>`;

export const HtmlToPdf: React.FC<any> = ({ onAddToast }) => {
  const [html, setHtml] = useState(SAMPLE_HTML);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) {
      onAddToast("Preview not ready yet — try again in a moment.", "warning");
      return;
    }
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      onAddToast("Print dialog opened — choose “Save as PDF” as the destination.", "info");
    } catch {
      onAddToast("Your browser blocked the print dialog. Allow pop-ups for this site.", "error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl pb-16">
      <header className="mt-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
          HTML to PDF
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
          Render HTML with your browser's own engine and save a pixel-perfect PDF through the print dialog.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section aria-label="HTML input">
          <label htmlFor="html-to-pdf-source" className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
            HTML source
          </label>
          <textarea
            id="html-to-pdf-source"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck={false}
            rows={16}
            className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs leading-relaxed text-slate-800 shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </section>
        <section aria-label="Live preview">
          <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Live preview</p>
          <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
            <iframe
              ref={iframeRef}
              title="HTML preview"
              srcDoc={html}
              className="h-[420px] w-full bg-white"
              sandbox="allow-same-origin allow-modals"
            />
          </div>
        </section>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={handlePrint} size="lg">
          <Printer className="mr-2 h-4 w-4" aria-hidden /> Open print dialog
        </Button>
        <Button variant="outline" onClick={() => setHtml(SAMPLE_HTML)}>
          Load sample
        </Button>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200" role="note">
        <FileCode className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p>
          How it works: your HTML renders in an isolated frame below, then your browser's print engine produces
          the PDF locally. In the dialog choose <strong>Destination → Save as PDF</strong>. Nothing is uploaded.
        </p>
      </div>
    </div>
  );
};

/* ================================ PDF → HTML =============================== */

export const PdfToHtml: React.FC<any> = ({ onAddToast, onChangeView }) => (
  <AdvancedPdfToolPage
    toolId="pdf-to-html"
    title="PDF to HTML"
    desc="Turn a PDF into a self-contained, semantic web page — every line of real embedded text becomes selectable HTML positioned as on the original page."
    supportedFormats=".pdf"
    maxSizeStr="100 MB"
    accept=".pdf"
    icon={<FileCode className="h-6 w-6" />}
    limitations={OFFICE_LIMITATIONS}
    onAddToast={onAddToast}
    processFiles={async ([file]: File[]) => {
      const doc = await openWithPdfJs(await file.arrayBuffer());
      const sections: string[] = [];
      let anyText = false;
      const CONTAINER_W = 900;
      for (let i = 0; i < doc.numPages; i++) {
        const page = await doc.getPage(i + 1);
        const vp = page.getViewport({ scale: 1 });
        const scale = CONTAINER_W / vp.width;
        const items = await page.getTextContent();
        const lines: string[] = [];
        for (const it of items.items as any[]) {
          if (typeof it.str !== "string" || !it.str.trim()) continue;
          const x = it.transform[4];
          const y = it.transform[5];
          const h = Math.abs(it.transform[3]) || 10;
          lines.push(
            `<span style="left:${(x * scale).toFixed(1)}px;top:${((vp.height - y) * scale).toFixed(1)}px;font-size:${(h * scale).toFixed(1)}px">${escapeXml(it.str)}</span>`
          );
          anyText = true;
        }
        sections.push(
          `<section class="pg" style="height:${Math.ceil(vp.height * scale)}px">\n<h2>Page ${i + 1}</h2>\n${lines.join("\n")}\n</section>`
        );
      }
      if (!anyText) throw new Error("No embedded text found — scans need OCR first.");
      const htmlOut = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${escapeXml(baseName(file.name))}</title>\n<style>body{margin:0;background:#f1f5f9;font-family:Georgia,serif}.wrap{max-width:940px;margin:0 auto;padding:24px 12px}h1{font-size:1.4rem}.pg{position:relative;margin:24px 0;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.15);padding-top:2rem;width:${CONTAINER_W}px;max-width:100%}.pg h2{position:absolute;top:.4rem;left:.75rem;margin:0;font:600 .7rem system-ui,sans-serif;color:#94a3b8;text-transform:uppercase}.pg span{position:absolute;white-space:pre;line-height:1}</style>\n</head>\n<body>\n<div class="wrap">\n<h1>${escapeXml(baseName(file.name))}</h1>\n${sections.join("\n")}\n</div>\n</body>\n</html>`;
      const blob = new Blob([htmlOut], { type: "text/html;charset=utf-8" });
      return { blob, name: `${baseName(file.name)}.html`, beforeSize: file.size, afterSize: blob.size };
    }}
    faqs={[
      {
        question: "Can I publish this HTML directly?",
        acceptedAnswer:
          "Yes — the output is a single self-contained file with inline styles and real selectable text. Search engines can index it, unlike the original PDF's vector drawing commands.",
      },
    ]}
  />
);
