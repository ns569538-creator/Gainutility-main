/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized SEO data for the GainUtility tool library.
 *
 * Every supported (tool, locale) pair resolves to a complete, natural,
 * locale-specific SEO record: slug, title, meta description, H1, primary +
 * secondary keywords, and FAQ. Priority tools carry hand-written records that
 * use proven local search phrasing; the rest are generated from locale-aware
 * templates + the tool's localized name so no page is ever thin or falls back
 * to English text.
 *
 * This module is DOM-free and safe for both the React app and the prerender.
 */

import { ToolId } from "../types";
import { DEFAULT_LOCALE } from "./locales";
import { LocaleCode, localizedToolName, localizedToolSlug } from "./slugs";

export interface LocalizedSeoRecord {
  locale: string;
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  questions: string[];
  faqs: Array<{ question: string; answer: string }>;
}

type Action =
  | "convert"
  | "compress"
  | "merge"
  | "split"
  | "generate"
  | "edit"
  | "analyze"
  | "extract"
  | "protect"
  | "encode"
  | "visualize"
  | "general";

/**
 * Tool -> action + source/target formats (used to build natural localized
 * copy). Formats remain as file-format tokens (JPG, PDF, Word...) which are
 * universal across languages.
 */
const TOOL_ACTION: Partial<Record<ToolId, { action: Action; a?: string; b?: string }>> = {
  "jpg-to-pdf": { action: "convert", a: "JPG", b: "PDF" },
  "pdf-to-jpg": { action: "convert", a: "PDF", b: "JPG" },
  "word-to-pdf": { action: "convert", a: "Word", b: "PDF" },
  "pdf-to-word": { action: "convert", a: "PDF", b: "Word" },
  "excel-to-pdf": { action: "convert", a: "Excel", b: "PDF" },
  "pdf-to-excel": { action: "convert", a: "PDF", b: "Excel" },
  "powerpoint-to-pdf": { action: "convert", a: "PowerPoint", b: "PDF" },
  "pdf-to-powerpoint": { action: "convert", a: "PDF", b: "PowerPoint" },
  "html-to-pdf": { action: "convert", a: "HTML", b: "PDF" },
  "pdf-to-html": { action: "convert", a: "PDF", b: "HTML" },
  "pdf-to-text": { action: "convert", a: "PDF", b: "Texto" },
  "text-to-pdf": { action: "convert", a: "Texto", b: "PDF" },
  "image-converter": { action: "convert", a: "imagens", b: "formato" },
  "webp-converter": { action: "convert", a: "WebP", b: "formato" },
  "png-jpg-converter": { action: "convert", a: "PNG", b: "JPG" },
  "heic-jpg-converter": { action: "convert", a: "HEIC", b: "JPG" },
  "svg-converter": { action: "convert", a: "SVG", b: "formato" },
  "merge-pdf": { action: "merge", a: "PDF" },
  "split-pdf": { action: "split", a: "PDF" },
  "extract-pdf": { action: "extract", a: "páginas" },
  "delete-pdf": { action: "edit", a: "páginas" },
  "rearrange-pdf": { action: "edit", a: "páginas" },
  "rotate-pdf": { action: "edit", a: "páginas" },
  "protect-pdf": { action: "protect", a: "PDF" },
  "unlock-pdf": { action: "protect", a: "PDF" },
  "remove-pdf-password": { action: "protect", a: "PDF" },
  "add-pdf-watermark": { action: "edit", a: "PDF" },
  "flatten-pdf": { action: "edit", a: "PDF" },
  "image-resizer": { action: "edit", a: "imagens" },
  "image-cropper": { action: "edit", a: "imagens" },
  "qr-code-generator": { action: "generate", a: "QR code" },
  "password-generator": { action: "generate", a: "senhas" },
  "uuid-generator": { action: "generate", a: "UUID" },
  "slug-generator": { action: "generate", a: "slugs" },
  "json-formatter": { action: "edit", a: "JSON" },
  "json-beautifier": { action: "edit", a: "JSON" },
  "json-validator": { action: "analyze", a: "JSON" },
  "json-minifier": { action: "compress", a: "JSON" },
  "json-tree-viewer": { action: "visualize", a: "JSON" },
  "json-viewer": { action: "visualize", a: "JSON" },
  "json-compare": { action: "analyze", a: "JSON" },
  "json-compare-diff": { action: "analyze", a: "JSON" },
  "json-to-csv": { action: "convert", a: "JSON", b: "CSV" },
  "base64-tool": { action: "encode", a: "Base64" },
  "color-palette-generator": { action: "generate", a: "paletas de colores" },
  "color-picker": { action: "generate", a: "colores" },
  "image-to-palette": { action: "extract", a: "colores" },
  "gradient-generator": { action: "generate", a: "gradientes" },
  "contrast-checker": { action: "analyze", a: "contraste" },
  "pdf-translator": { action: "convert", a: "PDF", b: "idioma" },
};

