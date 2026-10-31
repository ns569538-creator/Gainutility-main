/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlay for split-pdf (6 locales).
 * Source: src/seo/extraPdf.ts PDF_SEO["split-pdf"]
 */

import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";

export const overlay: Partial<Record<LocaleCode, ToolBodyOverlay>> = {
  "pt-br": {
    desc: "Divida arquivos PDF em várias partes ou extraia páginas específicas diretamente no seu navegador.",
    whatText:
      "Extraia páginas específicas ou divida um documento PDF grande em arquivos menores diretamente no navegador. Selecione páginas visualmente, defina intervalos personalizados ou separe a cada N páginas com processamento 100% local e sem perda de qualidade.",
    whyText: "",
    features: [],
    steps: [
      "Envie seu arquivo PDF arrastando-o para a área de envio ou clicando para selecionar.",
      "Escolha a estratégia de divisão: Extrair páginas selecionadas, Intervalo personalizado ou Dividir a cada N páginas.",
      "Confira a seleção de páginas na grade de visualização interativa.",
      "Clique em Dividir PDF e baixe seus arquivos como PDFs individuais ou em um único arquivo ZIP.",
    ],
    mistakes: [],
    privacyExplanation:
      "Os arquivos são processados inteiramente dentro do seu navegador usando JavaScript e WebAssembly. Seu documento nunca é enviado a um servidor.",
    limitations: [
      "PDFs criptografados ou protegidos por senha precisam ser desbloqueados antes da divisão.",
      "PDFs muito grandes com centenas de páginas podem demorar alguns segundos a mais para gerar miniaturas, dependendo da memória do seu aparelho.",
    ],
    faqs: [
      {
        question: "Como dividir um PDF em páginas ou intervalos específicos?",
        answer:
          "Envie seu PDF, escolha se deseja extrair páginas específicas clicando nas miniaturas ou definir intervalos (como 1-3, 5, 8-10). Depois clique em Dividir PDF para baixar os arquivos na hora.",
      },
      {
        question: "Como baixar todos os PDFs divididos de uma vez?",
        answer:
          "Quando vários arquivos são gerados, a ferramenta reúne tudo em um único arquivo ZIP para download com um clique, sem acionar bloqueadores de pop-up.",
      },
      {
        question: "Dividir o PDF reduz a qualidade do texto ou das imagens?",
        answer:
          "Não. A divisão extrai as páginas diretamente no nível binário, sem recomprimir texto ou fotos, mantendo 100% da nitidez original.",
      },
      {
        question: "Meus documentos confidenciais são enviados para algum servidor?",
        answer:
          "Nunca. Todo o processamento ocorre no seu navegador com WebAssembly e JavaScript. Nenhum arquivo sai do seu computador ou celular.",
      },
    ],
  },
  id: {
    desc: "Pisahkan file PDF menjadi beberapa bagian atau ekstrak halaman tertentu langsung di browser Anda.",
    whatText:
      "Ekstrak halaman tertentu atau bagi dokumen PDF besar menjadi file-file kecil langsung di browser web Anda. Pilih halaman secara visual, tentukan rentang khusus, atau bagi setiap N halaman tanpa mengunggah file dan tanpa mengurangi kualitas.",
    whyText: "",
    features: [],
    steps: [
      "Unggah file PDF Anda dengan menyeretnya ke dropzone atau klik untuk memilih file.",
      "Pilih metode pemisahan: Ekstrak Halaman Terpilih, Rentang Khusus, atau Bagi Setiap N Halaman.",
      "Periksa pilihan halaman Anda melalui kisi pratinjau interaktif.",
      "Klik Proses Pisah PDF dan unduh hasilnya secara langsung sebagai file individual atau arsip ZIP.",
    ],
    mistakes: [],
    privacyExplanation:
      "File diproses sepenuhnya di dalam browser Anda menggunakan JavaScript dan WebAssembly sisi klien. Dokumen Anda tidak pernah diunggah ke server mana pun.",
    limitations: [
      "PDF yang dienkripsi atau dilindungi kata sandi harus dibuka kuncinya terlebih dahulu sebelum dipisahkan.",
    ],
    faqs: [
      {
        question: "Bagaimana cara memisahkan PDF menjadi beberapa halaman?",
        answer:
          "Unggah PDF Anda, tentukan halaman yang ingin diambil atau masukkan rentang angka (misalnya 1-3, 5, 8-10), lalu klik tombol Pisahkan PDF.",
      },
      {
        question: "Apakah memisahkan PDF akan menurunkan kualitas teks atau gambar?",
        answer:
          "Tidak. Pemisahan dilakukan pada level data dokumen tanpa melakukan kompresi ulang, sehingga kejernihan tetap terjaga 100%.",
      },
      {
        question: "Apakah file saya aman dan tidak diunggah ke server?",
        answer:
          "Sangat aman. Seluruh proses berjalan di memori perangkat Anda secara lokal tanpa ada data yang dikirim ke internet.",
      },
    ],
  },
  "es-mx": {
    desc: "Divide documentos PDF en varias partes o extrae páginas específicas directamente en tu navegador.",
    whatText:
      "Extrae páginas concretas o divide un PDF extenso en archivos individuales más pequeños directamente en tu navegador. Selecciona páginas de forma visual, define rangos personalizados o divide cada N páginas con total privacidad y sin pérdida de calidad.",
    whyText: "",
    features: [],
    steps: [
      "Sube tu archivo PDF arrastrándolo a la zona de carga o haciendo clic para examinar.",
      "Elige tu método de división: Extraer páginas seleccionadas, Rango personalizado o Dividir cada N páginas.",
      "Revisa la selección de páginas mediante la cuadrícula de vista previa interactiva.",
      "Haz clic en Dividir PDF y descarga tus archivos de inmediato como documentos individuales o en un archivo ZIP.",
    ],
    mistakes: [],
    privacyExplanation:
      "Los archivos se procesan por completo dentro de tu navegador mediante JavaScript y WebAssembly. Tu documento nunca se sube a un servidor externo.",
    limitations: [
      "Los archivos PDF protegidos por contraseña deben desbloquearse antes de dividirse.",
      "Archivos con cientos de páginas pueden requerir unos segundos adicionales para generar las miniaturas visuales.",
    ],
    faqs: [
      {
        question: "¿Cómo dividir un PDF en páginas o rangos específicos?",
        answer:
          "Sube tu PDF, elige si deseas extraer páginas pulsando sobre sus miniaturas o escribiendo rangos (como 1-3, 5, 8-10). Después pulsa Dividir PDF para guardarlas.",
      },
      {
        question: "¿Cómo puedo descargar todos los archivos divididos a la vez?",
        answer:
          "Si se generan varios archivos, GainUtility los empaqueta automáticamente en un archivo ZIP para que puedas descargarlos todos en un solo clic sin bloqueos de navegador.",
      },
      {
        question: "¿Dividir el PDF afecta a la calidad del texto o de las fotos?",
        answer:
          "No. Las páginas se extraen a nivel de flujo binario sin recomprimir imágenes ni rasterizar texto, manteniendo el 100% de la calidad original.",
      },
      {
        question: "¿Mis documentos confidenciales se envían a sus servidores?",
        answer:
          "Nunca. GainUtility procesa todos los PDF localmente en la memoria de tu navegador. Ningún dato sale de tu dispositivo.",
      },
    ],
  },
  de: {
    desc: "Teilen Sie PDF-Dokumente in mehrere Dateien auf oder extrahieren Sie Seiten direkt im Browser.",
    whatText:
      "Extrahieren Sie bestimmte Seiten oder teilen Sie ein großes PDF-Dokument direkt im Webbrowser in kleinere Dateien auf. Wählen Sie Seiten visuell aus, definieren Sie benutzerdefinierte Bereiche oder trennen Sie alle N Seiten – ohne Upload und ohne Qualitätsverlust.",
    whyText: "",
    features: [],
    steps: [
      "Laden Sie Ihre PDF-Datei hoch, indem Sie sie in den Upload-Bereich ziehen oder auf Durchsuchen klicken.",
      "Wählen Sie Ihre Aufteilungsstrategie: Ausgewählte Seiten extrahieren, Eigener Bereich oder Alle N Seiten teilen.",
      "Überprüfen Sie Ihre Seitenauswahl in der interaktiven Vorschau.",
      "Klicken Sie auf PDF teilen und laden Sie Ihre Dateien sofort einzeln oder als ZIP-Archiv herunter.",
    ],
    mistakes: [],
    privacyExplanation:
      "Dateien werden vollständig in Ihrem Browser mit clientseitigem JavaScript und WebAssembly verarbeitet. Ihr Dokument wird nie auf einen Server hochgeladen.",
    limitations: [
      "Passwortgeschützte PDFs müssen vor dem Teilen entsperrt werden.",
    ],
    faqs: [
      {
        question: "Wie teile ich eine PDF-Datei in einzelne Seiten oder Bereiche auf?",
        answer:
          "Laden Sie Ihr PDF hoch, wählen Sie die gewünschten Seiten per Klick auf die Vorschau oder geben Sie Bereiche ein (z. B. 1-3, 5, 8-10), und klicken Sie auf PDF teilen.",
      },
      {
        question: "Verringert das Teilen der PDF die Text- oder Bildqualität?",
        answer:
          "Nein. Seiten werden auf binärer Ebene verlustfrei herausgelöst, ohne dass Schriften oder Bilder neu komprimiert werden.",
      },
      {
        question: "Werden meine vertraulichen Dokumente auf einen Server übertragen?",
        answer:
          "Nein, niemals. Die gesamte Verarbeitung erfolgt lokal im Speicher Ihres Browsers. Es werden keine Dokumente hochgeladen.",
      },
    ],
  },
  fr: {
    desc: "Divisez des fichiers PDF en plusieurs documents ou extrayez des pages précises directement dans votre navigateur.",
    whatText:
      "Extrayez des pages spécifiques ou séparez un document PDF volumineux en plusieurs fichiers directement dans votre navigateur web. Sélectionnez visuellement les pages, indiquez des plages personnalisées ou découpez toutes les N pages sans aucun transfert de fichier et sans perte de qualité.",
    whyText: "",
    features: [],
    steps: [
      "Importez votre fichier PDF en le glissant dans la zone de dépôt ou en cliquant pour parcourir.",
      "Choisissez votre mode de découpage : Extraire les pages sélectionnées, Plage personnalisée ou Découper toutes les N pages.",
      "Vérifiez votre sélection dans la grille de prévisualisation interactive.",
      "Cliquez sur Diviser le PDF et téléchargez vos fichiers immédiatement sous forme de PDF individuels ou dans une archive ZIP.",
    ],
    mistakes: [],
    privacyExplanation:
      "Les fichiers sont traités entièrement dans votre navigateur grâce à WebAssembly et JavaScript côté client. Vos documents ne sont jamais envoyés vers un serveur externe.",
    limitations: [
      "Les PDF chiffrés ou protégés par mot de passe doivent être déverrouillés avant le découpage.",
      "Les documents contenant des centaines de pages peuvent nécessiter quelques secondes de plus pour générer les vignettes selon la mémoire de votre appareil.",
    ],
    faqs: [
      {
        question: "Comment diviser un PDF en pages ou plages spécifiques ?",
        answer:
          "Déposez votre document, sélectionnez les pages à extraire en cliquant sur les miniatures ou saisissez une plage (comme 1-3, 5, 8-10), puis cliquez sur Diviser le PDF.",
      },
      {
        question: "Comment télécharger tous les fichiers divisés en une seule fois ?",
        answer:
          "Lorsque plusieurs fichiers sont générés, l'outil les regroupe automatiquement dans une archive ZIP téléchargeable en un clic pour éviter les blocages de fenêtres surgissantes.",
      },
      {
        question: "Le découpage réduit-il la qualité du texte ou des images ?",
        answer:
          "Non. L'extraction s'effectue au niveau binaire sans ré-échantillonnage ni recompression, préservant 100 % de la netteté vectorielle d'origine.",
      },
      {
        question: "Mes documents confidentiels sont-ils envoyés sur vos serveurs ?",
        answer:
          "Jamais. Tout le traitement a lieu localement dans la mémoire de votre navigateur. Aucun fichier ne quitte votre appareil.",
      },
    ],
  },
  it: {
    desc: "Dividi file PDF in più documenti o estrai pagine specifiche direttamente nel tuo browser.",
    whatText:
      "Estrai pagine singole o dividi un PDF voluminoso in file più piccoli direttamente nel tuo browser. Seleziona le pagine visivamente, specifica intervalli personalizzati o dividi ogni N pagine senza alcun caricamento su server e senza perdita di qualità.",
    whyText: "",
    features: [],
    steps: [
      "Carica il tuo file PDF trascinandolo nell'area di rilascio oppure facendo clic per cercarlo.",
      "Scegli la modalità di divisione: Estrai pagine selezionate, Intervallo personalizzato o Dividi ogni N pagine.",
      "Controlla la selezione nella griglia di anteprima interattiva.",
      "Fai clic su Dividi PDF e scarica immediatamente i documenti singoli o un archivio ZIP completo.",
    ],
    mistakes: [],
    privacyExplanation:
      "I file vengono elaborati interamente nel tuo browser con JavaScript e WebAssembly lato client. Il tuo documento non viene mai inviato a un server.",
    limitations: [
      "I file PDF protetti da password devono essere sbloccati prima della divisione.",
    ],
    faqs: [
      {
        question: "Come posso dividere un PDF in pagine o intervalli specifici?",
        answer:
          "Carica il file, scegli le pagine facendo clic sulle miniature o inserisci gli intervalli (es. 1-3, 5, 8-10) e fai clic su Dividi PDF.",
      },
      {
        question: "Dividere il PDF riduce la qualità di testi o immagini?",
        answer:
          "No. L'estrazione avviene a livello di flusso binario senza ricompressione, preservando il 100% della qualità originale.",
      },
      {
        question: "I miei documenti riservati vengono caricati sui vostri server?",
        answer:
          "Mai. GainUtility esegue ogni elaborazione localmente nel tuo browser. Nessun file lascia il tuo computer.",
      },
    ],
  },
};

