import { PDFDocument, rgb, StandardFonts } from "@cantoo/pdf-lib";
import fs from "fs";
import path from "path";

if (!fs.existsSync("scratch")) {
  fs.mkdirSync("scratch", { recursive: true });
}

async function createPdf(filePath, pageCount, labelPrefix) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage([595.28, 841.89]); // A4
    page.drawText(`${labelPrefix} - Page ${i} of ${pageCount}`, {
      x: 50,
      y: 750,
      size: 24,
      font,
      color: rgb(0.1, 0.1, 0.1)
    });
    page.drawText(`Generated for GainUtility automated system hardening testing.`, {
      x: 50,
      y: 710,
      size: 12,
      font,
      color: rgb(0.4, 0.4, 0.4)
    });
  }

  const bytes = await doc.save();
  fs.writeFileSync(filePath, bytes);
  console.log(`Created ${filePath} (${pageCount} pages, ${bytes.length} bytes)`);
}

async function main() {
  await createPdf("scratch/doc-a.pdf", 3, "Document A");
  await createPdf("scratch/doc-b.pdf", 4, "Document B");
  await createPdf("scratch/doc-5pages.pdf", 5, "MultiPage Document");
  fs.writeFileSync("scratch/invalid-sample.txt", "This is definitely not a PDF file.");
  console.log("Test assets generated successfully.");
}

main().catch(console.error);