/** Hand-written SEO records for priority tools, keyed by toolId -> locale. */
const PRIORITY_SEO: Partial<Record<ToolId, Partial<Record<LocaleCode, Omit<LocalizedSeoRecord, "locale" | "slug">>>>> = {
  "jpg-to-pdf": {
    "pt-br": {
      title: "Converter JPG para PDF – Conversor Online Grátis",
      metaDescription: "Converta imagens JPG e PNG em PDF online grátis. Juntar várias fotos em um único PDF sem instalar nada e com total privacidade.",
      h1: "Converter JPG para PDF",
      primaryKeyword: "converter jpg para pdf",
      secondaryKeywords: ["jpg para pdf", "converter imagem para pdf", "transformar jpg em pdf", "imagem para pdf"],
      questions: ["Como converter JPG para PDF?", "Como juntar várias imagens JPG em um único PDF?", "O conversor de JPG para PDF é grátis?"],
      faqs: [
        { question: "Como converter JPG para PDF?", answer: "Basta arrastar suas imagens JPG para a ferramenta, ajustar a ordem se quiser e clicar em converter. O PDF é gerado no seu navegador." },
        { question: "Como juntar várias imagens em um único PDF?", answer: "Adicione todas as imagens que deseja, em qualquer ordem, e a ferramenta reúne todas as páginas em um único arquivo PDF." },
        { question: "É seguro converter JPG para PDF aqui?", answer: "Sim. Todo o processamento acontece localmente no seu dispositivo; suas imagens nunca são enviadas a um servidor." },
      ],
    },
    id: {
      title: "JPG ke PDF – Konversi Gambar ke PDF Online Gratis",
      metaDescription: "Ubah gambar JPG dan PNG menjadi PDF online gratis. Gabungkan banyak foto menjadi satu file PDF tanpa menginstal apa pun.",
      h1: "Ubah JPG ke PDF",
      primaryKeyword: "ubah jpg ke pdf",
      secondaryKeywords: ["jpg ke pdf", "konversi jpg ke pdf", "gambar ke pdf", "ubah gambar ke pdf", "gabung jpg ke pdf"],
      questions: ["Cara mengubah JPG ke PDF?", "Cara menggabungkan beberapa gambar jadi satu PDF?", "Apakah konverter JPG ke PDF gratis?"],
      faqs: [
        { question: "Bagaimana cara mengubah JPG ke PDF?", answer: "Seret gambar JPG Anda ke alat ini, atur urutannya, lalu klik konversi. PDF dibuat langsung di browser Anda." },
        { question: "Bagaimana cara menggabungkan beberapa gambar jadi satu PDF?", answer: "Tambahkan semua gambar yang diinginkan dan alat ini akan menggabungkannya menjadi satu file PDF." },
        { question: "Apakah aman mengubah JPG ke PDF di sini?", answer: "Ya. Semua proses terjadi di perangkat Anda dan gambar tidak pernah diunggah ke server." },
      ],
    },
    "es-mx": {
      title: "JPG a PDF – Convertir Imagen a PDF Online Gratis",
      metaDescription: "Convierte imágenes JPG y PNG a PDF online gratis. Junta varias fotos en un solo PDF sin instalar nada.",
      h1: "Convertir JPG a PDF",
      primaryKeyword: "convertir jpg a pdf",
      secondaryKeywords: ["jpg a pdf", "convertir imagen a pdf", "imagen a pdf", "junta fotos en pdf"],
      questions: ["¿Cómo convertir JPG a PDF?", "¿Cómo juntar varias imágenes en un solo PDF?", "¿Es gratis convertir JPG a PDF?"],
      faqs: [
        { question: "¿Cómo convierto JPG a PDF?", answer: "Arrastra tus imágenes JPG, ordena las páginas si lo deseas y haz clic en convertir. El PDF se genera en tu navegador." },
        { question: "¿Puedo unir varias imágenes en un solo PDF?", answer: "Sí. Añade todas las imágenes que quieras y la herramienta las reúne en un único archivo PDF." },
        { question: "¿Es seguro convertir JPG a PDF aquí?", answer: "Sí. Todo el proceso ocurre en tu dispositivo y tus imágenes nunca se suben a un servidor." },
      ],
    },
    "es-co": {
      title: "JPG a PDF – Convertir Imagen a PDF Online Gratis",
      metaDescription: "Convierte imágenes JPG y PNG a PDF online gratis. Combina varias fotos en un solo PDF sin instalar programas.",
      h1: "Convertir JPG a PDF",
      primaryKeyword: "convertir jpg a pdf",
      secondaryKeywords: ["jpg a pdf", "pasar imagen a pdf", "imagen a pdf", "combinar fotos en pdf"],
      questions: ["¿Cómo pasar JPG a PDF?", "¿Cómo combinar varias imágenes en un PDF?", "¿Es gratis convertir JPG a PDF?"],
      faqs: [
        { question: "¿Cómo paso JPG a PDF?", answer: "Arrastra tus imágenes JPG, organiza las páginas y haz clic en convertir. El PDF se crea en tu navegador." },
        { question: "¿Puedo combinar varias imágenes en un solo PDF?", answer: "Sí. Agrega todas las imágenes y la herramienta las combina en un solo archivo PDF." },
        { question: "¿Es seguro convertir JPG a PDF?", answer: "Sí. Todo ocurre en tu dispositivo y tus imágenes no se envían a ningún servidor." },
      ],
    },
    de: {
      title: "JPG in PDF umwandeln – Kostenloser Online-Konverter",
      metaDescription: "JPG- und PNG-Bilder kostenlos online in PDF umwandeln. Mehrere Fotos in einer PDF-Datei zusammenführen – ohne Installation.",
      h1: "JPG in PDF umwandeln",
      primaryKeyword: "jpg in pdf umwandeln",
      secondaryKeywords: ["jpg zu pdf", "bild in pdf umwandeln", "fotos in pdf", "jpg in pdf konvertieren"],
      questions: ["Wie wandle ich JPG in PDF um?", "Wie füge ich mehrere Bilder zu einer PDF zusammen?", "Ist der JPG-zu-PDF-Konverter kostenlos?"],
      faqs: [
        { question: "Wie wandle ich JPG in PDF um?", answer: "Ziehen Sie Ihre JPG-Bilder in das Tool, ordnen Sie die Seiten und klicken Sie auf konvertieren. Die PDF wird in Ihrem Browser erstellt." },
        { question: "Kann ich mehrere Bilder zu einer PDF zusammenfügen?", answer: "Ja. Fügen Sie alle Bilder hinzu und das Tool erstellt eine gemeinsame PDF-Datei." },
        { question: "Ist die Umwandlung sicher?", answer: "Ja. Alles läuft lokal auf Ihrem Gerät; Ihre Bilder werden nie auf einen Server hochgeladen." },
      ],
    },
    fr: {
      title: "JPG en PDF – Convertir une image en PDF en ligne gratuit",
      metaDescription: "Convertissez des images JPG et PNG en PDF en ligne gratuitement. Regroupez plusieurs photos en un seul PDF sans rien installer.",
      h1: "JPG en PDF",
      primaryKeyword: "convertir jpg en pdf",
      secondaryKeywords: ["jpg en pdf", "image en pdf", "convertir une image en pdf", "regrouper photos en pdf"],
      questions: ["Comment convertir JPG en PDF ?", "Comment regrouper plusieurs images en un seul PDF ?", "Est-ce gratuit de convertir JPG en PDF ?"],
      faqs: [
        { question: "Comment convertir JPG en PDF ?", answer: "Glissez vos images JPG, ordonnez les pages si besoin et cliquez sur convertir. Le PDF est créé dans votre navigateur." },
        { question: "Puis-je regrouper plusieurs images en un PDF ?", answer: "Oui. Ajoutez toutes vos images et l'outil les réunit dans un seul fichier PDF." },
        { question: "Est-ce sécurisé de convertir JPG en PDF ici ?", answer: "Oui. Tout le traitement se fait sur votre appareil et vos images ne sont jamais envoyées à un serveur." },
      ],
    },
    it: {
      title: "JPG in PDF – Convertire Immagine in PDF Online Gratis",
      metaDescription: "Converti immagini JPG e PNG in PDF online gratis. Unisci più foto in un unico PDF senza installare nulla.",
      h1: "Convertire JPG in PDF",
      primaryKeyword: "convertire jpg in pdf",
      secondaryKeywords: ["jpg in pdf", "immagine in pdf", "convertire immagini in pdf", "unire foto in pdf"],
      questions: ["Come convertire JPG in PDF?", "Come unire più immagini in un unico PDF?", "È gratis convertire JPG in PDF?"],
      faqs: [
        { question: "Come si converte JPG in PDF?", answer: "Trascina le tue immagini JPG, ordina le pagine se vuoi e clicca su converti. Il PDF viene creato nel tuo browser." },
        { question: "Posso unire più immagini in un solo PDF?", answer: "Sì. Aggiungi tutte le immagini e lo strumento le unisce in un unico file PDF." },
        { question: "È sicuro convertire JPG in PDF qui?", answer: "Sì. Tutto avviene sul tuo dispositivo e le tue immagini non vengono mai inviate a un server." },
      ],
    },
  },
  "pdf-to-jpg": {
    "pt-br": {
      title: "PDF para JPG – Converter PDF em Imagem JPG Online Grátis",
      metaDescription: "Converta páginas de um arquivo PDF em imagens JPG de alta resolução online grátis. Extraia cada página como uma imagem.",
      h1: "Converter PDF para JPG",
      primaryKeyword: "pdf para jpg",
      secondaryKeywords: ["convert pdf para jpg", "pdf em jpg", "extrair imagem de pdf", "passar pdf para imagem"],
      questions: ["Como converter PDF para JPG?", "Como extrair imagens de um PDF?", "O conversor de PDF para JPG é grátis?"],
      faqs: [
        { question: "Como converter um PDF para JPG?", answer: "Arraste o arquivo PDF para a ferramenta e cada página será convertida em uma imagem JPG que você pode baixar." },
        { question: "Posso extrair uma única página como imagem?", answer: "Sim. Você pode escolher páginas específicas para converter em vez de todas." },
        { question: "É seguro converter PDF para JPG?", answer: "Sim. A conversão acontece localmente no seu dispositivo e o arquivo não é enviado a servidores." },
      ],
    },
    id: {
      title: "PDF ke JPG – Ubah PDF Menjadi Gambar Online Gratis",
      metaDescription: "Ubah halaman file PDF menjadi gambar JPG beresolusi tinggi online gratis. Ekstrak setiap halaman sebagai gambar.",
      h1: "Ubah PDF ke JPG",
      primaryKeyword: "pdf ke jpg",
      secondaryKeywords: ["ubah pdf ke jpg", "konversi pdf ke jpg", "pdf jadi gambar", "ekstrak gambar dari pdf"],
      questions: ["Cara mengubah PDF ke JPG?", "Cara mengambil gambar dari PDF?", "Apakah konverter PDF ke JPG gratis?"],
      faqs: [
        { question: "Bagaimana cara mengubah PDF ke JPG?", answer: "Seret file PDF ke alat ini dan setiap halaman akan diubah menjadi gambar JPG yang bisa diunduh." },
        { question: "Bisakah saya mengambil satu halaman sebagai gambar?", answer: "Ya. Anda bisa memilih halaman tertentu untuk dikonversi." },
        { question: "Apakah aman mengubah PDF ke JPG?", answer: "Ya. Proses terjadi di perangkat Anda dan file tidak diunggah ke server." },
      ],
    },
    "es-mx": {
      title: "PDF a JPG – Convertir PDF en Imagen JPG Online Gratis",
      metaDescription: "Convierte páginas de un PDF en imágenes JPG de alta calidad online gratis. Extrae cada página como imagen.",
      h1: "Convertir PDF a JPG",
      primaryKeyword: "pdf a jpg",
      secondaryKeywords: ["convertir pdf a jpg", "pdf en jpg", "extraer imagen de pdf", "pasar pdf a imagen"],
      questions: ["¿Cómo convertir PDF a JPG?", "¿Cómo extraer imágenes de un PDF?", "¿Es gratis convertir PDF a JPG?"],
      faqs: [
        { question: "¿Cómo convierto un PDF a JPG?", answer: "Arrastra el archivo PDF y cada página se convierte en una imagen JPG que puedes descargar." },
        { question: "¿Puedo extraer una sola página como imagen?", answer: "Sí. Puedes elegir páginas específicas para convertir." },
        { question: "¿Es seguro convertir PDF a JPG?", answer: "Sí. La conversión ocurre en tu dispositivo y el archivo no se envía a servidores." },
      ],
    },
    "es-co": {
      title: "PDF a JPG – Convertir PDF en Imagen JPG Online Gratis",
      metaDescription: "Convierte páginas de un PDF en imágenes JPG de alta calidad online gratis. Extrae cada página como imagen.",
      h1: "Convertir PDF a JPG",
      primaryKeyword: "pdf a jpg",
      secondaryKeywords: ["convertir pdf a jpg", "pdf en jpg", "pasar pdf a imagen"],
      questions: ["¿Cómo convertir PDF a JPG?", "¿Cómo pasar un PDF a imagen?", "¿Es gratis convertir PDF a JPG?"],
      faqs: [
        { question: "¿Cómo convierto un PDF a JPG?", answer: "Arrastra el archivo PDF y cada página se convierte en una imagen JPG descargable." },
        { question: "¿Puedo convertir solo algunas páginas?", answer: "Sí. Puedes seleccionar un rango de páginas para convertir en lugar de todas." },
        { question: "¿Es seguro convertir PDF a JPG?", answer: "Sí. Todo ocurre en tu dispositivo y el archivo no se envía a ninguno servidor." },
      ],
    },
    de: {
      title: "PDF in JPG umwandeln – PDF in Bild umwandeln Online",
      metaDescription: "Seiten einer PDF-Datei kostenlos online in hochauflösende JPG-Bilder umwandeln. Jede Seite als Bild extrahieren.",
      h1: "PDF in JPG umwandeln",
      primaryKeyword: "pdf in jpg umwandeln",
      secondaryKeywords: ["pdf zu jpg", "pdf in bild umwandeln", "bilder aus pdf extrahieren", "pdf als bild speichern"],
      questions: ["Wie wandle ich PDF in JPG um?", "Wie extrahiere ich Seiten als Bilder?", "Ist der PDF-zu-JPG-Konverter kostenlos?"],
      faqs: [
        { question: "Wie wandle ich ein PDF in JPG um?", answer: "Ziehen Sie die PDF-Datei in das Tool und jede Seite wird als JPG-Bild konvertiert, das Sie herunterladen können." },
        { question: "Kann ich einzelne Seiten extrahieren?", answer: "Ja. Sie können bestimmte Seiten für die Umwandlung auswählen." },
        { question: "Ist die Umwandlung sicher?", answer: "Ja. Alles läuft lokal; die Datei wird nicht auf einen Server hochgeladen." },
      ],
    },
    fr: {
      title: "PDF en JPG – Convertir un PDF en image en ligne gratuit",
      metaDescription: "Convertissez les pages d'un PDF en images JPG haute résolution en ligne gratuitement.",
      h1: "PDF en JPG",
      primaryKeyword: "pdf en jpg",
      secondaryKeywords: ["convertir pdf en jpg", "pdf en image", "extraire image d'un pdf", "transformer pdf en image"],
      questions: ["Comment convertir un PDF en JPG ?", "Comment extraire des images d'un PDF ?", "Est-ce gratuit de convertir PDF en JPG ?"],
      faqs: [
        { question: "Comment convertir un PDF en JPG ?", answer: "Glissez le fichier PDF et chaque page est convertie en image JPG que vous pouvez télécharger." },
        { question: "Puis-je convertir une seule page ?", answer: "Oui. Vous pouvez choisir des pages précises à convertir." },
        { question: "Est-ce sûr de convertir un PDF en JPG ?", answer: "Oui. La conversion se fait sur votre appareil et le fichier n'est pas envoyé à un serveur." },
      ],
    },
    it: {
      title: "PDF in JPG – Convertire PDF in Immagine Online Gratis",
      metaDescription: "Converti le pagine di un PDF in immagini JPG ad alta risoluzione online gratis.",
      h1: "Convertire PDF in JPG",
      primaryKeyword: "pdf in jpg",
      secondaryKeywords: ["convertire pdf in jpg", "pdf in immagine", "estrarre immagini da pdf"],
      questions: ["Come convertire PDF in JPG?", "Come estrarre immagini da un PDF?", "È gratis convertire PDF in JPG?"],
      faqs: [
        { question: "Come converto un PDF in JPG?", answer: "Trascina il file PDF e ogni pagina viene convertita in un'immagine JPG scaricabile." },
        { question: "Posso convertire solo alcune pagine?", answer: "Sì. Puoi selezionare pagine specifiche da convertire." },
        { question: "È sicuro convertire PDF in JPG?", answer: "Sì. Tutto avviene sul tuo dispositivo e il file non viene inviato a server." },
      ],
    },
  },
  "merge-pdf": {
    "pt-br": {
      title: "Juntar PDF Online Grátis – Unir PDFs em um Arquivo",
      metaDescription: "Junte vários arquivos PDF em um só online grátis. Combine PDFs na ordem que quiser, direto no seu navegador.",
      h1: "Juntar PDF",
      primaryKeyword: "juntar pdf",
      secondaryKeywords: ["unir pdf", "combinar pdf", "mesclar pdf", "juntar pdf online"],
      questions: ["Como juntar vários PDFs em um só?", "Posso reordenar os arquivos antes de juntar?"],
      faqs: [
        { question: "Como juntar vários PDFs em um só?", answer: "Adicione os arquivos PDF, arraste para reordenar e clique em juntar. Todos ficam em um único arquivo." },
        { question: "É seguro juntar PDFs aqui?", answer: "Sim. A mesclagem acontece localmente no seu dispositivo." },
      ],
    },
    id: {
      title: "Gabung PDF Online Gratis – Satukan File PDF",
      metaDescription: "Gabungkan beberapa file PDF menjadi satu online gratis. Susun PDF sesuai urutan yang diinginkan di browser Anda.",
      h1: "Gabung PDF",
      primaryKeyword: "gabung pdf",
      secondaryKeywords: ["gabungkan pdf", "satukan pdf", "merge pdf", "gabung pdf online"],
      questions: ["Cara menggabungkan beberapa PDF jadi satu?", "Bisakah saya mengurutkan file sebelum menggabungkan?"],
      faqs: [
        { question: "Bagaimana cara menggabungkan beberapa PDF menjadi satu?", answer: "Tambahkan file PDF, seret untuk mengatur urutan, lalu klik gabung." },
        { question: "Apakah aman menggabungkan PDF di sini?", answer: "Ya. Proses terjadi di perangkat Anda." },
      ],
    },
    "es-mx": { title: "Unir PDF Online Gratis – Combinar PDF en un Solo Archivo", metaDescription: "Une varios archivos PDF en uno solo online gratis. Combina PDFs en el orden que quieras desde tu navegador.", h1: "Unir PDF", primaryKeyword: "unir pdf", secondaryKeywords: ["combinar pdf", "fusionar pdf", "juntar pdfs"], questions: ["¿Cómo unir varios PDFs en uno solo?"], faqs: [{ question: "¿Cómo uno varios PDFs en uno solo?", answer: "Añade los archivos, arrástralos para ordenarlos y haz clic en unir." }] },
    "es-co": { title: "Combinar PDF Online Gratis – Unir PDF en un Solo Archivo", metaDescription: "Combina varios archivos PDF en uno solo online gratis. Únelos en el orden que prefieras desde tu navegador.", h1: "Combinar PDF", primaryKeyword: "combinar pdf", secondaryKeywords: ["unir pdf", "fusionar pdf", "combinar pdfs"], questions: ["¿Cómo combinar varios PDFs en uno solo?"], faqs: [{ question: "¿Cómo combino varios PDFs en uno solo?", answer: "Agrega los archivos, organízalos y haz clic en combinar." }] },
    de: { title: "PDF zusammenfügen – Kostenlos Online mehrere PDFs verbinden", metaDescription: "Mehrere PDF-Dateien kostenlos online zu einer Datei zusammenfügen. Ordnen Sie die Reihenfolge direkt im Browser.", h1: "PDF zusammenfügen", primaryKeyword: "pdf zusammenfügen", secondaryKeywords: ["pdf zusammenführen", "pdfs verbinden", "pdf kombinieren"], questions: ["Wie füge ich mehrere PDFs zusammen?"], faqs: [{ question: "Wie füge ich mehrere PDFs zu einer Datei zusammen?", answer: "Fügen Sie die Dateien hinzu, ordnen Sie sie und klicken Sie auf zusammenfügen." }] },
    fr: { title: "Fusionner PDF en ligne gratuit – Combiner plusieurs PDF", metaDescription: "Fusionnez plusieurs fichiers PDF en un seul en ligne gratuitement, dans l'ordre de votre choix.", h1: "Fusionner PDF", primaryKeyword: "fusionner pdf", secondaryKeywords: ["combiner pdf", "regrouper pdf", "fusionner plusieurs pdf"], questions: ["Comment fusionner plusieurs PDF en un seul ?"], faqs: [{ question: "Comment fusionner plusieurs PDF ?", answer: "Ajoutez les fichiers, réorganisez-les et cliquez sur fusionner." }] },
    it: { title: "Unire PDF Online Gratis – Combinare PDF in un Unico File", metaDescription: "Unisci più file PDF in uno solo online gratis, nell'ordine che preferisci.", h1: "Unire PDF", primaryKeyword: "unire pdf", secondaryKeywords: ["combinare pdf", "unire più pdf", "fusionare pdf"], questions: ["Come unire più PDF in uno solo?"], faqs: [{ question: "Come unire più PDF in uno?", answer: "Aggiungi i file, ordinali e clicca su unisci." }] },
  },
  "split-pdf": {
    "pt-br": { title: "Dividir PDF Online Grátis – Separar Páginas do PDF", metaDescription: "Divida um arquivo PDF em vários, separe páginas ou extraia páginas específicas online grátis.", h1: "Dividir PDF", primaryKeyword: "dividir pdf", secondaryKeywords: ["separar pdf", "extrair páginas do pdf", "dividir pdf em páginas"], questions: ["Como dividir um PDF em várias partes?"], faqs: [{ question: "Como dividir um PDF?", answer: "Selecione o arquivo, escolha o intervalo de páginas e clique em dividir." }] },
    id: { title: "Pisah PDF Online Gratis – Memisahkan Halaman PDF", metaDescription: "Pisahkan file PDF menjadi beberapa bagian atau ambil halaman tertentu secara online gratis.", h1: "Pisah PDF", primaryKeyword: "pisah pdf", secondaryKeywords: ["memisahkan pdf", "potong pdf", "ambil halaman pdf"], questions: ["Cara membagi PDF menjadi beberapa bagian?"], faqs: [{ question: "Bagaimana cara membagi PDF?", answer: "Pilih file, tentukan rentang halaman, lalu klik pisah." }] },
    "es-mx": { title: "Dividir PDF Online Gratis – Separar Páginas del PDF", metaDescription: "Divide un archivo PDF en varios o extrae páginas específicas online gratis.", h1: "Dividir PDF", primaryKeyword: "dividir pdf", secondaryKeywords: ["separar pdf", "dividir pdf en páginas", "extraer páginas pdf"], questions: ["¿Cómo dividir un PDF en varias partes?"], faqs: [{ question: "¿Cómo divido un PDF?", answer: "Selecciona el archivo, elige el rango de páginas y haz clic en dividir." }] },
    "es-co": { title: "Dividir PDF Online Gratis – Separar Páginas del PDF", metaDescription: "Divide un archivo PDF en varios archivos o extrae páginas específicas online gratis.", h1: "Dividir PDF", primaryKeyword: "dividir pdf", secondaryKeywords: ["separar pdf", "partir pdf", "extraer páginas pdf"], questions: ["¿Cómo dividir un PDF en varias partes?"], faqs: [{ question: "¿Cómo divido un PDF?", answer: "Carga el archivo, elige el rango y haz clic en dividir." }] },
    de: { title: "PDF teilen – Kostenlos Online PDF aufteilen", metaDescription: "Teilen Sie eine PDF-Datei in mehrere Dateien oder extrahieren Sie einzelne Seiten online kostenlos.", h1: "PDF teilen", primaryKeyword: "pdf teilen", secondaryKeywords: ["pdf aufteilen", "pdf in mehrere dateien", "pdf seiten extrahieren"], questions: ["Wie teile ich eine PDF in mehrere Teile?"], faqs: [{ question: "Wie teile ich eine PDF?", answer: "Wählen Sie die Datei, einen Seitenbereich und klicken Sie auf teilen." }] },
    fr: { title: "Diviser PDF en ligne gratuit – Séparer les pages du PDF", metaDescription: "Divisez un fichier PDF en plusieurs fichiers ou extrayez des pages précises en ligne gratuitement.", h1: "Diviser PDF", primaryKeyword: "diviser pdf", secondaryKeywords: ["séparer pdf", "diviser pdf en pages", "extraire pages pdf"], questions: ["Comment diviser un PDF en plusieurs parties ?"], faqs: [{ question: "Comment diviser un PDF ?", answer: "Sélectionnez le fichier, choisissez la plage de pages et cliquez sur diviser." }] },
    it: { title: "Dividere PDF Online Gratis – Separare le Pagine del PDF", metaDescription: "Dividi un file PDF in più file o estrai pagine specifiche online gratis.", h1: "Dividere PDF", primaryKeyword: "dividere pdf", secondaryKeywords: ["separare pdf", "dividere pdf in pagine", "estrarre pagine pdf"], questions: ["Come dividere un PDF in più parti?"], faqs: [{ question: "Come divido un PDF?", answer: "Seleziona il file, scegli l'intervallo di pagine e clicca su dividi." }] },
  },
  "pdf-to-word": {
    "pt-br": { title: "PDF para Word – Converter PDF em Word Online Grátis", metaDescription: "Converta um arquivo PDF em um documento Word editável online grátis, mantendo o layout.", h1: "Converter PDF para Word", primaryKeyword: "pdf para word", secondaryKeywords: ["converter pdf em word", "pdf em word", "editar pdf como word"], questions: ["Como converter PDF para Word?"], faqs: [{ question: "Como converter um PDF para Word?", answer: "Envie o arquivo e baixe o documento Word resultante, pronto para editar." }] },
    id: { title: "PDF ke Word – Ubah PDF Menjadi Word Online Gratis", metaDescription: "Ubah file PDF menjadi dokumen Word yang bisa diedit secara online gratis.", h1: "Ubah PDF ke Word", primaryKeyword: "pdf ke word", secondaryKeywords: ["konversi pdf ke word", "ubah pdf jadi word"], questions: ["Cara mengubah PDF ke Word?"], faqs: [{ question: "Bagaimana cara mengubah PDF ke Word?", answer: "Unggah file dan unduh dokumen Word hasil konversi." }] },
    "es-mx": { title: "PDF a Word – Convertir PDF a Word Online Gratis", metaDescription: "Convierte un archivo PDF en un documento Word editable online gratis.", h1: "Convertir PDF a Word", primaryKeyword: "pdf a word", secondaryKeywords: ["convertir pdf en word", "pdf en word"], questions: ["¿Cómo convertir PDF a Word?"], faqs: [{ question: "¿Cómo convierto un PDF a Word?", answer: "Sube el archivo y descarga el documento Word resultante." }] },
    "es-co": { title: "PDF a Word – Convertir PDF a Word Online Gratis", metaDescription: "Convierte un archivo PDF en un documento Word editable online gratis.", h1: "Convertir PDF a Word", primaryKeyword: "pdf a word", secondaryKeywords: ["convertir pdf en word", "pasar pdf a word"], questions: ["¿Cómo convertir PDF a Word?"], faqs: [{ question: "¿Cómo convierto un PDF a Word?", answer: "Carga el archivo y descarga el documento Word." }] },
    de: { title: "PDF in Word umwandeln – Kostenlos Online", metaDescription: "Wandeln Sie eine PDF-Datei kostenlos online in ein bearbeitbares Word-Dokument um.", h1: "PDF in Word umwandeln", primaryKeyword: "pdf in word umwandeln", secondaryKeywords: ["pdf zu word", "pdf in word konvertieren"], questions: ["Wie wandle ich PDF in Word um?"], faqs: [{ question: "Wie wandle ich ein PDF in Word um?", answer: "Laden Sie die Datei hoch und laden Sie das Word-Dokument herunter." }] },
    fr: { title: "PDF en Word – Convertir un PDF en Word en ligne gratuit", metaDescription: "Convertissez un fichier PDF en document Word modifiable en ligne gratuitement.", h1: "PDF en Word", primaryKeyword: "pdf en word", secondaryKeywords: ["convertir pdf en word", "pdf vers word"], questions: ["Comment convertir un PDF en Word ?"], faqs: [{ question: "Comment convertir un PDF en Word ?", answer: "Envoyez le fichier et téléchargez le document Word." }] },
    it: { title: "PDF in Word – Convertire PDF in Word Online Gratis", metaDescription: "Converti un file PDF in un documento Word modificabile online gratis.", h1: "Convertire PDF in Word", primaryKeyword: "pdf in word", secondaryKeywords: ["convertire pdf in word", "pdf verso word"], questions: ["Come convertire PDF in Word?"], faqs: [{ question: "Come converto un PDF in Word?", answer: "Carica il file e scarica il documento Word." }] },
  },
  "word-to-pdf": {
    "pt-br": { title: "Word para PDF – Converter Word em PDF Online Grátis", metaDescription: "Converta documentos Word em PDF online grátis, preservando o layout e a formatação.", h1: "Converter Word para PDF", primaryKeyword: "word para pdf", secondaryKeywords: ["converter word em pdf", "word em pdf"], questions: ["Como converter Word para PDF?"], faqs: [{ question: "Como converter um documento Word para PDF?", answer: "Envie o arquivo .docx e baixe o PDF resultante." }] },
    id: { title: "Word ke PDF – Ubah Word Menjadi PDF Online Gratis", metaDescription: "Ubah dokumen Word menjadi PDF online gratis dengan mempertahankan format.", h1: "Ubah Word ke PDF", primaryKeyword: "word ke pdf", secondaryKeywords: ["konversi word ke pdf", "docx ke pdf"], questions: ["Cara mengubah Word ke PDF?"], faqs: [{ question: "Bagaimana cara mengubah Word ke PDF?", answer: "Unggah file .docx dan unduh PDF hasil konversi." }] },
    "es-mx": { title: "Word a PDF – Convertir Word a PDF Online Gratis", metaDescription: "Convierte documentos Word en PDF online gratis conservando el formato.", h1: "Convertir Word a PDF", primaryKeyword: "word a pdf", secondaryKeywords: ["convertir word en pdf", "docx a pdf"], questions: ["¿Cómo convertir Word a PDF?"], faqs: [{ question: "¿Cómo convierto un Word a PDF?", answer: "Sube el archivo .docx y descarga el PDF." }] },
    "es-co": { title: "Word a PDF – Convertir Word a PDF Online Gratis", metaDescription: "Convierte documentos Word en PDF online gratis conservando el formato.", h1: "Convertir Word a PDF", primaryKeyword: "word a pdf", secondaryKeywords: ["convertir word en pdf", "docx a pdf"], questions: ["¿Cómo convertir Word a PDF?"], faqs: [{ question: "¿Cómo convierto un Word a PDF?", answer: "Carga el archivo .docx y descarga el PDF." }] },
    de: { title: "Word in PDF umwandeln – Kostenlos Online", metaDescription: "Wandeln Sie Word-Dokumente kostenlos online in PDF um – mit Layout-Erhalt.", h1: "Word in PDF umwandeln", primaryKeyword: "word in pdf umwandeln", secondaryKeywords: ["word zu pdf", "docx in pdf"], questions: ["Wie wandle ich Word in PDF um?"], faqs: [{ question: "Wie wandle ich Word in PDF um?", answer: "Laden Sie die .docx-Datei hoch und laden Sie das PDF herunter." }] },
    fr: { title: "Word en PDF – Convertir Word en PDF en ligne gratuit", metaDescription: "Convertissez des documents Word en PDF en ligne gratuitement.", h1: "Word en PDF", primaryKeyword: "word en pdf", secondaryKeywords: ["convertir word en pdf", "docx en pdf"], questions: ["Comment convertir Word en PDF ?"], faqs: [{ question: "Comment convertir un Word en PDF ?", answer: "Envoyez le fichier .docx et téléchargez le PDF." }] },
    it: { title: "Word in PDF – Convertire Word in PDF Online Gratis", metaDescription: "Converti documenti Word in PDF online gratis mantenendo il layout.", h1: "Convertire Word in PDF", primaryKeyword: "word in pdf", secondaryKeywords: ["convertire word in pdf", "docx in pdf"], questions: ["Come convertire Word in PDF?"], faqs: [{ question: "Come converto Word in PDF?", answer: "Carica il file .docx e scarica il PDF." }] },
  },
  "image-resizer": {
    "pt-br": { title: "Redimensionar Imagem Online Grátis – Alterar as Dimensões", metaDescription: "Redimensione imagens online grátis, em pixels ou porcentagem, mantendo ou não a proporção. Rápido, sem instalar e direto no navegador.", h1: "Redimensionar Imagem", primaryKeyword: "redimensionar imagem", secondaryKeywords: ["redimensionar imagem online", "redimensionar imagem sem perder qualidade", "redimensionar imagem para instagram", "redimensionar imagem em pixels", "como redimensionar imagem", "mudar tamanho da imagem"], questions: ["Como redimensionar uma imagem?", "Posso redimensionar em pixels ou em porcentagem?", "Como redimensionar uma imagem para redes sociais?", "Redimensionar altera a qualidade da imagem?"], faqs: [{ question: "Como redimensionar uma imagem?", answer: "Arraste o arquivo, informe a nova largura e altura (em pixels ou em porcentagem) e clique em redimensionar. O resultado é baixado direto no seu navegador." }, { question: "Posso redimensionar em pixels ou em porcentagem?", answer: "Sim. Você escolhe entre valores em pixels ou um percentual, e pode travar a proporção para a imagem não ficar distorcida." }, { question: "Como redimensionar uma imagem para redes sociais?", answer: "Informe as dimensões que a rede exige, como o quadrado 1080×1080 para o Instagram, e mantenha a proporção travada. Para mais formatos prontos, veja também a ferramenta de dimensionamento para redes sociais." }, { question: "Redimensionar altera a qualidade da imagem?", answer: "Reduzir mantém a nitidez, enquanto ampliar pode suavizar detalhes. A ferramenta usa a imagem original para reescalar, evitando perda desnecessária." }] },
    id: { title: "Ubah Ukuran Gambar Online Gratis – Mengubah Dimensi Gambar", metaDescription: "Ubah ukuran gambar online gratis, dalam piksel atau persen, dengan atau tanpa menjaga rasio aspek.", h1: "Ubah Ukuran Gambar", primaryKeyword: "ubah ukuran gambar", secondaryKeywords: ["ubah ukuran gambar online", "resize gambar", "mengubah dimensi gambar"], questions: ["Cara mengubah ukuran gambar?"], faqs: [{ question: "Bagaimana cara mengubah ukuran gambar?", answer: "Seret file, masukkan lebar dan tinggi baru, lalu klik ubah ukuran." }] },
    "es-mx": { title: "Redimensionar Imagen Online Gratis – Cambiar las Dimensiones", metaDescription: "Redimensiona imágenes online gratis, en píxeles o porcentaje, con o sin mantener la proporción.", h1: "Redimensionar Imagen", primaryKeyword: "redimensionar imagen", secondaryKeywords: ["redimensionar imagen online", "cambiar tamaño imagen", "redimensionar imagen en píxeles"], questions: ["¿Cómo redimensionar una imagen?"], faqs: [{ question: "¿Cómo redimensiono una imagen?", answer: "Sube el archivo, indica el nuevo ancho y alto y haz clic en redimensionar." }] },
    "es-co": { title: "Redimensionar Imagen Online Gratis – Cambiar las Dimensiones", metaDescription: "Redimensiona imágenes online gratis, en píxeles o porcentaje, manteniendo o no la proporción.", h1: "Redimensionar Imagen", primaryKeyword: "redimensionar imagen", secondaryKeywords: ["redimensionar imagen online", "cambiar tamaño imagen"], questions: ["¿Cómo redimensionar una imagen?"], faqs: [{ question: "¿Cómo redimensiono una imagen?", answer: "Carga el archivo, define el nuevo tamaño y haz clic en redimensionar." }] },
    de: { title: "Bildgröße ändern – Kostenlos Online Bilder skalieren", metaDescription: "Ändern Sie die Bildgröße kostenlos online – in Pixeln oder Prozent, mit oder ohne Seitenverhältnis.", h1: "Bildgröße ändern", primaryKeyword: "bildgröße ändern", secondaryKeywords: ["bild skalieren", "bildgröße online ändern"], questions: ["Wie ändere ich die Bildgröße?"], faqs: [{ question: "Wie ändere ich die Bildgröße?", answer: "Laden Sie die Datei hoch, geben Sie die neuen Maße ein und klicken Sie auf skalieren." }] },
    fr: { title: "Redimensionner une image en ligne gratuit – Changer les dimensions", metaDescription: "Redimensionnez une image en ligne gratuitement, en pixels ou en pourcentage, avec ou sans conserver les proportions.", h1: "Redimensionner une image", primaryKeyword: "redimensionner une image", secondaryKeywords: ["redimensionner image", "changer la taille d'une image"], questions: ["Comment redimensionner une image ?"], faqs: [{ question: "Comment redimensionner une image ?", answer: "Déposez le fichier, indiquez la nouvelle largeur et hauteur puis cliquez sur redimensionner." }] },
    it: { title: "Ridimensionare Immagine Online Gratis – Cambiare le Dimensioni", metaDescription: "Ridimensiona immagini online gratis, in pixel o percentuale, con o senza mantenere le proporzioni.", h1: "Ridimensionare immagine", primaryKeyword: "ridimensionare immagine", secondaryKeywords: ["ridimensionare immagine online", "cambiare dimensione immagine"], questions: ["Come ridimensionare un'immagine?"], faqs: [{ question: "Come ridimensiono un'immagine?", answer: "Carica il file, inserisci le nuove dimensioni e clicca su ridimensiona." }] },
  },
  "image-cropper": {
    "pt-br": { title: "Cortar Imagem Online Grátis – Cortar com Proporções", metaDescription: "Corte imagens online grátis com proporções prontas (1:1, 16:9, 4:3) ou corte livre, ajustando a área desejada. Sem instalar nada.", h1: "Cortar Imagem", primaryKeyword: "cortar imagem", secondaryKeywords: ["cortar imagem online", "cortar imagem carrossel", "cortar imagem em círculo", "cortar imagem png", "como cortar imagem", "recortar imagem"], questions: ["Como cortar uma imagem?", "Como cortar uma imagem para um carrossel?", "É possível cortar em proporção personalizada?", "Consigo cortar a imagem em círculo?"], faqs: [{ question: "Como cortar uma imagem?", answer: "Envie a imagem, ajuste a área de corte arrastando as bordas e clique em cortar. A ferramenta recorta e você baixa o resultado." }, { question: "Como cortar uma imagem para um carrossel?", answer: "Use uma proporção quadrada (1:1) ou 4:3, que são as mais comuns em carrosséis de redes sociais, e ajuste o enquadramento antes de cortar." }, { question: "Posso cortar em proporção personalizada?", answer: "Sim. Você pode usar o modo de corte livre para definir qualquer área, ou escolher entre proporções prontas como 1:1, 16:9, 4:3 e 2:3." }, { question: "Consigo cortar a imagem em círculo?", answer: "Esta ferramenta recorta em formatos retangulares e proporções definidas, não aplica moldura circular. Para um recorte redondo você precisaria de uma ferramenta de sobreposição/mascara depois." }] },
    id: { title: "Crop Gambar Online Gratis – Potong dengan Rasio", metaDescription: "Potong gambar online gratis dengan rasio siap pakai (1:1, 16:9, 4:3) atau potong bebas.", h1: "Crop Gambar", primaryKeyword: "crop gambar", secondaryKeywords: ["crop gambar online", "memotong gambar"], questions: ["Cara memotong gambar?"], faqs: [{ question: "Bagaimana cara memotong gambar?", answer: "Unggah gambar, atur area potong, lalu klik potong." }] },
    "es-mx": { title: "Recortar Imagen Online Gratis – Recortar con Proporciones", metaDescription: "Recorta imágenes online gratis con proporciones listas (1:1, 16:9, 4:3) o recorte libre.", h1: "Recortar Imagen", primaryKeyword: "recortar imagen", secondaryKeywords: ["recortar imagen online", "cortar imagen"], questions: ["¿Cómo recortar una imagen?"], faqs: [{ question: "¿Cómo recorto una imagen?", answer: "Sube la imagen, ajusta el área de recorte y haz clic en recortar." }] },
    "es-co": { title: "Recortar Imagen Online Gratis – Recortar con Proporciones", metaDescription: "Recorta imágenes online gratis con proporciones listas o recorte libre.", h1: "Recortar Imagen", primaryKeyword: "recortar imagen", secondaryKeywords: ["recortar imagen online", "cortar imagen"], questions: ["¿Cómo recortar una imagen?"], faqs: [{ question: "¿Cómo recorto una imagen?", answer: "Carga la imagen, define el área y haz clic en recortar." }] },
    de: { title: "Bild zuschneiden – Kostenlos Online Bilder zuschneiden", metaDescription: "Schneiden Sie Bilder kostenlos online mit festen Seitenverhältnissen (1:1, 16:9, 4:3) oder frei zu.", h1: "Bild zuschneiden", primaryKeyword: "bild zuschneiden", secondaryKeywords: ["bild ausschneiden", "bild zuschneiden online"], questions: ["Wie schneide ich ein Bild zu?"], faqs: [{ question: "Wie schneide ich ein Bild zu?", answer: "Laden Sie das Bild hoch, wählen Sie den Bereich und klicken Sie auf zuschneiden." }] },
    fr: { title: "Recadrer une image en ligne gratuit – Recadrer avec des proportions", metaDescription: "Recadrez une image en ligne gratuitement avec des proportions prêtes (1:1, 16:9, 4:3) ou recadrage libre.", h1: "Recadrer une image", primaryKeyword: "recadrer une image", secondaryKeywords: ["recadrer image", "couper une image"], questions: ["Comment recadrer une image ?"], faqs: [{ question: "Comment recadrer une image ?", answer: "Déposez l'image, ajustez la zone de recadrage et cliquez sur recadrer." }] },
    it: { title: "Ritagliare Immagine Online Gratis – Ritagliare con Proporzioni", metaDescription: "Ritaglia immagini online gratis con proporzioni pronte (1:1, 16:9, 4:3) o ritaglio libero.", h1: "Ritagliare immagine", primaryKeyword: "ritagliare immagine", secondaryKeywords: ["ritagliare immagine online", "tagliare immagine"], questions: ["Come ritagliare un'immagine?"], faqs: [{ question: "Come ritaglio un'immagine?", answer: "Carica l'immagine, regola l'area e clicca su ritaglia." }] },
  },
  "image-converter": {
    "pt-br": { title: "Conversor de Imagem Online Grátis – Converter Entre Formatos", metaDescription: "Converta imagens online grátis entre JPG, PNG, WebP, AVIF, HEIC e outros formatos. Sem instalar e com controle de qualidade.", h1: "Conversor de Imagem", primaryKeyword: "conversor de imagem", secondaryKeywords: ["conversor de imagem para png", "conversor de imagem para jpg", "converter imagem", "converter imagem para png", "converter imagem para jpg"], questions: ["Como converter uma imagem?", "Como converter uma imagem para JPG?", "Que formatos são aceitos?"], faqs: [{ question: "Como converter uma imagem?", answer: "Arraste o arquivo, escolha o formato de saída e clique em converter. O resultado é baixado direto no seu navegador." }, { question: "Como converter uma imagem para JPG ou PNG?", answer: "Selecione o formato de destino — JPG, PNG, WebP, entre outros — e ajuste a qualidade se quiser, antes de converter." }, { question: "Quais formatos o conversor aceita?", answer: "A ferramenta aceita JPG, PNG, WEBP, AVIF, HEIC, SVG, BMP, TIFF, ICO e GIF como entrada, conversando para vários formatos de saída." }] },
    id: { title: "Konversi Gambar Online Gratis – Ubah Antar Format", metaDescription: "Ubah gambar online gratis antar format JPG, PNG, WebP, AVIF dan lainnya.", h1: "Konversi Gambar", primaryKeyword: "konversi gambar", secondaryKeywords: ["konversi gambar online", "ubah format gambar"], questions: ["Cara mengonversi gambar?"], faqs: [{ question: "Bagaimana cara mengonversi gambar?", answer: "Seret file, pilih format keluaran, lalu klik konversi." }] },
    "es-mx": { title: "Convertir Imagen Online Gratis – Convertir entre Formatos", metaDescription: "Convierte imágenes online gratis entre JPG, PNG, WebP, AVIF y otros formatos.", h1: "Convertir Imagen", primaryKeyword: "convertir imagen", secondaryKeywords: ["convertir imagen online", "cambiar formato de imagen"], questions: ["¿Cómo convertir una imagen?"], faqs: [{ question: "¿Cómo convierto una imagen?", answer: "Sube el archivo, elige el formato de salida y haz clic en convertir." }] },
    "es-co": { title: "Convertir Imagen Online Gratis – Convertir entre Formatos", metaDescription: "Convierte imágenes online gratis entre JPG, PNG, WebP, AVIF y otros.", h1: "Convertir Imagen", primaryKeyword: "convertir imagen", secondaryKeywords: ["convertir imagen online", "cambiar formato imagen"], questions: ["¿Cómo convertir una imagen?"], faqs: [{ question: "¿Cómo convierto una imagen?", answer: "Carga el archivo, selecciona el formato y haz clic en convertir." }] },
    de: { title: "Bild konvertieren – Kostenlos Online Formate umwandeln", metaDescription: "Konvertieren Sie Bilder kostenlos online zwischen JPG, PNG, WebP, AVIF und mehr.", h1: "Bild konvertieren", primaryKeyword: "bild konvertieren", secondaryKeywords: ["bildformat ändern", "bild konvertieren online"], questions: ["Wie konvertiere ich ein Bild?"], faqs: [{ question: "Wie konvertiere ich ein Bild?", answer: "Laden Sie das Bild hoch, wählen Sie das Zielformat und klicken Sie auf konvertieren." }] },
    fr: { title: "Convertir une image en ligne gratuit – Changer de format", metaDescription: "Convertissez une image en ligne gratuitement entre JPG, PNG, WebP, AVIF et plus.", h1: "Convertir une image", primaryKeyword: "convertir une image", secondaryKeywords: ["convertir image", "changer le format d'une image"], questions: ["Comment convertir une image ?"], faqs: [{ question: "Comment convertir une image ?", answer: "Déposez le fichier, choisissez le format de sortie et cliquez sur convertir." }] },
    it: { title: "Convertire Immagine Online Gratis – Cambiare Formato", metaDescription: "Converti immagini online gratis tra JPG, PNG, WebP, AVIF e altri formati.", h1: "Convertire immagine", primaryKeyword: "convertire immagine", secondaryKeywords: ["convertire immagine online", "cambiare formato immagine"], questions: ["Come convertire un'immagine?"], faqs: [{ question: "Come converto un'immagine?", answer: "Carica il file, scegli il formato di output e clicca su converti." }] },
  },
  "protect-pdf": {
    "pt-br": { title: "Proteger PDF com Senha – Criptografar PDF Online Grátis", metaDescription: "Proteja seu PDF com senha e restrinja cópia, impressão e edição online grátis, com criptografia AES direto no navegador.", h1: "Proteger PDF", primaryKeyword: "proteger pdf", secondaryKeywords: ["proteger pdf com senha", "proteger pdf contra edição", "proteger pdf contra cópia e edição", "colocar senha em pdf", "criptografar pdf"], questions: ["Como proteger um PDF com senha?", "Como proteger um PDF contra edição?", "Como colocar senha em um PDF?", "É seguro proteger um PDF aqui?"], faqs: [{ question: "Como proteger um PDF com senha?", answer: "Envie o arquivo, defina uma senha de abertura (e, se quiser, uma senha de proprietário) e clique em criptografar. A partir daí, o PDF pede a senha para abrir." }, { question: "Como proteger um PDF contra edição ou cópia?", answer: "Marque as permissões de leitor (imprimir, copiar, modificar) que você quer bloquear. Esses controles são respeitados por programas de leitura comuns; a senha de abertura é o que realmente impede o acesso." }, { question: "Como colocar senha em um PDF?", answer: "Use a ferramenta de proteger PDF, informe a senha desejada e baixe a cópia criptografada. A criptografia (AES) roda inteiramente no seu navegador." }, { question: "É seguro proteger um PDF aqui?", answer: "Sim. A criptografia acontece localmente no seu dispositivo e a senha nunca sai do seu navegador." }] },
    id: { title: "Lindungi PDF dengan Kata Sandi – Enkripsi PDF Online Gratis", metaDescription: "Lindungi PDF Anda dengan kata sandi dan batasi salin, cetak, dan edit secara online gratis.", h1: "Lindungi PDF", primaryKeyword: "lindungi pdf", secondaryKeywords: ["lindungi pdf dengan kata sandi", "enkripsi pdf"], questions: ["Cara melindungi PDF dengan kata sandi?"], faqs: [{ question: "Bagaimana cara melindungi PDF dengan kata sandi?", answer: "Unggah file, atur kata sandi, lalu unduh versi terenkripsi." }] },
    "es-mx": { title: "Proteger PDF con Contraseña – Cifrar PDF Online Gratis", metaDescription: "Protege tu PDF con contraseña y limita copia, impresión y edición online gratis.", h1: "Proteger PDF", primaryKeyword: "proteger pdf", secondaryKeywords: ["proteger pdf con contraseña", "poner contraseña a pdf"], questions: ["¿Cómo proteger un PDF con contraseña?"], faqs: [{ question: "¿Cómo protejo un PDF con contraseña?", answer: "Sube el archivo, define la contraseña y descarga la copia cifrada." }] },
    "es-co": { title: "Proteger PDF con Contraseña – Cifrar PDF Online Gratis", metaDescription: "Protege tu PDF con contraseña y limita la copia, impresión y edición online gratis.", h1: "Proteger PDF", primaryKeyword: "proteger pdf", secondaryKeywords: ["proteger pdf con contraseña", "poner contraseña a pdf"], questions: ["¿Cómo proteger un PDF con contraseña?"], faqs: [{ question: "¿Cómo protejo un PDF?", answer: "Carga el archivo, define la contraseña y descarga el PDF cifrado." }] },
    de: { title: "PDF schützen – PDF mit Passwort online kostenlos verschlüsseln", metaDescription: "Schützen Sie Ihre PDF mit Passwort und schränken Sie Kopieren, Drucken und Bearbeiten online kostenlos ein.", h1: "PDF schützen", primaryKeyword: "pdf schützen", secondaryKeywords: ["pdf mit passwort schützen", "pdf verschlüsseln"], questions: ["Wie schütze ich eine PDF mit Passwort?"], faqs: [{ question: "Wie schütze ich eine PDF mit Passwort?", answer: "Laden Sie das PDF hoch, legen Sie ein Passwort fest und laden Sie die verschlüsselte Datei herunter." }] },
    fr: { title: "Protéger un PDF par mot de passe – Chiffrer un PDF en ligne gratuit", metaDescription: "Protégez votre PDF par mot de passe et limitez la copie, l'impression et la modification en ligne gratuitement.", h1: "Protéger un PDF", primaryKeyword: "protéger un pdf", secondaryKeywords: ["protéger un pdf par mot de passe", "mettre un mot de passe sur un pdf"], questions: ["Comment protéger un PDF par mot de passe ?"], faqs: [{ question: "Comment protéger un PDF par mot de passe ?", answer: "Déposez le fichier, définissez le mot de passe et téléchargez la copie chiffrée." }] },
    it: { title: "Proteggere PDF con Password – Crittografare PDF Online Gratis", metaDescription: "Proteggi il tuo PDF con password e limita copia, stampa e modifica online gratis.", h1: "Proteggere PDF", primaryKeyword: "proteggere pdf", secondaryKeywords: ["proteggere pdf con password", "crittografare pdf"], questions: ["Come proteggere un PDF con password?"], faqs: [{ question: "Come proteggo un PDF con password?", answer: "Carica il file, imposta la password e scarica la copia cifrata." }] },
  },
  "unlock-pdf": {
    "pt-br": { title: "Desbloquear PDF – Remover Restrições Online Grátis", metaDescription: "Desbloqueie um PDF e remova restrições de cópia e impressão online grátis. Para arquivos com senha de abertura, é preciso informar a senha.", h1: "Desbloquear PDF", primaryKeyword: "desbloquear pdf", secondaryKeywords: ["desbloquear pdf online", "remover proteção do pdf", "desbloquear pdf com senha", "remover restrições de pdf"], questions: ["Como desbloquear um PDF?", "Posso remover as restrições de um PDF?", "O que acontece se o PDF exigir uma senha?"], faqs: [{ question: "Como desbloquear um PDF?", answer: "Envie o arquivo e a ferramenta remove as restrições de permissão de arquivos que abrem normalmente, gerando uma cópia desbloqueada para download." }, { question: "Posso remover as restrições de um PDF?", answer: "Sim, para PDFs que abrem sem senha, mas que bloqueiam ações como copiar ou imprimir. Essas restrições são removidas localmente no seu navegador." }, { question: "O que acontece se o PDF exigir uma senha para abrir?", answer: "Se o arquivo pede uma senha de abertura, ele não pode ser aberto sem ela — e a criptografia forte não é contornável no navegador. Se você souber a senha, use a ferramenta Remover Senha do PDF." }] },
    id: { title: "Buka Kunci PDF – Hapus Pembatasan Online Gratis", metaDescription: "Buka kunci PDF dan hapus pembatasan salin serta cetak secara online gratis.", h1: "Buka Kunci PDF", primaryKeyword: "buka kunci pdf", secondaryKeywords: ["hapus proteksi pdf", "unlock pdf"], questions: ["Cara membuka kunci PDF?"], faqs: [{ question: "Bagaimana cara membuka kunci PDF?", answer: "Unggah file dan berbagi batasan akan dihapus, lalu unduh salinannya." }] },
    "es-mx": { title: "Desbloquear PDF – Quitar Restricciones Online Gratis", metaDescription: "Desbloquea un PDF y elimina restricciones de copia e impresión online gratis.", h1: "Desbloquear PDF", primaryKeyword: "desbloquear pdf", secondaryKeywords: ["desbloquear pdf online", "quitar protección pdf"], questions: ["¿Cómo desbloquear un PDF?"], faqs: [{ question: "¿Cómo desbloqueo un PDF?", answer: "Sube el archivo y se eliminan las restricciones, luego descarga la copia desbloqueada." }] },
    "es-co": { title: "Desbloquear PDF – Quitar Restricciones Online Gratis", metaDescription: "Desbloquea un PDF y elimina restricciones de copia e impresión online gratis.", h1: "Desbloquear PDF", primaryKeyword: "desbloquear pdf", secondaryKeywords: ["desbloquear pdf online", "quitar protección pdf"], questions: ["¿Cómo desbloquear un PDF?"], faqs: [{ question: "¿Cómo desbloqueo un PDF?", answer: "Carga el archivo y descarga la versión sin restricciones." }] },
    de: { title: "PDF entsperren – Einschränkungen online kostenlos entfernen", metaDescription: "Entsperren Sie eine PDF und entfernen Sie Kopier- und Druckeinschränkungen online kostenlos.", h1: "PDF entsperren", primaryKeyword: "pdf entsperren", secondaryKeywords: ["pdf freischalten", "pdf schutz entfernen"], questions: ["Wie entsperre ich eine PDF?"], faqs: [{ question: "Wie entsperre ich eine PDF?", answer: "Laden Sie die Datei hoch und laden Sie die entsperrte Kopie herunter." }] },
    fr: { title: "Déverrouiller un PDF – Supprimer les restrictions en ligne gratuit", metaDescription: "Déverrouillez un PDF et supprimez les restrictions de copie et d'impression en ligne gratuitement.", h1: "Déverrouiller un PDF", primaryKeyword: "déverrouiller un pdf", secondaryKeywords: ["déverrouiller pdf", "enlever la protection d'un pdf"], questions: ["Comment déverrouiller un PDF ?"], faqs: [{ question: "Comment déverrouiller un PDF ?", answer: "Déposez le fichier et téléchargez la copie déverrouillée." }] },
    it: { title: "Sbloccare PDF – Rimuovere le Restrizioni Online Gratis", metaDescription: "Sblocca un PDF e rimuovi le restrizioni di copia e stampa online gratis.", h1: "Sbloccare PDF", primaryKeyword: "sbloccare pdf", secondaryKeywords: ["rimuovere protezione pdf", "sbloccare pdf online"], questions: ["Come sbloccare un PDF?"], faqs: [{ question: "Come sblocco un PDF?", answer: "Carica il file e scarica la copia sbloccata." }] },
  },
  "remove-pdf-password": {
    "pt-br": { title: "Remover Senha do PDF – Desproteger PDF Online Grátis", metaDescription: "Remova a senha de um PDF informando a senha atual, direto no navegador. Descriptografa o arquivo e gera uma cópia sem proteção.", h1: "Remover Senha do PDF", primaryKeyword: "remover senha do pdf", secondaryKeywords: ["remover senha de pdf", "desproteger pdf", "tirar senha do pdf"], questions: ["Como remover a senha de um PDF?", "Esqueci a senha do meu PDF, o que fazer?"], faqs: [{ question: "Como remover a senha de um PDF?", answer: "Informe a senha atual do arquivo nos campos e a ferramenta descriptografa e gera uma cópia sem proteção, pronta para download." }, { question: "Esqueci a senha do meu PDF, o que fazer?", answer: "Se você perdeu a senha de abertura, não há como contornar a criptografia forte no navegador. Recupere a senha ou peça uma nova cópia a quem criou o arquivo." }] },
    id: { title: "Hapus Kata Sandi PDF – Buka Proteksi PDF Online Gratis", metaDescription: "Hapus kata sandi PDF dengan memasukkan kata sandi saat ini, langsung di browser.", h1: "Hapus Kata Sandi PDF", primaryKeyword: "hapus kata sandi pdf", secondaryKeywords: ["hapus password pdf", "buka proteksi pdf"], questions: ["Cara menghapus kata sandi PDF?"], faqs: [{ question: "Bagaimana cara menghapus kata sandi PDF?", answer: "Masukkan kata sandi saat ini dan unduh salinan tanpa proteksi." }] },
    "es-mx": { title: "Quitar Contraseña PDF – Desproteger PDF Online Gratis", metaDescription: "Quita la contraseña de un PDF introduciendo la contraseña actual, directamente en el navegador.", h1: "Quitar Contraseña PDF", primaryKeyword: "quitar contraseña pdf", secondaryKeywords: ["quitar password pdf", "desproteger pdf"], questions: ["¿Cómo quitar la contraseña de un PDF?"], faqs: [{ question: "¿Cómo quito la contraseña de un PDF?", answer: "Introduce la contraseña actual y descarga la copia sin protección." }] },
    "es-co": { title: "Quitar Contraseña PDF – Desproteger PDF Online Gratis", metaDescription: "Quita la contraseña de un PDF ingresando la contraseña actual, directamente en el navegador.", h1: "Quitar Contraseña PDF", primaryKeyword: "quitar contraseña pdf", secondaryKeywords: ["quitar password pdf", "desproteger pdf"], questions: ["¿Cómo quitar la contraseña de un PDF?"], faqs: [{ question: "¿Cómo quito la contraseña de un PDF?", answer: "Ingresa la contraseña actual y descarga la copia desprotegida." }] },
    de: { title: "PDF-Passwort entfernen – PDF online kostenlos entschlüsseln", metaDescription: "Entfernen Sie das Passwort einer PDF, indem Sie das aktuelle Passwort eingeben, direkt im Browser.", h1: "PDF-Passwort entfernen", primaryKeyword: "pdf-passwort entfernen", secondaryKeywords: ["passwort von pdf entfernen", "pdf entschlüsseln"], questions: ["Wie entferne ich das Passwort einer PDF?"], faqs: [{ question: "Wie entferne ich das Passwort einer PDF?", answer: "Geben Sie das aktuelle Passwort ein und laden Sie die entschlüsselte Datei herunter." }] },
    fr: { title: "Retirer le mot de passe d'un PDF – Déprotéger un PDF en ligne gratuit", metaDescription: "Retirez le mot de passe d'un PDF en saisissant le mot de passe actuel, directement dans le navigateur.", h1: "Retirer le mot de passe d'un PDF", primaryKeyword: "retirer le mot de passe d'un pdf", secondaryKeywords: ["enlever mot de passe pdf", "déprotéger pdf"], questions: ["Comment retirer le mot de passe d'un PDF ?"], faqs: [{ question: "Comment retirer le mot de passe d'un PDF ?", answer: "Saisissez le mot de passe actuel et téléchargez la copie déprotégée." }] },
    it: { title: "Rimuovere Password PDF – Sbloccare PDF Online Gratis", metaDescription: "Rimuovi la password di un PDF inserendo la password attuale, direttamente nel browser.", h1: "Rimuovere password PDF", primaryKeyword: "rimuovere password pdf", secondaryKeywords: ["togliere password pdf", "sbloccare pdf"], questions: ["Come rimuovere la password di un PDF?"], faqs: [{ question: "Come rimuovo la password di un PDF?", answer: "Inserisci la password attuale e scarica la copia senza protezione." }] },
  },
  "box-shadow-generator": {
    "pt-br": {
      title: "Gerador de Sombra CSS – Criar Sombra CSS Online Grátis",
      metaDescription: "Gere sombras CSS com múltiplas camadas, ajuste posição, opacidade e raio, e copie o código pronto. Grátis, privado e sem conta.",
      h1: "Gerador de Sombra CSS",
      primaryKeyword: "gerador de sombra css",
      secondaryKeywords: ["gerador de sombras css", "box shadow css", "sombra css", "criar sombra css"],
      questions: [
        "Como criar uma sombra CSS?",
        "Como adicionar múltiplas camadas de sombra?",
        "O gerador de sombra CSS é grátis?",
      ],
      faqs: [
        { question: "Como criar uma sombra CSS?", answer: "Arraste os controles para ajustar deslocamento, opacidade e raio, ou escolha um preset pronto. O código CSS é gerado automaticamente para você copiar." },
        { question: "Como adicionar múltiplas camadas de sombra?", answer: "Clique em \"Adicionar outra sombra\" para criar camadas independentes. Cada camada pode ter sua própria cor, opacidade e posição." },
        { question: "O gerador de sombra CSS é grátis?", answer: "Sim. Todas as ferramentas GainUtility são gratuitas, rodam no seu navegador e não exigem cadastro." },
      ],
    },
    id: {
      title: "Pembuat Bayangan CSS – Buat Bayangan CSS Online Gratis",
      metaDescription: "Buat bayangan CSS dengan beberapa lapisan, sesuaikan posisi, opasitas, dan radius, lalu salin kode yang siap pakai.",
      h1: "Pembuat Bayangan CSS",
      primaryKeyword: "pembuat bayangan css",
      secondaryKeywords: ["bayangan css", "generator box shadow", "membuat bayangan css", "box shadow css"],
      questions: [
        "Bagaimana cara membuat bayangan CSS?",
        "Bagaimana cara menambahkan beberapa lapisan bayangan?",
        "Apakah pembuat bayangan CSS gratis?",
      ],
      faqs: [
        { question: "Bagaimana cara membuat bayangan CSS?", answer: "Geser kontrol untuk menyesuaikan offset, opasitas, dan radius, atau pilih preset. Kode CSS dihasilkan secara otomatis untuk disalin." },
        { question: "Bagaimana cara menambahkan beberapa lapisan bayangan?", answer: "Klik \"Tambah bayangan lain\" untuk membuat lapisan independen. Setiap lapisan bisa memiliki warna, opasitas, dan posisi sendiri." },
        { question: "Apakah pembuat bayangan CSS gratis?", answer: "Ya. Semua alat GainUtility gratis, berjalan di browser Anda, dan tidak memerlukan akun." },
      ],
    },
    "es-mx": {
      title: "Generador de Sombras CSS – Crear Sombra CSS Online Gratis",
      metaDescription: "Genera sombras CSS con múltiples capas, ajusta posición, opacidad y radio, y copia el código listo. Gratis y sin cuenta.",
      h1: "Generador de Sombras CSS",
      primaryKeyword: "generador de sombras css",
      secondaryKeywords: ["sombra css", "box shadow css", "crear sombra css", "generador de sombra css"],
      questions: [
        "¿Cómo crear una sombra CSS?",
        "¿Cómo añadir varias capas de sombra?",
        "¿El generador de sombras CSS es gratis?",
      ],
      faqs: [
        { question: "¿Cómo creo una sombra CSS?", answer: "Ajusta los controles de posición, opacidad y radio, o elige un preset. El código CSS se genera automáticamente para copiar." },
        { question: "¿Cómo añado varias capas de sombra?", answer: "Haz clic en \"Añadir otra sombra\" para crear capas independientes. Cada una puede tener su propio color, opacidad y posición." },
        { question: "¿El generador de sombras CSS es gratis?", answer: "Sí. Todas las herramientas de GainUtility son gratuitas, funcionan en tu navegador y no requieren cuenta." },
      ],
    },
    "es-co": {
      title: "Generador de Sombras CSS – Crear Sombra CSS Online Gratis",
      metaDescription: "Genera sombras CSS con varias capas, ajusta posición, opacidad y radio, y copia el código resultante. Gratis, rápido y privado.",
      h1: "Generador de Sombras CSS",
      primaryKeyword: "generador de sombras css",
      secondaryKeywords: ["sombra css", "box shadow css", "crear sombra css", "generador de sombra css"],
      questions: [
        "¿Cómo crear una sombra CSS?",
        "¿Cómo agregar varias capas de sombra?",
        "¿El generador de sombras CSS es gratis?",
      ],
      faqs: [
        { question: "¿Cómo creo una sombra CSS?", answer: "Ajusta los controles de posición, opacidad y radio, o selecciona un preset. El código CSS se genera automáticamente." },
        { question: "¿Cómo agrego varias capas de sombra?", answer: "Haz clic en \"Agregar otra sombra\" para crear capas independientes. Cada una puede tener su propio color, opacidad y posición." },
        { question: "¿El generador de sombras CSS es gratis?", answer: "Sí. Todas las herramientas de GainUtility son gratuitas, funcionan en tu navegador y no requieren cuenta." },
      ],
    },
    de: {
      title: "CSS Box-Shadow Generator – CSS Schatten Online Erstellen & Kopieren",
      metaDescription: "Erstellen Sie CSS-Schatten mit mehreren Ebenen, passen Sie Position, Weichzeichner und Deckkraft an, und kopieren Sie fertigen CSS-Code. Kostenlos und direkt im Browser.",
      h1: "CSS Box-Shadow Generator",
      primaryKeyword: "css box shadow generator",
      secondaryKeywords: ["css schatten generator", "box shadow css", "css box schatten", "css schatten erstellen"],
      questions: [
        "Wie erstelle ich einen CSS-Schatten?",
        "Wie füge ich mehrere Schatten-Ebenen hinzu?",
        "Ist der CSS-Schatten-Generator kostenlos?",
      ],
      faqs: [
        { question: "Wie erstelle ich einen CSS-Schatten?", answer: "Passen Sie die Regler für Versatz, Unschärfe und Deckkraft an oder wählen Sie ein Preset. Der fertige CSS-Code wird automatisch generiert und kann direkt kopiert werden." },
        { question: "Wie füge ich mehrere Schatten-Ebenen hinzu?", answer: "Klicken Sie auf \"Weitere Schattenebene hinzufügen\", um unabhängige Ebenen mit individueller Farbe, Transparenz und Position zu erstellen." },
        { question: "Ist der CSS Box-Shadow Generator kostenlos?", answer: "Ja. Alle Tools auf GainUtility sind komplett kostenlos, laufen lokal in Ihrem Browser und erfordern keine Registrierung." },
      ],
    },
    fr: {
      title: "Générateur d'ombre CSS – Créer une Ombre CSS en Ligne Gratuit",
      metaDescription: "Créez des ombres CSS à plusieurs couches, ajustez la position, l'opacité et le rayon, puis copiez le code prêt à l'emploi.",
      h1: "Générateur d'ombre CSS",
      primaryKeyword: "générateur d'ombre css",
      secondaryKeywords: ["ombre css", "box shadow css", "ombre portée css", "créer ombre css"],
      questions: [
        "Comment créer une ombre CSS ?",
        "Comment ajouter plusieurs couches d'ombre ?",
        "Le générateur d'ombre CSS est-il gratuit ?",
      ],
      faqs: [
        { question: "Comment crée-t-on une ombre CSS ?", answer: "Ajustez les contrôles de position, d'opacité et de rayon, ou choisissez un préréglage. Le code CSS est généré automatiquement." },
        { question: "Comment ajoute-t-on plusieurs couches d'ombre ?", answer: "Cliquez sur « Ajouter une autre ombre » pour créer des couches indépendantes. Chacune peut avoir sa propre couleur, opacité et position." },
        { question: "Le générateur d'ombre CSS est-il gratuit ?", answer: "Oui. Tous les outils GainUtility sont gratuits, tournent dans votre navigateur et ne nécessitent pas de compte." },
      ],
    },
    it: {
      title: "Generatore di Ombre CSS – Crea Ombre CSS Online Gratis",
      metaDescription: "Crea ombre CSS con più livelli, regola posizione, opacità e raggio, e copia il codice pronto all'uso. Gratis e senza account.",
      h1: "Generatore di Ombre CSS",
      primaryKeyword: "generatore di ombre css",
      secondaryKeywords: ["ombra css", "box shadow css", "creare ombre css", "generatore ombre css"],
      questions: [
        "Come si crea un'ombra CSS?",
        "Come si aggiungono più livelli di ombra?",
        "Il generatore di ombre CSS è gratuito?",
      ],
      faqs: [
        { question: "Come creo un'ombra CSS?", answer: "Regola i controlli di posizione, opacità e raggio, oppure scegli un preset. Il codice CSS viene generato automaticamente." },
        { question: "Come aggiungo più livelli di ombra?", answer: "Clicca su \"Aggiungi un'altra ombra\" per creare livelli indipendenti. Ognuno può avere il proprio colore, opacità e posizione." },
        { question: "Il generatore di ombre CSS è gratuito?", answer: "Sì. Tutti gli strumenti GainUtility sono gratuiti, funzionano nel tuo browser e non richiedono account." },
      ],
    },
  },
  "youtube-keyword-explorer": {
    "pt-br": {
      title: "Explorador de Palavras-Chave do YouTube – Frases Reais de Busca | GainUtility",
      metaDescription: "Descubra as frases que os espectadores realmente digitam na busca do YouTube com sugestões ao vivo do autocomplete. Filtre, selecione e copie para títulos, descrições e tags. Sem volumes inventados.",
      h1: "Explorador de Palavras-Chave do YouTube",
      primaryKeyword: "explorador de palavras-chave do youtube",
      secondaryKeywords: ["palavras-chave youtube", "pesquisar palavras-chave youtube", "sugestões de busca youtube", "explorador de palavras chave"],
      questions: [
        "Como encontrar palavras-chave para vídeos no YouTube?",
        "O explorador de palavras-chave usa dados reais?",
        "As palavras-chave do YouTube são gratuitas aqui?",
      ],
      faqs: [
        { question: "Como encontrar palavras-chave para vídeos no YouTube?", answer: "Digite um termo inicial e a ferramenta consulta o autocomplete do YouTube ao vivo no mercado selecionado. Você filtra, seleciona e copia as sugestões para título, descrição e tags." },
        { question: "Essas palavras-chave são estimadas?", answer: "Não. Cada busca retorna as sugestões reais que o YouTube autocompleta para o termo e mercado escolhidos. Não há volume de busca, dificuldade ou ranking estimados." },
        { question: "O explorador de palavras-chave é gratuito?", answer: "Sim. Todas as ferramentas do GainUtility são gratuitas e não exigem conta. Nada do que você pesquisa é armazenado." },
      ],
    },
    id: {
      title: "Penjelajah Kata Kunci YouTube – Frasa Pencarian Nyata | GainUtility",
      metaDescription: "Temukan frasa yang benar-benar diketik penonton di pencarian YouTube dengan saran autocomplete langsung. Filter, pilih, dan salin untuk judul, deskripsi, dan tag. Tanpa volume palsu.",
      h1: "Penjelajah Kata Kunci YouTube",
      primaryKeyword: "penjelajah kata kunci youtube",
      secondaryKeywords: ["kata kunci youtube", "riset kata kunci youtube", "saran pencarian youtube", "kata kunci video youtube"],
      questions: [
        "Cara menemukan kata kunci untuk video YouTube?",
        "Apakah penjelajah kata kunci ini memakai data asli?",
        "Apakah alat kata kunci YouTube ini gratis?",
      ],
      faqs: [
        { question: "Bagaimana cara menemukan kata kunci untuk video YouTube?", answer: "Ketik kata kunci awal dan alat ini meminta autocomplete YouTube langsung di pasar yang dipilih. Anda memfilter, memilih, dan menyalin saran untuk judul, deskripsi, dan tag." },
        { question: "Apakah kata kuncinya diperkirakan?", answer: "Tidak. Setiap pencarian mengembalikan saran nyata yang di-autocomplete YouTube untuk kata kunci dan pasar yang dipilih. Tidak ada estimasi volume, kesulitan, atau peringkat." },
        { question: "Apakah alat ini gratis?", answer: "Ya. Semua alat GainUtility gratis dan tanpa akun. Pencarian Anda tidak disimpan." },
      ],
    },
    "es-mx": {
      title: "Explorador de Palabras Clave de YouTube – Frases Reales de Búsqueda | GainUtility",
      metaDescription: "Descubre las frases que la gente escribe realmente en la búsqueda de YouTube con sugerencias en vivo del autocompletado. Filtra, selecciona y copia para títulos, descripciones y etiquetas. Sin volúmenes inventados.",
      h1: "Explorador de Palabras Clave de YouTube",
      primaryKeyword: "explorador de palabras clave youtube",
      secondaryKeywords: ["palabras clave youtube", "investigar palabras clave youtube", "sugerencias de búsqueda youtube", "herramienta de palabras clave youtube"],
      questions: [
        "¿Cómo encontrar palabras clave para videos de YouTube?",
        "¿El explorador de palabras clave usa datos reales?",
        "¿Es gratis el explorador de palabras clave de YouTube?",
      ],
      faqs: [
        { question: "¿Cómo encuentro palabras clave para mis videos?", answer: "Escribe un término inicial y el explorador consulta el autocompletado de YouTube en vivo en el mercado que elijas. Filtra, selecciona y copia las sugerencias para el título, la descripción y las etiquetas." },
        { question: "¿Son estimadas estas palabras clave?", answer: "No. Cada búsqueda devuelve las sugerencias reales que YouTube autocompleta para ese término y mercado. No se estiman volúmenes, dificultad ni posicionamiento." },
        { question: "¿Es gratuito el explorador de palabras clave?", answer: "Sí. Todas las herramientas de GainUtility son gratuitas y no requieren cuenta. Nada de lo que buscas se almacena." },
      ],
    },
    "es-co": {
      title: "Explorador de Palabras Clave de YouTube – Frases Reales de Búsqueda | GainUtility",
      metaDescription: "Descubre las frases que la gente escribe de verdad en la búsqueda de YouTube con sugerencias en vivo del autocompletado. Filtra, selecciona y copia para títulos, descripciones y etiquetas. Sin datos inventados.",
      h1: "Explorador de Palabras Clave de YouTube",
      primaryKeyword: "explorador de palabras clave youtube",
      secondaryKeywords: ["palabras clave youtube", "investigar palabras clave youtube", "sugerencias de búsqueda youtube", "encontrar palabras clave youtube"],
      questions: [
        "¿Cómo encontrar palabras clave para videos de YouTube?",
        "¿El explorador utiliza datos reales de YouTube?",
        "¿Cuánto cuesta usar el explorador de palabras clave?",
      ],
      faqs: [
        { question: "¿Cómo encuentro palabras clave para mis videos?", answer: "Escribe un término inicial y el explorador consulta el autocompletado de YouTube en vivo para el mercado que elijas. Filtra, selecciona y copia las sugerencias a tu título, descripción y etiquetas." },
        { question: "¿Estos datos son reales?", answer: "Sí. Son las sugerencias que YouTube autocompleta para ese término y mercado en el momento de la búsqueda. No se inventan volúmenes de búsqueda ni dificultad de posicionamiento." },
        { question: "¿El explorador de palabras clave es gratis?", answer: "Sí. Todas las herramientas de GainUtility son gratuitas, sin cuenta, y no se guardan tus búsquedas." },
      ],
    },
    fr: {
      title: "Explorateur de mots-clés YouTube – Phrases de recherche réelles | GainUtility",
      metaDescription: "Découvrez les phrases que les spectateurs saisissent réellement dans la recherche YouTube grâce à l'autocomplétion en direct. Filtrez, sélectionnez et copiez pour titres, descriptions et balises. Sans volumes inventés.",
      h1: "Explorateur de mots-clés YouTube",
      primaryKeyword: "explorateur de mots clés youtube",
      secondaryKeywords: ["mots clés youtube", "recherche de mots clés youtube", "suggestions de recherche youtube", "idées de mots clés youtube"],
      questions: [
        "Comment trouver des mots-clés pour mes vidéos YouTube ?",
        "L'explorateur de mots-clés utilise-t-il des données réelles ?",
        "L'explorateur de mots-clés YouTube est-il gratuit ?",
      ],
      faqs: [
        { question: "Comment trouver des mots-clés pour mes vidéos ?", answer: "Saisissez un terme de départ et l'outil interroge l'autocomplétion YouTube en direct pour le marché choisi. Filtrez, sélectionnez et copiez les suggestions vers le titre, la description et les balises." },
        { question: "Ces mots-clés sont-ils estimés ?", answer: "Non. Chaque recherche renvoie les suggestions réelles d'autocomplétion YouTube pour ce terme et ce marché. Aucun volume, difficulté ou classement n'est estimé." },
        { question: "Cet outil est-il gratuit ?", answer: "Oui. Tous les outils GainUtility sont gratuits et sans compte. Rien de ce que vous recherchez n'est stocké." },
      ],
    },
    de: {
      title: "YouTube Keyword Explorer – Echte Suchbegriffe Finden | GainUtility",
      metaDescription: "Finden Sie heraus, was Zuschauer auf YouTube wirklich suchen – mit Live-Autocomplete-Vorschlägen. Filtern, auswählen und für Titel, Beschreibungen und Tags kopieren.",
      h1: "YouTube Keyword Explorer",
      primaryKeyword: "youtube keyword explorer",
      secondaryKeywords: ["youtube keywords finden", "youtube tags generator", "youtube suchbegriffe recherchieren", "youtube seo tool"],
      questions: [
        "Wie finde ich Keywords für YouTube-Videos?",
        "Nutzt der YouTube Keyword Explorer echte Daten?",
        "Ist der YouTube Keyword Explorer kostenlos?",
      ],
      faqs: [
        { question: "Wie finde ich passende Keywords für meine YouTube-Videos?", answer: "Geben Sie einen Ausgangsbegriff ein. Das Tool ruft in Echtzeit die Autocomplete-Vorschläge von YouTube für die gewählte Region ab. Sie können die Ergebnisse filtern, markieren und direkt in Titel, Beschreibung oder Tags übernehmen." },
        { question: "Sind diese Keyword-Daten geschätzt oder echt?", answer: "Es handelt sich um die echten Suchvorschläge, die YouTube seinen Nutzern live anzeigt. Es werden keine künstlichen Suchvolumen oder Fantasiewerte erfunden." },
        { question: "Ist dieses Tool kostenlos?", answer: "Ja. Alle Tools auf GainUtility sind komplett kostenlos, erfordern keine Registrierung und speichern keine Ihrer Suchanfragen." },
      ],
    },
    it: {
      title: "Esploratore di parole chiave YouTube – Frasi di ricerca reali | GainUtility",
      metaDescription: "Scopri le frasi che gli spettatori digitano realmente nella ricerca di YouTube con i suggerimenti live del completamento automatico. Filtra, seleziona e copia per titoli, descrizioni e tag. Nessun volume inventato.",
      h1: "Esploratore di parole chiave YouTube",
      primaryKeyword: "esploratore di parole chiave youtube",
      secondaryKeywords: ["parole chiave youtube", "ricerca parole chiave youtube", "suggerimenti di ricerca youtube", "strumento parole chiave youtube"],
      questions: [
        "Come trovare parole chiave per i video su YouTube?",
        "L'esploratore di parole chiave usa dati reali?",
        "L'esploratore di parole chiave YouTube è gratuito?",
      ],
      faqs: [
        { question: "Come trovo parole chiave per i miei video?", answer: "Digita un termine iniziale e lo strumento interroga il completamento automatico di YouTube in diretta per il mercato selezionato. Filtra, seleziona e copia i suggerimenti in titolo, descrizione e tag." },
        { question: "Queste parole chiave sono stimate?", answer: "No. Ogni ricerca restituisce i suggerimenti reali di autocompletamento YouTube per quel termine e mercato. Non vengono stimati volume, difficoltà o posizionamento." },
        { question: "Questo strumento è gratuito?", answer: "Sì. Tutti gli strumenti GainUtility sono gratuiti e senza account. Le tue ricerche non vengono salvate." },
      ],
    },
  },
};

