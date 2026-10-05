/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlay for image-converter (6 locales, 5 FAQs —
 * the 2 base FAQs from src/data.ts plus the 3 EXTRA FAQs from
 * src/seo/extraFaqs.ts, in that order). Source: src/data.ts "image-converter".
 */

import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";

export const overlay: Partial<Record<LocaleCode, ToolBodyOverlay>> = {
  "pt-br": {
    desc: "Converta imagens entre os formatos JPG, PNG, WEBP, BMP e TIFF.",
    whatText:
      "Converta imagens em lote entre JPG, PNG, WEBP, AVIF, BMP e TIFF. Escolha um formato de destino e um nível de qualidade, converta todos os arquivos selecionados de uma vez e baixe-os individualmente ou em um ZIP.",
    whyText:
      "Formatos legados como TIFF e BMP entregam masters com qualidade de câmera, mas produzem arquivos pesados demais para a web. Convertê-los para formatos amigáveis ao navegador, como WebP ou JPEG, reduz o peso da mesma imagem.",
    features: [
      "Compatível com JPG, PNG, WEBP, AVIF, BMP e TIFF",
      "Fila de conversão em lote",
      "Fator de renderização de qualidade personalizado",
      "Preservação da transparência sem perdas",
    ],
    steps: [
      "Selecione o formato de saída de destino.",
      "Arraste e solte suas imagens legadas.",
      "Processe e clique em Baixar tudo em ZIP.",
    ],
    examples: [
      {
        title: "Compilação de TIFF para WebP",
        desc: "Reduza o peso de TIFFs de impressão para designs responsivos.",
        code: "File Size: 45MB TIFF -> 1.2MB WebP",
      },
    ],
    mistakes: [
      "Converter PNGs que dependem de transparência para JPEG, o que resulta em fundos pretos sólidos.",
    ],
    privacyExplanation:
      "Toda a conversão é realizada inteiramente no seu navegador com a Canvas API. Suas imagens são decodificadas e recodificadas no seu dispositivo e nunca são enviadas a nenhum servidor.",
    faqs: [
      {
        question: "Posso converter imagens para WebP ou AVIF?",
        answer:
          "Sim! A ferramenta suporta formatos modernos de alta compressão, como WebP e AVIF, para acelerar o carregamento de páginas.",
      },
      {
        question: "Como funciona a conversão em lote?",
        answer:
          "Envie qualquer combinação de tipos de arquivo, escolha um formato de destino e um nível de qualidade unificados e converta tudo em um clique.",
      },
      {
        question: "Quais formatos posso converter?",
        answer:
          "JPEG, PNG, WebP e formatos relacionados suportados pelo navegador por meio das variantes do conversor: as ferramentas dedicadas de WebP, PNG/JPG, HEIC e SVG compartilham este mesmo motor.",
      },
      {
        question: "Como funciona a conversão em lote?",
        answer:
          "Enfileire vários arquivos, escolha um único formato de saída e converta tudo em uma única passagem — cada arquivo é baixado separadamente com sua nova extensão.",
      },
      {
        question: "Converter PNG para JPG perde a transparência?",
        answer:
          "Sim — o JPEG não tem canal alfa, então as áreas transparentes são achatadas sobre a cor de fundo que você configura antes da exportação.",
      },
    ],
  },
  id: {
    desc: "Konversi gambar antar format JPG, PNG, WEBP, BMP, dan TIFF.",
    whatText:
      "Konversi gambar secara bermassa antara JPG, PNG, WEBP, AVIF, BMP, dan TIFF. Pilih format tujuan dan tingkat kualitas, konversi semua file terpilih sekaligus, lalu unduh satu per satu atau sebagai ZIP.",
    whyText:
      "Format lama seperti TIFF dan BMP memberi Anda master berkualitas kamera, tetapi menghasilkan file yang terlalu berat untuk web. Mengonversinya ke format yang ramah browser seperti WebP atau JPEG mengecilkan ukuran untuk gambar yang sama.",
    features: [
      "Mendukung JPG, PNG, WEBP, AVIF, BMP, TIFF",
      "Antrean konversi bermassa",
      "Faktor render kualitas kustom",
      "Transparansi tetap utuh tanpa kompresi lossy",
    ],
    steps: [
      "Pilih format keluaran tujuan.",
      "Seret dan letakkan gambar lawas Anda.",
      "Proses, lalu klik Unduh semua sebagai ZIP.",
    ],
    examples: [
      {
        title: "Kompilasi TIFF ke WebP",
        desc: "Kurangi berat TIFF cetak untuk desain responsif.",
        code: "File Size: 45MB TIFF -> 1.2MB WebP",
      },
    ],
    mistakes: [
      "Mengonversi PNG yang bergantung pada transparansi ke JPEG, yang menghasilkan latar belakang hitam pekat.",
    ],
    privacyExplanation:
      "Setiap konversi dilakukan sepenuhnya di browser Anda dengan Canvas API. Gambar Anda didekode dan dikodekan ulang di perangkat Anda dan tidak pernah diunggah ke server mana pun.",
    faqs: [
      {
        question: "Bisakah saya mengonversi gambar ke WebP atau AVIF?",
        answer:
          "Ya! Alat ini mendukung format modern berkompresi tinggi seperti WebP dan AVIF untuk mempercepat pemuatan halaman.",
      },
      {
        question: "Bagaimana cara kerja konversi bermassa?",
        answer:
          "Unggah kombinasi tipe file apa pun, pilih satu format tujuan dan tingkat kualitas yang seragam, lalu konversi dalam satu klik.",
      },
      {
        question: "Format apa saja yang bisa saya konversi?",
        answer:
          "JPEG, PNG, WebP, dan format terkait yang didukung browser melalui varian konverter: alat khusus WebP, PNG/JPG, HEIC, dan SVG berbagi mesin ini.",
      },
      {
        question: "Bagaimana cara kerja konversi bermassa?",
        answer:
          "Antrekan beberapa file, pilih satu format keluaran, dan konversi dalam satu putaran — setiap file diunduh terpisah dengan ekstensi barunya.",
      },
      {
        question: "Apakah mengonversi PNG ke JPG menghilangkan transparansi?",
        answer:
          "Ya — JPEG tidak punya kanal alfa, sehingga area transparan diratakan ke warna latar yang Anda atur sebelum ekspor.",
      },
    ],
  },
  "es-mx": {
    desc: "Convierte imágenes entre los formatos JPG, PNG, WEBP, BMP y TIFF.",
    whatText:
      "Convierte imágenes en lote entre JPG, PNG, WEBP, AVIF, BMP y TIFF. Elige un formato de destino y un nivel de calidad, convierte todos los archivos seleccionados de una vez y descárgalos individualmente o en un ZIP.",
    whyText:
      "Los formatos heredados como TIFF y BMP te dan másters de calidad de cámara, pero producen archivos demasiado pesados para la web. Convertirlos a formatos compatibles con el navegador como WebP o JPEG reduce el peso de la misma imagen.",
    features: [
      "Compatible con JPG, PNG, WEBP, AVIF, BMP y TIFF",
      "Cola de conversión por lotes",
      "Factor de renderizado de calidad personalizado",
      "Preservación de la transparencia sin pérdidas",
    ],
    steps: [
      "Selecciona el formato de salida de destino.",
      "Arrastra y suelta tus imágenes heredadas.",
      "Procesa y haz clic en Descargar todo como ZIP.",
    ],
    examples: [
      {
        title: "Compilación de TIFF a WebP",
        desc: "Reduce el peso de los TIFF de impresión para diseños adaptables.",
        code: "File Size: 45MB TIFF -> 1.2MB WebP",
      },
    ],
    mistakes: [
      "Convertir PNG que dependen de la transparencia a JPEG, lo que produce fondos negros sólidos.",
    ],
    privacyExplanation:
      "Cada conversión se realiza por completo en tu navegador con la Canvas API. Tus imágenes se decodifican y recodifican en tu dispositivo y nunca se suben a ningún servidor.",
    faqs: [
      {
        question: "¿Puedo convertir imágenes a WebP o AVIF?",
        answer:
          "¡Sí! La herramienta admite formatos modernos de alta compresión como WebP y AVIF para acelerar la carga de páginas.",
      },
      {
        question: "¿Cómo funciona la conversión por lotes?",
        answer:
          "Sube cualquier combinación de tipos de archivo, elige un formato de destino y un nivel de calidad unificados y conviértelos con un solo clic.",
      },
      {
        question: "¿Qué formatos puedo convertir?",
        answer:
          "JPEG, PNG, WebP y formatos relacionados compatibles con el navegador mediante las variantes del conversor: las herramientas dedicadas a WebP, PNG/JPG, HEIC y SVG comparten este motor.",
      },
      {
        question: "¿Cómo funciona la conversión por lotes?",
        answer:
          "Encola varios archivos, elige un solo formato de salida y conviértelos en una sola pasada; cada archivo se descarga por separado con su nueva extensión.",
      },
      {
        question: "¿Al convertir PNG a JPG se pierde la transparencia?",
        answer:
          "Sí; el JPEG no tiene canal alfa, así que las zonas transparentes se aplanan sobre el color de fondo que configures antes de exportar.",
      },
    ],
  },
  de: {
    desc: "Konvertieren Sie Bilder zwischen den Formaten JPG, PNG, WEBP, BMP und TIFF.",
    whatText:
      "Konvertieren Sie Bilder stapelweise zwischen JPG, PNG, WEBP, AVIF, BMP und TIFF. Wählen Sie ein Ausgabeformat und eine Qualitätstufe, konvertieren Sie alle ausgewählten Dateien auf einmal und laden Sie sie einzeln oder als ZIP herunter.",
    whyText:
      "Ältere Formate wie TIFF und BMP liefern Master in Kameraqualität, erzeugen aber Dateien, die für das Web viel zu schwer sind. Die Konvertierung in browserfreundliche Formate wie WebP oder JPEG verkleinert die Datenmenge bei gleicher Abbildung.",
    features: [
      "Unterstützt JPG, PNG, WEBP, AVIF, BMP, TIFF",
      "Warteschlange für Stapelkonvertierung",
      "Anpassbarer Qualitäts-Wiedergabefaktor",
      "Sichere, verlustfreie Transparenz",
    ],
    steps: [
      "Wählen Sie das gewünschte Ausgabeformat.",
      "Ziehen Sie Ihre älteren Bilddateien hierher.",
      "Verarbeiten Sie die Dateien und klicken Sie auf „Alle als ZIP herunterladen“.",
    ],
    examples: [
      {
        title: "TIFF-zu-WebP-Konvertierung",
        desc: "Reduzieren Sie das Gewicht von Druck-TIFFs für responsives Design.",
        code: "File Size: 45MB TIFF -> 1.2MB WebP",
      },
    ],
    mistakes: [
      "Transparenzabhängige PNGs nach JPEG konvertieren, was zu vollflächig schwarzen Hintergründen führt.",
    ],
    privacyExplanation:
      "Jede Konvertierung erfolgt vollständig in Ihrem Browser mit der Canvas API. Ihre Bilder werden auf Ihrem Gerät de- und rekodiert und nie auf einen Server hochgeladen.",
    faqs: [
      {
        question: "Kann ich Bilder in WebP oder AVIF konvertieren?",
        answer:
          "Ja! Das Tool unterstützt moderne, hochkomprimierte Formate wie WebP und AVIF, um das Laden von Seiten zu beschleunigen.",
      },
      {
        question: "Wie funktioniert die Stapelkonvertierung?",
        answer:
          "Laden Sie beliebige Dateitypen hoch, wählen Sie ein einheitliches Ausgabeformat und eine Qualitätstufe und konvertieren Sie alles mit einem Klick.",
      },
      {
        question: "Welche Formate kann ich konvertieren?",
        answer:
          "JPEG, PNG, WebP und weitere browserunterstützte Formate über die Konverter-Varianten: die dedizierten WebP-, PNG/JPG-, HEIC- und SVG-Tools teilen diese Engine.",
      },
      {
        question: "Wie funktioniert die Stapelkonvertierung?",
        answer:
          "Stellen Sie mehrere Dateien in die Warteschlange, wählen Sie ein Ausgabeformat und konvertieren Sie alles in einem Durchgang — jede Datei wird einzeln mit ihrer neuen Endung heruntergeladen.",
      },
      {
        question: "Geht bei der Konvertierung von PNG in JPG die Transparenz verloren?",
        answer:
          "Ja — JPEG hat keinen Alphakanal, daher werden transparente Bereiche vor dem Export auf die von Ihnen eingestellte Hintergrundfarbe geglättet.",
      },
    ],
  },
  fr: {
    desc: "Convertissez des images entre les formats JPG, PNG, WEBP, BMP et TIFF.",
    whatText:
      "Convertissez des images par lots entre JPG, PNG, WEBP, AVIF, BMP et TIFF. Choisissez un format cible et un niveau de qualité, convertissez tous les fichiers sélectionnés en une seule fois, puis téléchargez-les individuellement ou dans un ZIP.",
    whyText:
      "Les formats hérités comme TIFF et BMP donnent des masters de qualité photo, mais produisent des fichiers beaucoup trop lourds pour le web. Les convertir vers des formats adaptés au navigateur comme WebP ou JPEG réduit le poids de la même image.",
    features: [
      "Prend en charge JPG, PNG, WEBP, AVIF, BMP, TIFF",
      "File d'attente de conversion par lots",
      "Facteur de rendu de qualité personnalisable",
      "Préservation de la transparence sans perte",
    ],
    steps: [
      "Sélectionnez le format de sortie souhaité.",
      "Glissez-déposez vos images héritées.",
      "Lancez le traitement puis cliquez sur « Tout télécharger en ZIP ».",
    ],
    examples: [
      {
        title: "Conversion de TIFF en WebP",
        desc: "Réduisez le poids des TIFF d'impression pour une conception responsive.",
        code: "File Size: 45MB TIFF -> 1.2MB WebP",
      },
    ],
    mistakes: [
      "Convertir en JPEG des PNG dépendants de la transparence, ce qui donne des fonds noirs opaques.",
    ],
    privacyExplanation:
      "Chaque conversion s'effectue entièrement dans votre navigateur avec la Canvas API. Vos images sont décodées et récodées sur votre appareil et ne sont jamais envoyées vers un serveur.",
    faqs: [
      {
        question: "Puis-je convertir des images en WebP ou AVIF ?",
        answer:
          "Oui ! L'outil prend en charge les formats modernes à forte compression comme WebP et AVIF pour accélérer le chargement des pages.",
      },
      {
        question: "Comment fonctionne la conversion par lots ?",
        answer:
          "Importez n'importe quelle combinaison de types de fichiers, choisissez un format cible et un niveau de qualité unifiés, puis convertissez en un clic.",
      },
      {
        question: "Quels formats puis-je convertir ?",
        answer:
          "JPEG, PNG, WebP et les formats compatibles avec le navigateur via les variantes du convertisseur : les outils dédiés WebP, PNG/JPG, HEIC et SVG partagent ce moteur.",
      },
      {
        question: "Comment fonctionne la conversion par lots ?",
        answer:
          "Mettez plusieurs fichiers en file, choisissez un seul format de sortie et convertissez-les en une passe — chaque fichier se télécharge séparément avec sa nouvelle extension.",
      },
      {
        question: "La conversion de PNG en JPG fait-elle perdre la transparence ?",
        answer:
          "Oui — le JPEG n'a pas de canal alpha, les zones transparentes sont donc aplaties sur la couleur de fond que vous configurez avant l'export.",
      },
    ],
  },
  it: {
    desc: "Converti immagini tra i formati JPG, PNG, WEBP, BMP e TIFF.",
    whatText:
      "Converti immagini in batch tra JPG, PNG, WEBP, AVIF, BMP e TIFF. Scegli un formato di destinazione e un livello di qualità, converti tutti i file selezionati in una volta e scaricali singolarmente o in un ZIP.",
    whyText:
      "I formati legacy come TIFF e BMP forniscono master di qualità fotografica, ma producono file troppo pesanti per il web. Convertirli in formati adatti al browser come WebP o JPEG riduce il peso della stessa immagine.",
    features: [
      "Supporta JPG, PNG, WEBP, AVIF, BMP, TIFF",
      "Coda di conversione batch",
      "Fattore di rendering della qualità personalizzato",
      "Preservazione della trasparenza senza perdite",
    ],
    steps: [
      "Seleziona il formato di output desiderato.",
      "Trascina qui le tue immagini legacy.",
      "Avvia l'elaborazione e clicca su Scarica tutto come ZIP.",
    ],
    examples: [
      {
        title: "Conversione da TIFF a WebP",
        desc: "Riduci il peso dei TIFF di stampa per il design responsive.",
        code: "File Size: 45MB TIFF -> 1.2MB WebP",
      },
    ],
    mistakes: [
      "Convertire in JPEG dei PNG che dipendono dalla trasparenza, con sfondi neri pieni come risultato.",
    ],
    privacyExplanation:
      "Ogni conversione avviene interamente nel tuo browser con la Canvas API. Le tue immagini vengono decodificate e ricodificate sul tuo dispositivo e non vengono mai caricate su alcun server.",
    faqs: [
      {
        question: "Posso convertire immagini in WebP o AVIF?",
        answer:
          "Sì! Lo strumento supporta formati moderni ad alta compressione come WebP e AVIF per accelerare il caricamento delle pagine.",
      },
      {
        question: "Come funziona la conversione batch?",
        answer:
          "Carica qualsiasi combinazione di tipi di file, scegli un formato di destinazione e un livello di qualità unificati e converti con un solo clic.",
      },
      {
        question: "Quali formati posso convertire?",
        answer:
          "JPEG, PNG, WebP e formati supportati dal browser tramite le varianti del convertitore: gli strumenti dedicati a WebP, PNG/JPG, HEIC e SVG condividono questo motore.",
      },
      {
        question: "Come funziona la conversione batch?",
        answer:
          "Metti in coda più file, scegli un formato di output unico e convertili in un'unica passata — ogni file viene scaricato separatamente con la sua nuova estensione.",
      },
      {
        question: "La conversione da PNG a JPG perde la trasparenza?",
        answer:
          "Sì — il JPEG non ha canale alfa, quindi le aree trasparenti vengono appiattite sul colore di sfondo che configuri prima dell'esportazione.",
      },
    ],
  },
};
