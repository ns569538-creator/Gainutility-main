/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlay for merge-pdf (6 locales, 4 FAQs). Source:
 * src/seo/extraPdf.ts PDF_SEO["merge-pdf"] — intro feeds whatText, and the
 * English entry has no examples, empty whyText/features/mistakes, so those
 * match here (limitations from the English limitations array).
 */

import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";

export const overlay: Partial<Record<LocaleCode, ToolBodyOverlay>> = {
  "pt-br": {
    desc: "Combine vários PDFs em um único arquivo e reordene as páginas antes de salvar.",
    whatText:
      "Coloque dois ou mais PDFs na fila, organize-os na ordem desejada e baixe um único documento combinado. Tudo é executado localmente no seu navegador.",
    whyText: "",
    features: [],
    steps: [
      "Arraste seus arquivos PDF para a área de envio ou clique para procurar.",
      "Reorganize a lista de arquivos até que a ordem corresponda a como você deseja combinar as páginas.",
      "Remova qualquer arquivo de que você não precise mais com um clique.",
      "Clique em Mesclar e baixe o PDF mesclado na hora.",
    ],
    mistakes: [],
    privacyExplanation:
      "Os arquivos são processados inteiramente dentro do seu navegador usando JavaScript do lado do cliente. Seu documento nunca é enviado a um servidor.",
    limitations: [
      "PDFs criptografados precisam ser desbloqueados antes de poderem ser mesclados.",
    ],
    faqs: [
      {
        question: "Como mesclo arquivos PDF em um só?",
        answer:
          "Adicione cada PDF à lista de arquivos, arraste-os para a ordem desejada e pressione Mesclar. A ferramenta acrescenta as páginas de todos os documentos em um único PDF para download.",
      },
      {
        question: "Há um limite de quantos PDFs posso mesclar?",
        answer:
          "Não há um limite fixo de quantidade. Como a mesclagem roda no seu próprio dispositivo, os limites práticos vêm da memória disponível, não de uma cota de servidor.",
      },
      {
        question: "A mesclagem altera a qualidade das minhas páginas?",
        answer:
          "Não. As páginas são copiadas para o novo arquivo como estão, então o texto permanece nítido e as imagens mantêm a qualidade original.",
      },
      {
        question: "Meus documentos são enviados para algum lugar?",
        answer:
          "Não. Os arquivos são processados inteiramente dentro do seu navegador usando JavaScript do lado do cliente. Seu documento nunca é enviado a um servidor.",
      },
    ],
  },
  id: {
    desc: "Gabungkan beberapa PDF menjadi satu file dan urutkan ulang halaman sebelum menyimpan.",
    whatText:
      "Letakkan dua PDF atau lebih ke dalam antrean, atur sesuai urutan yang Anda inginkan, lalu unduh satu dokumen gabungan. Semuanya berjalan secara lokal di browser Anda.",
    whyText: "",
    features: [],
    steps: [
      "Seret file PDF Anda ke area unggah atau klik untuk menjelajahi.",
      "Susun ulang daftar file hingga urutannya sesuai dengan cara Anda ingin menggabungkan halaman.",
      "Hapus file yang tidak lagi Anda butuhkan dengan satu klik.",
      "Klik Gabungkan dan unduh PDF Gabungan seketika.",
    ],
    mistakes: [],
    privacyExplanation:
      "File diproses sepenuhnya di dalam browser Anda menggunakan JavaScript sisi klien. Dokumen Anda tidak pernah diunggah ke server mana pun.",
    limitations: [
      "PDF yang terenkripsi harus dibuka terlebih dahulu sebelum bisa digabungkan.",
    ],
    faqs: [
      {
        question: "Bagaimana cara menggabungkan file PDF menjadi satu?",
        answer:
          "Tambahkan setiap PDF ke daftar file, seret ke urutan yang Anda inginkan, lalu tekan Gabungkan. Alat ini menambahkan halaman setiap dokumen ke dalam satu PDF yang bisa diunduh.",
      },
      {
        question: "Apakah ada batasan jumlah PDF yang bisa digabungkan?",
        answer:
          "Tidak ada batasan jumlah tetap. Karena penggabungan berjalan di perangkat Anda sendiri, batasan praktis datang dari memori yang tersedia, bukan dari kuota server.",
      },
      {
        question: "Apakah penggabungan mengubah kualitas halaman saya?",
        answer:
          "Tidak. Halaman disalin ke file baru apa adanya, sehingga teks tetap tajam dan gambar mempertahankan kualitas aslinya.",
      },
      {
        question: "Apakah dokumen saya diunggah ke suatu tempat?",
        answer:
          "Tidak. File diproses sepenuhnya di dalam browser Anda menggunakan JavaScript sisi klien. Dokumen Anda tidak pernah diunggah ke server mana pun.",
      },
    ],
  },
  "es-mx": {
    desc: "Combina varios PDF en un solo archivo y reordena las páginas antes de guardar.",
    whatText:
      "Arrastra dos o más PDF a la cola, ordénalos como quieras y descarga un solo documento combinado. Todo se ejecuta localmente en tu navegador.",
    whyText: "",
    features: [],
    steps: [
      "Arrastra tus archivos PDF al área de subida o haz clic para buscarlos.",
      "Reordena la lista de archivos hasta que el orden coincida con cómo quieres combinar las páginas.",
      "Elimina con un clic cualquier archivo que ya no necesites.",
      "Haz clic en Combinar y descarga el PDF combinado al instante.",
    ],
    mistakes: [],
    privacyExplanation:
      "Los archivos se procesan por completo dentro de tu navegador mediante JavaScript del lado del cliente. Tu documento nunca se sube a un servidor.",
    limitations: [
      "Los PDF cifrados deben desbloquearse antes de poder combinarse.",
    ],
    faqs: [
      {
        question: "¿Cómo combino archivos PDF en uno solo?",
        answer:
          "Añade cada PDF a la lista de archivos, arrástralos al orden que quieras y pulsa Combinar. La herramienta añade las páginas de todos los documentos a un único PDF descargable.",
      },
      {
        question: "¿Hay un límite en la cantidad de PDF que puedo combinar?",
        answer:
          "No hay un límite fijo de cantidad. Como la combinación se ejecuta en tu propio dispositivo, los límites prácticos dependen de la memoria disponible y no de una cuota de servidor.",
      },
      {
        question: "¿Combinar cambiará la calidad de mis páginas?",
        answer:
          "No. Las páginas se copian al nuevo archivo tal cual, así que el texto sigue nítido y las imágenes conservan su calidad original.",
      },
      {
        question: "¿Mis documentos se suben a algún lugar?",
        answer:
          "No. Los archivos se procesan por completo dentro de tu navegador mediante JavaScript del lado del cliente. Tu documento nunca se sube a un servidor.",
      },
    ],
  },
  de: {
    desc: "Fügen Sie mehrere PDFs zu einer einzigen Datei zusammen und ordnen Sie die Seiten vor dem Speichern um.",
    whatText:
      "Legen Sie zwei oder mehr PDFs in die Warteschlange, ordnen Sie sie in der gewünschten Reihenfolge an und laden Sie ein zusammengeführtes Dokument herunter. Alles läuft lokal in Ihrem Browser.",
    whyText: "",
    features: [],
    steps: [
      "Ziehen Sie Ihre PDF-Dateien in den Upload-Bereich oder klicken Sie zum Durchsuchen.",
      "Ordnen Sie die Dateiliste um, bis die Reihenfolge Ihrer gewünschten Seitenzusammenstellung entspricht.",
      "Entfernen Sie mit einem Klick jede Datei, die Sie nicht mehr benötigen.",
      "Klicken Sie auf Zusammenführen und laden Sie das zusammengeführte PDF sofort herunter.",
    ],
    mistakes: [],
    privacyExplanation:
      "Dateien werden vollständig in Ihrem Browser mit clientseitigem JavaScript verarbeitet. Ihr Dokument wird nie auf einen Server hochgeladen.",
    limitations: [
      "Verschlüsselte PDFs müssen zuerst entsperrt werden, bevor sie zusammengeführt werden können.",
    ],
    faqs: [
      {
        question: "Wie führe ich PDF-Dateien zu einer zusammen?",
        answer:
          "Fügen Sie jedes PDF der Dateiliste hinzu, ziehen Sie es in die gewünschte Reihenfolge und drücken Sie auf Zusammenführen. Das Tool hängt die Seiten aller Dokumente an ein einzelnes herunterladbares PDF an.",
      },
      {
        question: "Gibt es ein Limit für die Anzahl der PDFs, die ich zusammenführen kann?",
        answer:
          "Es gibt keine feste Anzahlbegrenzung. Da das Zusammenführen auf Ihrem eigenen Gerät läuft, ergeben sich praktische Grenzen aus dem verfügbaren Speicher und nicht aus einem Serverkontingent.",
      },
      {
        question: "Verändert das Zusammenführen die Qualität meiner Seiten?",
        answer:
          "Nein. Die Seiten werden unverändert in die neue Datei kopiert, sodass Text scharf bleibt und Bilder ihre Originalqualität behalten.",
      },
      {
        question: "Werden meine Dokumente irgendwo hochgeladen?",
        answer:
          "Nein. Dateien werden vollständig in Ihrem Browser mit clientseitigem JavaScript verarbeitet. Ihr Dokument wird nie auf einen Server hochgeladen.",
      },
    ],
  },
  fr: {
    desc: "Combinez plusieurs PDF en un seul fichier et réordonnez les pages avant d'enregistrer.",
    whatText:
      "Déposez deux PDF ou plus dans la file, organisez-les dans l'ordre souhaité puis téléchargez un seul document combiné. Tout s'exécute localement dans votre navigateur.",
    whyText: "",
    features: [],
    steps: [
      "Glissez vos fichiers PDF dans la zone d'import ou cliquez pour parcourir.",
      "Réorganisez la liste des fichiers jusqu'à ce que l'ordre corresponde à la combinaison de pages souhaitée.",
      "Supprimez en un clic tout fichier dont vous n'avez plus besoin.",
      "Cliquez sur Fusionner et téléchargez le PDF fusionné instantanément.",
    ],
    mistakes: [],
    privacyExplanation:
      "Les fichiers sont traités entièrement dans votre navigateur grâce à un JavaScript côté client. Votre document n'est jamais envoyé vers un serveur.",
    limitations: [
      "Les PDF chiffrés doivent être déverrouillés avant de pouvoir être fusionnés.",
    ],
    faqs: [
      {
        question: "Comment fusionner des fichiers PDF en un seul ?",
        answer:
          "Ajoutez chaque PDF à la liste, glissez-les dans l'ordre souhaité puis cliquez sur Fusionner. L'outil assemble les pages de tous les documents en un seul PDF téléchargeable.",
      },
      {
        question: "Y a-t-il une limite au nombre de PDF que je peux fusionner ?",
        answer:
          "Il n'existe aucune limite de nombre fixe. Comme la fusion s'exécute sur votre propre appareil, les limites pratiques viennent de la mémoire disponible et non d'un quota serveur.",
      },
      {
        question: "La fusion va-t-elle modifier la qualité de mes pages ?",
        answer:
          "Non. Les pages sont copiées dans le nouveau fichier telles quelles, le texte reste donc net et les images conservent leur qualité d'origine.",
      },
      {
        question: "Mes documents sont-ils envoyés quelque part ?",
        answer:
          "Non. Les fichiers sont traités entièrement dans votre navigateur grâce à un JavaScript côté client. Votre document n'est jamais envoyé vers un serveur.",
      },
    ],
  },
  it: {
    desc: "Combina più PDF in un unico file e riordina le pagine prima di salvare.",
    whatText:
      "Trascina due o più PDF nella coda, disponili nell'ordine che preferisci e scarica un unico documento combinato. Tutto funziona localmente nel tuo browser.",
    whyText: "",
    features: [],
    steps: [
      "Trascina i tuoi file PDF nell'area di caricamento o clicca per sfogliare.",
      "Riordina l'elenco dei file finché l'ordine non corrisponde a come vuoi combinare le pagine.",
      "Rimuovi con un clic qualsiasi file di cui non hai più bisogno.",
      "Clicca su Unisci e scarica il PDF unito all'istante.",
    ],
    mistakes: [],
    privacyExplanation:
      "I file vengono elaborati interamente nel tuo browser con JavaScript lato client. Il tuo documento non viene mai caricato su un server.",
    limitations: [
      "I PDF crittografati devono essere sbloccati prima di poter essere uniti.",
    ],
    faqs: [
      {
        question: "Come unisco i file PDF in uno solo?",
        answer:
          "Aggiungi ogni PDF all'elenco, trascinali nell'ordine che vuoi, quindi premi Unisci. Lo strumento unisce le pagine di tutti i documenti in un unico PDF scaricabile.",
      },
      {
        question: "C'è un limite al numero di PDF che posso unire?",
        answer:
          "Non esiste un limite fisso al numero. Poiché l'unione avviene sul tuo stesso dispositivo, i limiti pratici dipendono dalla memoria disponibile e non da una quota del server.",
      },
      {
        question: "L'unione cambierà la qualità delle mie pagine?",
        answer:
          "No. Le pagine vengono copiate nel nuovo file così come sono, quindi il testo resta nitido e le immagini mantengono la qualità originale.",
      },
      {
        question: "I miei documenti vengono caricati da qualche parte?",
        answer:
          "No. I file vengono elaborati interamente nel tuo browser con JavaScript lato client. Il tuo documento non viene mai caricato su un server.",
      },
    ],
  },
};