/* ------------------------------------------------------------------ */
/* Locale-aware headline / description templates for the long tail     */
/* ------------------------------------------------------------------ */

interface LocaleTemplates {
  convertTitle: (name: string, a: string, b: string) => string;
  convertH1: (a: string, b: string) => string;
  compressTitle: (name: string) => string;
  mergeTitle: (name: string) => string;
  splitTitle: (name: string) => string;
  generateTitle: (name: string) => string;
  editTitle: (name: string) => string;
  analyzeTitle: (name: string) => string;
  extractTitle: (name: string) => string;
  protectTitle: (name: string) => string;
  encodeTitle: (name: string) => string;
  visualizeTitle: (name: string) => string;
  generalTitle: (name: string) => string;
  desc: (name: string, title: string) => string;
  question1: (name: string) => string;
  answer1: () => string;
  question2: (name: string) => string;
  answer2: () => string;
  question3: () => string;
  answer3: () => string;
}

const TPL: Record<LocaleCode, LocaleTemplates> = {
  en: {
    convertTitle: (n) => `${n} – Free Online Converter`,
    convertH1: (a, b) => `Convert ${a} to ${b}`,
    compressTitle: (n) => `${n} – Free Online Compressor`,
    mergeTitle: (n) => `${n} – Free Online Tool`,
    splitTitle: (n) => `${n} – Free Online Tool`,
    generateTitle: (n) => `${n} – Free Online Generator`,
    editTitle: (n) => `${n} – Free Online Tool`,
    analyzeTitle: (n) => `${n} – Free Online Tool`,
    extractTitle: (n) => `${n} – Free Online Tool`,
    protectTitle: (n) => `${n} – Free Online Tool`,
    encodeTitle: (n) => `${n} – Free Online Tool`,
    visualizeTitle: (n) => `${n} – Free Online Tool`,
    generalTitle: (n) => `${n} – Free Online Tool`,
    desc: (n, t) => `Use the free ${n} tool right in your browser. Quick, private, and no account needed to ${t.toLowerCase().split(" – ")[0].toLowerCase()}.`,
    question1: (n) => `How do I use ${n}?`,
    answer1: () => `Open the tool, add your file or input, choose your settings, and the result is generated locally in your browser.`,
    question2: (n) => `Is ${n} free?`,
    answer2: () => `Yes. This and every GainUtility tool is free to use with no account required.`,
    question3: () => `Is my data kept private?`,
    answer3: () => `Yes. The tool runs entirely in your browser and does not upload your files to a server.`,
  },
  "pt-br": {
    convertTitle: (n) => `${n} – Conversor Online Grátis`,
    convertH1: (a, b) => `Converter ${a} para ${b}`,
    compressTitle: (n) => `${n} Online Grátis`,
    mergeTitle: (n) => `${n} Online Grátis`,
    splitTitle: (n) => `${n} Online Grátis`,
    generateTitle: (n) => `${n} Online Grátis`,
    editTitle: (n) => `${n} Online Grátis`,
    analyzeTitle: (n) => `${n} Online Grátis`,
    extractTitle: (n) => `${n} Online Grátis`,
    protectTitle: (n) => `${n} Online Grátis`,
    encodeTitle: (n) => `${n} Online Grátis`,
    visualizeTitle: (n) => `${n} Online Grátis`,
    generalTitle: (n) => `${n} Online Grátis`,
    desc: (n, t) => `Use a ferramenta gratuita ${n} direto no seu navegador. Rápida, privada e sem precisar de conta.`,
    question1: (n) => `Como usar ${n}?`,
    answer1: () => `Abra a ferramenta, adicione seu arquivo ou texto, escolha as opções e o resultado é gerado localmente no seu navegador.`,
    question2: (n) => `${n} é grátis?`,
    answer2: () => `Sim. Esta e todas as ferramentas GainUtility são gratuitas e não exigem conta.`,
    question3: () => `Meus dados ficam privados?`,
    answer3: () => `Sim. A ferramenta roda inteiramente no seu navegador e não envia seus arquivos a um servidor.`,
  },
  id: {
    convertTitle: (n) => `${n} – Konverter Online Gratis`,
    convertH1: (a, b) => `Ubah ${a} ke ${b}`,
    compressTitle: (n) => `${n} Online Gratis`,
    mergeTitle: (n) => `${n} Online Gratis`,
    splitTitle: (n) => `${n} Online Gratis`,
    generateTitle: (n) => `${n} Online Gratis`,
    editTitle: (n) => `${n} Online Gratis`,
    analyzeTitle: (n) => `${n} Online Gratis`,
    extractTitle: (n) => `${n} Online Gratis`,
    protectTitle: (n) => `${n} Online Gratis`,
    encodeTitle: (n) => `${n} Online Gratis`,
    visualizeTitle: (n) => `${n} Online Gratis`,
    generalTitle: (n) => `${n} Online Gratis`,
    desc: (n, t) => `Gunakan alat gratis ${n} langsung di browser Anda. Cepat, privat, dan tanpa perlu akun.`,
    question1: (n) => `Bagaimana cara menggunakan ${n}?`,
    answer1: () => `Buka alat, tambahkan file atau teks Anda, pilih pengaturan, dan hasilnya dibuat langsung di browser Anda.`,
    question2: (n) => `Apakah ${n} gratis?`,
    answer2: () => `Ya. Alat ini dan semua alat GainUtility gratis tanpa perlu akun.`,
    question3: () => `Apakah data saya aman?`,
    answer3: () => `Ya. Alat berjalan sepenuhnya di browser Anda dan tidak mengunggah file ke server.`,
  },
  "es-mx": {
    convertTitle: (n) => `${n} – Convertidor Online Gratis`,
    convertH1: (a, b) => `Convertir ${a} a ${b}`,
    compressTitle: (n) => `${n} Online Gratis`,
    mergeTitle: (n) => `${n} Online Gratis`,
    splitTitle: (n) => `${n} Online Gratis`,
    generateTitle: (n) => `${n} Online Gratis`,
    editTitle: (n) => `${n} Online Gratis`,
    analyzeTitle: (n) => `${n} Online Gratis`,
    extractTitle: (n) => `${n} Online Gratis`,
    protectTitle: (n) => `${n} Online Gratis`,
    encodeTitle: (n) => `${n} Online Gratis`,
    visualizeTitle: (n) => `${n} Online Gratis`,
    generalTitle: (n) => `${n} Online Gratis`,
    desc: (n, t) => `Usa la herramienta gratuita ${n} directamente en tu navegador. Rápida, privada y sin necesidad de cuenta.`,
    question1: (n) => `¿Cómo uso ${n}?`,
    answer1: () => `Abre la herramienta, agrega tu archivo o texto, elige las opciones y el resultado se genera en tu navegador.`,
    question2: (n) => `¿Es gratis ${n}?`,
    answer2: () => `Sí. Esta y todas las herramientas de GainUtility son gratuitas y no requieren cuenta.`,
    question3: () => `¿Mis datos son privados?`,
    answer3: () => `Sí. La herramienta funciona por completo en tu navegador y no sube tus archivos a un servidor.`,
  },
  "es-co": {
    convertTitle: (n) => `${n} – Convertidor Online Gratis`,
    convertH1: (a, b) => `Convertir ${a} a ${b}`,
    compressTitle: (n) => `${n} Online Gratis`,
    mergeTitle: (n) => `${n} Online Gratis`,
    splitTitle: (n) => `${n} Online Gratis`,
    generateTitle: (n) => `${n} Online Gratis`,
    editTitle: (n) => `${n} Online Gratis`,
    analyzeTitle: (n) => `${n} Online Gratis`,
    extractTitle: (n) => `${n} Online Gratis`,
    protectTitle: (n) => `${n} Online Gratis`,
    encodeTitle: (n) => `${n} Online Gratis`,
    visualizeTitle: (n) => `${n} Online Gratis`,
    generalTitle: (n) => `${n} Online Gratis`,
    desc: (n, t) => `Usa la herramienta gratuita ${n} directamente en tu navegador. Rápida, privada y sin cuenta.`,
    question1: (n) => `¿Cómo uso ${n}?`,
    answer1: () => `Abre la herramienta, agrega tu archivo o texto, elige las opciones y el resultado se genera en tu navegador.`,
    question2: (n) => `¿Es gratis ${n}?`,
    answer2: () => `Sí. Esta y todas las herramientas de GainUtility son gratuitas y no requieren cuenta.`,
    question3: () => `¿Mis datos son privados?`,
    answer3: () => `Sí. La herramienta se ejecuta en tu navegador y no envía tus archivos a un servidor.`,
  },
  de: {
    convertTitle: (n) => `${n} – Kostenloser Online-Konverter`,
    convertH1: (a, b) => `${a} in ${b} umwandeln`,
    compressTitle: (n) => `${n} – Kostenlos Online`,
    mergeTitle: (n) => `${n} – Kostenlos Online`,
    splitTitle: (n) => `${n} – Kostenlos Online`,
    generateTitle: (n) => `${n} – Kostenlos Online`,
    editTitle: (n) => `${n} – Kostenlos Online`,
    analyzeTitle: (n) => `${n} – Kostenlos Online`,
    extractTitle: (n) => `${n} – Kostenlos Online`,
    protectTitle: (n) => `${n} – Kostenlos Online`,
    encodeTitle: (n) => `${n} – Kostenlos Online`,
    visualizeTitle: (n) => `${n} – Kostenlos Online`,
    generalTitle: (n) => `${n} – Kostenlos Online`,
    desc: (n, t) => `Nutzen Sie das kostenlose Tool ${n} direkt im Browser. Schnell, privat und ohne Konto.`,
    question1: (n) => `Wie verwende ich ${n}?`,
    answer1: () => `Öffnen Sie das Tool, fügen Sie Ihre Datei oder Eingabe hinzu, wählen Sie die Optionen – das Ergebnis wird lokal im Browser erstellt.`,
    question2: (n) => `Ist ${n} kostenlos?`,
    answer2: () => `Ja. Dieses und alle GainUtility-Tools sind kostenlos und erfordern kein Konto.`,
    question3: () => `Sind meine Daten privat?`,
    answer3: () => `Ja. Das Tool läuft vollständig in Ihrem Browser und lädt Ihre Dateien nicht auf einen Server.`,
  },
  fr: {
    convertTitle: (n) => `${n} – Convertisseur en ligne gratuit`,
    convertH1: (a, b) => `Convertir ${a} en ${b}`,
    compressTitle: (n) => `${n} – en ligne gratuit`,
    mergeTitle: (n) => `${n} – en ligne gratuit`,
    splitTitle: (n) => `${n} – en ligne gratuit`,
    generateTitle: (n) => `${n} – en ligne gratuit`,
    editTitle: (n) => `${n} – en ligne gratuit`,
    analyzeTitle: (n) => `${n} – en ligne gratuit`,
    extractTitle: (n) => `${n} – en ligne gratuit`,
    protectTitle: (n) => `${n} – en ligne gratuit`,
    encodeTitle: (n) => `${n} – en ligne gratuit`,
    visualizeTitle: (n) => `${n} – en ligne gratuit`,
    generalTitle: (n) => `${n} – en ligne gratuit`,
    desc: (n, t) => `Utilisez l'outil gratuit ${n} directement dans votre navigateur. Rapide, privé et sans compte.`,
    question1: (n) => `Comment utiliser ${n} ?`,
    answer1: () => `Ouvrez l'outil, ajoutez votre fichier ou texte, choisissez les options et le résultat est généré localement dans votre navigateur.`,
    question2: (n) => `Est-ce que ${n} est gratuit ?`,
    answer2: () => `Oui. Cet outil et tous les outils GainUtility sont gratuits et sans compte.`,
    question3: () => `Mes données sont-elles privées ?`,
    answer3: () => `Oui. L'outil fonctionne entièrement dans votre navigateur et n'envoie pas vos fichiers à un serveur.`,
  },
  it: {
    convertTitle: (n) => `${n} – Convertitore Online Gratis`,
    convertH1: (a, b) => `Convertire ${a} in ${b}`,
    compressTitle: (n) => `${n} Online Gratis`,
    mergeTitle: (n) => `${n} Online Gratis`,
    splitTitle: (n) => `${n} Online Gratis`,
    generateTitle: (n) => `${n} Online Gratis`,
    editTitle: (n) => `${n} Online Gratis`,
    analyzeTitle: (n) => `${n} Online Gratis`,
    extractTitle: (n) => `${n} Online Gratis`,
    protectTitle: (n) => `${n} Online Gratis`,
    encodeTitle: (n) => `${n} Online Gratis`,
    visualizeTitle: (n) => `${n} Online Gratis`,
    generalTitle: (n) => `${n} Online Gratis`,
    desc: (n, t) => `Usa lo strumento gratuito ${n} direttamente nel tuo browser. Veloce, privato e senza account.`,
    question1: (n) => `Come si usa ${n}?`,
    answer1: () => `Apri lo strumento, aggiungi il tuo file o testo, scegli le opzioni e il risultato viene generato localmente nel browser.`,
    question2: (n) => `${n} è gratuito?`,
    answer2: () => `Sì. Questo e tutti gli strumenti GainUtility sono gratuiti e senza account.`,
    question3: () => `I miei dati sono privati?`,
    answer3: () => `Sì. Lo strumento funziona interamente nel tuo browser e non carica i tuoi file su un server.`,
  },
};

/**
 * Build a complete localized SEO record for a tool + locale. Prefers the
 * hand-written record; otherwise generates one from locale-aware templates.
 * Never falls back to English-only text for a non-English locale.
 */
export const getLocalizedSeo = (toolId: ToolId, locale: string, englishName: string): LocalizedSeoRecord => {
  const key = (locale || DEFAULT_LOCALE) as LocaleCode;
  const hand = PRIORITY_SEO[toolId]?.[key];
  const slug = localizedToolSlug(toolId, locale, toolId);
  const name = localizedToolName(toolId, locale, englishName);

  if (hand) {
    return { locale, slug, ...hand };
  }

  const tpl = TPL[key];
  const action = TOOL_ACTION[toolId];
  const a = action?.a ?? "";
  const b = action?.b ?? "";
  const actionType = action?.action ?? "general";

  let title: string;
  let h1 = name;
  let primary: string;
  let secondary: string[] = [name.toLowerCase()];

  switch (actionType) {
    case "convert":
      title = tpl.convertTitle(name, a, b);
      h1 = tpl.convertH1(a, b);
      primary = name.toLowerCase();
      secondary = [
        `convert ${a} ${b}`.toLowerCase(),
        name.toLowerCase(),
      ];
      break;
    case "compress":
      title = tpl.compressTitle(name);
      primary = name.toLowerCase();
      break;
    case "merge":
      title = tpl.mergeTitle(name);
      primary = name.toLowerCase();
      break;
    case "split":
      title = tpl.splitTitle(name);
      primary = name.toLowerCase();
      break;
    case "generate":
      title = tpl.generateTitle(name);
      primary = name.toLowerCase();
      break;
    default:
      title = tpl.generalTitle(name);
      primary = name.toLowerCase();
  }

  const metaDescription = tpl.desc(name, title).slice(0, 158);
  const faqs = [
    { question: tpl.question1(name), answer: tpl.answer1() },
    { question: tpl.question2(name), answer: tpl.answer2() },
    { question: tpl.question3(), answer: tpl.answer3() },
  ];

  return {
    locale,
    slug,
    title,
    metaDescription,
    h1,
    primaryKeyword: primary,
    secondaryKeywords: secondary,
    questions: faqs.map((f) => f.question),
    faqs,
  };
};
