/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Genuinely localized content for the six category hub pages (/pdf, /json,
 * /image, /css, /dev, /seo).
 *
 * Each overlay is a full replacement for the English hub content in
 * src/seo/seoPageContent.ts. Only hubs with an overlay here are treated as
 * genuinely localized by `isLocalizedView` (see src/i18n/pages.ts), so an
 * overlay missing a locale means that locale stays gated (English content,
 * en-only sitemap + hreflang) — never a fake localized page.
 *
 * Spanish ("es-co") deliberately falls back to "es-mx" — the two regions
 * share one natural Latin American Spanish variant, matching how the rest of
 * the site handles es-mx/es-co copy.
 */

import type { LocaleCode } from "./slugs";

export interface HubUseCase {
  title: string;
  desc: string;
}

export interface HubFaq {
  question: string;
  answer: string;
}

export interface HubBreadcrumb {
  name: string;
  url: string;
}

export interface HubOverlay {
  /** Localized category label (also feeds the H1 + category link). */
  category: string;
  title: string;
  description: string;
  intro: string;
  useCases: HubUseCase[];
  steps: string[];
  faq: HubFaq[];
  breadcrumbs: HubBreadcrumb[];
}

export type HubLocaleOverlays = Partial<Record<LocaleCode, HubOverlay>>;

/** Generic "related tool" description per locale (matches the EN pattern). */
export const RELATED_DESC_TEMPLATE: Record<string, string> = {
  en: "Use the {name} tool online.",
  "pt-br": "Use a ferramenta {name} online.",
  id: "Gunakan alat {name} secara online.",
  "es-mx": "Usa la herramienta {name} en línea.",
  "es-co": "Usa la herramienta {name} en línea.",
  de: "Nutze das Werkzeug {name} online.",
  fr: "Utilisez l'outil {name} en ligne.",
  it: "Usa lo strumento {name} online.",
};

export const HUB_LOCALIZED: Record<string, HubLocaleOverlays> = {
  /* ------------------------------------------------------------------ */
  /* PDF hub                                                             */
  /* ------------------------------------------------------------------ */
  pdf: {
    "pt-br": {
      category: "Ferramentas de PDF",
      title: "Ferramentas de PDF Online Grátis – Juntar, Dividir, Comprimir e Converter | GainUtility",
      description:
        "Use ferramentas de PDF grátis no seu navegador. Junte, divida, comprima, gire e converta PDFs. Os arquivos são processados localmente, e qualquer ferramenta que chame um serviço externo informa isso na própria página.",
      intro:
        "O pacote de ferramentas de PDF da GainUtility processa seus arquivos no navegador, então a maioria dos PDFs permanece no seu dispositivo. Junte vários PDFs, divida por intervalo de páginas, comprima o tamanho, gire páginas e converta entre PDF, imagens e documentos do Office — e muito mais. A única exceção, o Tradutor de PDF, envia o texto extraído a um serviço de tradução e informa isso na própria página.",
      useCases: [
        { title: "Juntar vários PDFs", desc: "Combine vários documentos PDF em um único arquivo. Arraste e solte para reordenar as páginas antes de juntar." },
        { title: "Dividir PDF por página", desc: "Extraia páginas ou intervalos específicos de um PDF. Divida a cada N páginas ou separe por tamanho de arquivo." },
        { title: "Comprimir tamanho do PDF", desc: "Reduza o tamanho do arquivo PDF para anexos de e-mail e uploads web mantendo a qualidade." },
        { title: "Converter imagens em PDF", desc: "Transforme JPG, PNG ou outras imagens em um documento PDF limpo, com margens personalizáveis." },
      ],
      steps: [
        "Escolha a ferramenta de PDF que você precisa na coleção acima.",
        "Arraste seus PDFs para a área de upload ou clique para selecionar.",
        "Ajuste as opções, como intervalo de páginas, nível de compressão ou formato de saída.",
        "Clique no botão da ação e baixe o PDF processado imediatamente.",
      ],
      faq: [
        { question: "Meus arquivos PDF são enviados a um servidor?", answer: "A maioria das ferramentas processa seu PDF direto no navegador, então o arquivo permanece no seu dispositivo. O Tradutor de PDF é a exceção: ele envia o texto extraído a um serviço de tradução, e isso é informado na própria página." },
        { question: "Existe um limite de tamanho de arquivo?", answer: "O processamento é limitado pela memória do seu navegador. A maioria dos arquivos de até 100MB funciona sem problemas. Para arquivos muito grandes, tente dividir antes." },
        { question: "Posso usar essas ferramentas no celular?", answer: "Sim. Todas as ferramentas de PDF são responsivas e funcionam em smartphones e tablets pelo navegador do celular." },
      ],
      breadcrumbs: [
        { name: "Início", url: "/" },
        { name: "Ferramentas de PDF", url: "/pdf" },
      ],
    },
    id: {
      category: "Alat PDF",
      title: "Alat PDF Online Gratis — Gabungkan, Pisah, Kompres & Konversi PDF | GainUtility",
      description:
        "Gunakan 40+ alat PDF gratis di browser Anda. Gabungkan, bagi, kompres, putar, konversi, dan edit PDF. File diproses secara lokal, dan alat apa pun yang memanggil layanan eksternal mencantumkannya di halamannya.",
      intro:
        "Paket alat PDF GainUtility memproses file di peramban Anda, sehingga sebagian besar PDF tetap berada di perangkat Anda. Gabungkan beberapa PDF, pisah berdasarkan rentang halaman, kompres ukuran file, putar halaman, konversi antara PDF, gambar, dan dokumen Office, dan masih banyak lagi. Satu alat, Penerjemah PDF, mengirim teks yang diekstrak ke layanan penerjemahan dan mencantumkannya di halamannya.",
      useCases: [
        { title: "Gabungkan Beberapa PDF", desc: "Gabungkan beberapa dokumen PDF menjadi satu file. Seret dan lepas untuk mengurutkan ulang halaman sebelum menggabungkan." },
        { title: "Pisah PDF per Halaman", desc: "Ekstrak halaman atau rentang tertentu dari PDF. Pisah setiap N halaman atau pisahkan berdasarkan ukuran file." },
        { title: "Kompres Ukuran PDF", desc: "Kurangi ukuran file PDF untuk lampiran email dan unggahan web sambil menjaga kualitas." },
        { title: "Ubah Gambar Menjadi PDF", desc: "Ubah JPG, PNG, atau gambar lain menjadi dokumen PDF yang rapi dengan margin yang dapat disesuaikan." },
      ],
      steps: [
        "Pilih alat PDF yang Anda butuhkan dari koleksi di atas.",
        "Seret file PDF Anda ke area unggah atau klik untuk memilih.",
        "Sesuaikan pengaturan seperti rentang halaman, tingkat kompresi, atau format keluaran.",
        "Klik tombol aksi dan unduh PDF Anda yang sudah diproses secara langsung.",
      ],
      faq: [
        { question: "Apakah file PDF saya diunggah ke server?", answer: "Sebagian besar alat memproses PDF Anda langsung di peramban, sehingga file tetap berada di perangkat Anda. Penerjemah PDF adalah pengecualian — alat ini mengirim teks yang diekstrak ke layanan penerjemahan, dan hal itu dicantumkan di halamannya sendiri." },
        { question: "Apakah ada batas ukuran file?", answer: "Pemrosesan dibatasi oleh memori peramban Anda. Sebagian besar file hingga 100MB berjalan lancar. Untuk file yang sangat besar, coba pisahkan terlebih dahulu." },
        { question: "Bisakah saya menggunakan alat ini di ponsel?", answer: "Ya. Semua alat PDF responsif dan berfungsi di ponsel cerdas dan tablet melalui peramban seluler Anda." },
      ],
      breadcrumbs: [
        { name: "Beranda", url: "/" },
        { name: "Alat PDF", url: "/pdf" },
      ],
    },
    "es-mx": {
      category: "Herramientas de PDF",
      title: "Herramientas de PDF en línea gratis – Unir, dividir, comprimir y convertir PDF | GainUtility",
      description:
        "Usa más de 40 herramientas de PDF gratis en tu navegador. Une, divide, comprime, rota, convierte y edita PDF. Los archivos se procesan localmente y cualquier herramienta que llame a un servicio externo lo indica en su página.",
      intro:
        "El kit de herramientas PDF de GainUtility procesa tus archivos en el navegador, así que la mayoría de los PDF permanecen en tu dispositivo. Une varios PDF, divide por rangos de páginas, reduce el tamaño, rota páginas y convierte entre PDF, imágenes y documentos de Office, y mucho más. Una sola herramienta, el Traductor de PDF, envía el texto extraído a un servicio de traducción y lo indica en su página.",
      useCases: [
        { title: "Unir varios PDF", desc: "Combina varios documentos PDF en un solo archivo. Arrastra y suelta para reordenar las páginas antes de unirlas." },
        { title: "Dividir PDF por página", desc: "Extrae páginas o rangos específicos de un PDF. Divide cada N páginas o separa por tamaño de archivo." },
        { title: "Comprimir el tamaño del PDF", desc: "Reduce el tamaño del archivo PDF para adjuntos de correo y subidas web manteniendo la calidad." },
        { title: "Convertir imágenes en PDF", desc: "Convierte JPG, PNG u otras imágenes en un documento PDF limpio con márgenes personalizables." },
      ],
      steps: [
        "Elige la herramienta PDF que necesites de la colección de arriba.",
        "Arrastra tus PDF a la zona de carga o haz clic para buscarlos.",
        "Ajusta opciones como el rango de páginas, el nivel de compresión o el formato de salida.",
        "Haz clic en el botón de acción y descarga tu PDF procesado al instante.",
      ],
      faq: [
        { question: "¿Mis archivos PDF se suben a un servidor?", answer: "La mayoría de las herramientas procesan tu PDF directamente en el navegador, así que el archivo permanece en tu dispositivo. El Traductor de PDF es la excepción: envía el texto extraído a un servicio de traducción y esto se indica en su propia página." },
        { question: "¿Hay un límite de tamaño de archivo?", answer: "El procesamiento está limitado por la memoria de tu navegador. La mayoría de los archivos de hasta 100MB funcionan sin problemas. Para archivos muy grandes, intenta dividirlos primero." },
        { question: "¿Puedo usar estas herramientas en el móvil?", answer: "Sí. Todas las herramientas PDF son adaptables y funcionan en teléfonos y tabletas a través del navegador del móvil." },
      ],
      breadcrumbs: [
        { name: "Inicio", url: "/" },
        { name: "Herramientas de PDF", url: "/pdf" },
      ],
    },
    de: {
      category: "PDF-Werkzeuge",
      title: "Kostenlose Online-PDF-Tools – PDFs zusammenführen, teilen, komprimieren & konvertieren | GainUtility",
      description:
        "Nutzen Sie über 40 kostenlose PDF-Tools im Browser. PDFs zusammenführen, teilen, komprimieren, drehen und konvertieren. Dateien werden lokal verarbeitet; jedes Tool, das einen externen Dienst aufruft, weist darauf auf seiner Seite hin.",
      intro:
        "Das PDF-Toolkit von GainUtility verarbeitet Ihre Dateien im Browser, sodass die meisten PDFs auf Ihrem Gerät bleiben. Fügen Sie mehrere PDFs zusammen, teilen Sie sie nach Seitenbereichen, verkleinern Sie Dateien, drehen Sie Seiten und konvertieren Sie zwischen PDF, Bildern und Office-Dokumenten – und vieles mehr. Eine Ausnahme, der PDF-Übersetzer, sendet extrahierten Text an einen Übersetzungsdienst und weist auf seiner Seite darauf hin.",
      useCases: [
        { title: "Mehrere PDFs zusammenführen", desc: "Kombinieren Sie mehrere PDF-Dokumente zu einer Datei. Ziehen Sie Seiten per Drag & Drop in die richtige Reihenfolge, bevor Sie zusammenführen." },
        { title: "PDF nach Seiten teilen", desc: "Extrahieren Sie bestimmte Seiten oder Bereiche. Teilen Sie alle N Seiten oder trennen Sie nach Dateigröße." },
        { title: "PDF-Größe komprimieren", desc: "Reduzieren Sie die Dateigröße für E-Mail-Anhänge und Web-Uploads, ohne die Qualität zu beeinträchtigen." },
        { title: "Bilder in PDF umwandeln", desc: "Machen Sie aus JPG, PNG oder anderen Bildern ein sauberes PDF-Dokument mit anpassbaren Rändern." },
      ],
      steps: [
        "Wählen Sie das gewünschte PDF-Tool aus der Sammlung oben.",
        "Ziehen Sie Ihre PDF-Dateien in den Upload-Bereich oder klicken Sie zum Durchsuchen.",
        "Passen Sie Einstellungen wie Seitenbereiche, Komprimierungsstufe oder Ausgabeformat an.",
        "Klicken Sie auf den Aktionsbutton und laden Sie sofort Ihr verarbeitetes PDF herunter.",
      ],
      faq: [
        { question: "Werden meine PDF-Dateien auf einen Server hochgeladen?", answer: "Die meisten Tools verarbeiten Ihr PDF direkt im Browser, sodass die Datei auf Ihrem Gerät bleibt. Der PDF-Übersetzer ist die Ausnahme: Er sendet den extrahierten Text an einen Übersetzungsdienst, was auf seiner eigenen Seite kenntlich gemacht wird." },
        { question: "Gibt es ein Dateigrößenlimit?", answer: "Die Verarbeitung ist durch den Speicher Ihres Browsers begrenzt. Die meisten Dateien bis 100MB funktionieren problemlos. Bei sehr großen Dateien teilen Sie das PDF zuerst." },
        { question: "Kann ich diese Tools am Handy nutzen?", answer: "Ja. Alle PDF-Tools sind responsiv und funktionieren über den Mobilbrowser auf Smartphones und Tablets." },
      ],
      breadcrumbs: [
        { name: "Startseite", url: "/" },
        { name: "PDF-Werkzeuge", url: "/pdf" },
      ],
    },
    fr: {
      category: "Outils PDF",
      title: "Outils PDF en ligne gratuits – Fusionner, diviser, compresser et convertir des PDF | GainUtility",
      description:
        "Utilisez plus de 40 outils PDF gratuits dans votre navigateur. Fusionnez, divisez, compressez, faites pivoter, convertissez et modifiez des PDF. Les fichiers sont traités localement, et tout outil qui appelle un service externe l'indique sur sa page.",
      intro:
        "La suite d'outils PDF de GainUtility traite vos fichiers dans le navigateur, la plupart de vos PDF restent donc sur votre appareil. Fusionnez plusieurs PDF, divisez par plage de pages, réduisez la taille, faites pivoter les pages et convertissez entre PDF, images et documents Office, et bien plus encore. Un seul outil, le traducteur de PDF, envoie le texte extrait à un service de traduction et l'indique sur sa page.",
      useCases: [
        { title: "Fusionner plusieurs PDF", desc: "Combine plusieurs documents PDF en un seul fichier. Glissez-déposez pour réordonner les pages avant la fusion." },
        { title: "Diviser un PDF par page", desc: "Extrayez des pages ou des plages précises d'un PDF. Divisez toutes les N pages ou séparez par taille de fichier." },
        { title: "Réduire la taille d'un PDF", desc: "Diminuez la taille du fichier PDF pour les pièces jointes et les envois web tout en conservant la qualité." },
        { title: "Convertir des images en PDF", desc: "Transformez des JPG, PNG ou autres images en un document PDF net avec des marges personnalisables." },
      ],
      steps: [
        "Choisissez l'outil PDF dont vous avez besoin dans la collection ci-dessus.",
        "Déposez vos PDF dans la zone d'envoi ou cliquez pour parcourir.",
        "Réglez des options comme les plages de pages, le niveau de compression ou le format de sortie.",
        "Cliquez sur le bouton d'action et téléchargez immédiatement votre PDF traité.",
      ],
      faq: [
        { question: "Mes fichiers PDF sont-ils envoyés sur un serveur ?", answer: "La plupart des outils traitent votre PDF directement dans le navigateur, le fichier reste donc sur votre appareil. Le traducteur de PDF est l'exception : il envoie le texte extrait à un service de traduction, ce qui est indiqué sur sa propre page." },
        { question: "Y a-t-il une limite de taille de fichier ?", answer: "Le traitement est limité par la mémoire de votre navigateur. La plupart des fichiers jusqu'à 100 Mo fonctionnent sans problème. Pour les très gros fichiers, essayez de diviser d'abord." },
        { question: "Puis-je utiliser ces outils sur mobile ?", answer: "Oui. Tous les outils PDF sont adaptatifs et fonctionnent sur smartphones et tablettes via le navigateur mobile." },
      ],
      breadcrumbs: [
        { name: "Accueil", url: "/" },
        { name: "Outils PDF", url: "/pdf" },
      ],
    },
    it: {
      category: "Strumenti PDF",
      title: "Strumenti PDF online gratuiti – Unisci, dividi, comprimi e converti PDF | GainUtility",
      description:
        "Usa oltre 40 strumenti PDF gratuiti nel tuo browser. Unisci, dividi, comprimi, ruota, converti e modifica PDF. I file vengono elaborati localmente e qualsiasi strumento che chiama un servizio esterno lo dichiara sulla sua pagina.",
      intro:
        "Il pacchetto di strumenti PDF di GainUtility elabora i file nel browser, quindi la maggior parte dei PDF resta sul tuo dispositivo. Unisci più PDF, dividi per intervalli di pagine, riduci le dimensioni, ruota le pagine e converti tra PDF, immagini e documenti Office – e molto altro. Un solo strumento, il Traduttore PDF, invia il testo estratto a un servizio di traduzione e lo dichiara sulla sua pagina.",
      useCases: [
        { title: "Unire più PDF", desc: "Combina più documenti PDF in un unico file. Trascina e rilascia per riordinare le pagine prima dell'unione." },
        { title: "Dividere PDF per pagina", desc: "Estrai pagine o intervalli specifici da un PDF. Dividi ogni N pagine o separa per dimensione del file." },
        { title: "Comprimere le dimensioni del PDF", desc: "Riduci la dimensione del file PDF per allegati email e caricamenti web mantenendo la qualità." },
        { title: "Convertire immagini in PDF", desc: "Trasforma JPG, PNG o altre immagini in un documento PDF pulito con margini personalizzabili." },
      ],
      steps: [
        "Scegli lo strumento PDF che ti serve dalla collezione qui sopra.",
        "Trascina i tuoi PDF nella zona di caricamento o clicca per selezionarli.",
        "Regola le opzioni come intervalli di pagine, livello di compressione o formato di uscita.",
        "Clicca sul pulsante dell'azione e scarica subito il tuo PDF elaborato.",
      ],
      faq: [
        { question: "I miei file PDF vengono caricati su un server?", answer: "La maggior parte degli strumenti elabora il PDF direttamente nel browser, quindi il file resta sul tuo dispositivo. Il Traduttore PDF è l'eccezione: invia il testo estratto a un servizio di traduzione e lo dichiara sulla propria pagina." },
        { question: "C'è un limite alla dimensione dei file?", answer: "L'elaborazione è limitata dalla memoria del browser. La maggior parte dei file fino a 100MB funziona senza problemi. Per file molto grandi, prova a dividerli prima." },
        { question: "Posso usare questi strumenti sul cellulare?", answer: "Sì. Tutti gli strumenti PDF sono reattivi e funzionano su smartphone e tablet tramite il browser mobile." },
      ],
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Strumenti PDF", url: "/pdf" },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* JSON hub                                                            */
  /* ------------------------------------------------------------------ */
  json: {
    "pt-br": {
      category: "Ferramentas de JSON",
      title: "Ferramentas de JSON Online Grátis – Formate, Valide, Compare & Converta | GainUtility",
      description:
        "Use ferramentas de JSON grátis no seu navegador. Formate, valide, minifique, compare e converta dados JSON instantaneamente. Rápido, privado, sem uploads.",
      intro:
        "O conjunto de ferramentas JSON da GainUtility ajuda desenvolvedores a formatar, validar, comparar e transformar dados JSON — tudo processado localmente no seu navegador. Nenhum dado sai do seu dispositivo.",
      useCases: [
        { title: "Formatar e embelezar", desc: "Organize JSON minificado com realce de sintaxe e indentação personalizada." },
        { title: "Validar e depurar", desc: "Encontre erros de sintaxe com números de linha e posições de caractere para depurar rapidamente." },
        { title: "Comparar e diferenciar", desc: "Comparação lado a lado para identificar diferenças estruturais entre objetos JSON." },
        { title: "Converter dados", desc: "Transforme JSON em CSV ou converta CSV/XML para o formato JSON." },
      ],
      steps: [
        "Escolha a ferramenta de JSON que você precisa na coleção.",
        "Cole ou digite seus dados JSON no editor.",
        "Use os recursos da ferramenta — formatar, validar, comparar ou converter.",
        "Copie o resultado ou baixe-o como arquivo.",
      ],
      faq: [
        { question: "Meus dados JSON são enviados a um servidor?", answer: "Não. Todo o processamento de JSON acontece inteiramente no seu navegador. Seus dados nunca saem do seu dispositivo." },
        { question: "Quais recursos de JSON são suportados?", answer: "Suporte completo à especificação JSON, incluindo objetos aninhados, arrays, strings unicode e tipos numéricos." },
      ],
      breadcrumbs: [
        { name: "Início", url: "/" },
        { name: "Ferramentas de JSON", url: "/json" },
      ],
    },
    id: {
      category: "Alat JSON",
      title: "Alat JSON Online Gratis — Format, Validasi, Bandingkan & Konversi | GainUtility",
      description:
        "Gunakan alat JSON gratis di browser Anda. Format, validasi, minifikasi, bandingkan, dan konversi data JSON secara instan. Cepat, pribadi, tanpa unggahan.",
      intro:
        "Perangkat JSON GainUtility membantu pengembang memformat, memvalidasi, membandingkan, dan mengubah data JSON — semuanya diproses secara lokal di peramban Anda. Tidak ada data yang meninggalkan perangkat Anda.",
      useCases: [
        { title: "Format & Rapi", desc: "Merapikan JSON yang diminifikasi dengan penyorotan sintaks dan indentasi khusus." },
        { title: "Validasi & Debug", desc: "Temukan kesalahan sintaks dengan nomor baris dan posisi karakter untuk debugging cepat." },
        { title: "Bandingkan & Diff", desc: "Perbandingan berdampingan untuk menemukan perbedaan struktural antar objek JSON." },
        { title: "Konversi Data", desc: "Ubah JSON menjadi CSV, atau konversi CSV/XML ke format JSON." },
      ],
      steps: [
        "Pilih alat JSON yang Anda butuhkan dari koleksi.",
        "Tempel atau ketik data JSON Anda di editor.",
        "Gunakan fitur alat — format, validasi, bandingkan, atau konversi.",
        "Salin hasilnya atau unduh sebagai file.",
      ],
      faq: [
        { question: "Apakah data JSON saya dikirim ke server?", answer: "Tidak. Semua pemrosesan JSON sepenuhnya terjadi di peramban Anda. Data Anda tidak pernah meninggalkan perangkat Anda." },
        { question: "Fitur JSON apa yang didukung?", answer: "Dukungan spesifikasi JSON lengkap termasuk objek bersarang, array, string unicode, dan tipe numerik." },
      ],
      breadcrumbs: [
        { name: "Beranda", url: "/" },
        { name: "Alat JSON", url: "/json" },
      ],
    },
    "es-mx": {
      category: "Herramientas de JSON",
      title: "Herramientas de JSON en línea gratis – Formatea, valida, compara y convierte | GainUtility",
      description:
        "Usa herramientas de JSON gratis en tu navegador. Formatea, valida, minimiza, compara y convierte datos JSON al instante. Rápido, privado, sin subidas.",
      intro:
        "El conjunto de herramientas JSON de GainUtility ayuda a los desarrolladores a formatear, validar, comparar y transformar datos JSON: todo se procesa localmente en tu navegador. Ningún dato sale de tu dispositivo.",
      useCases: [
        { title: "Formatear y embellecer", desc: "Embellece JSON minimizado con resaltado de sintaxis e indentación personalizada." },
        { title: "Validar y depurar", desc: "Encuentra errores de sintaxis con números de línea y posiciones de carácter para depurar rápido." },
        { title: "Comparar y diferenciar", desc: "Comparación lado a lado para detectar diferencias estructurales entre objetos JSON." },
        { title: "Convertir datos", desc: "Convierte JSON a CSV o convierte CSV/XML al formato JSON." },
      ],
      steps: [
        "Elige la herramienta JSON que necesites de la colección.",
        "Pega o escribe tus datos JSON en el editor.",
        "Usa las funciones de la herramienta: formatear, validar, comparar o convertir.",
        "Copia el resultado o descárgalo como archivo.",
      ],
      faq: [
        { question: "¿Mis datos JSON se envían a un servidor?", answer: "No. Todo el procesamiento de JSON ocurre por completo en tu navegador. Tus datos nunca salen de tu dispositivo." },
        { question: "¿Qué funciones de JSON se admiten?", answer: "Compatibilidad completa con la especificación JSON, incluidos objetos anidados, matrices, cadenas unicode y tipos numéricos." },
      ],
      breadcrumbs: [
        { name: "Inicio", url: "/" },
        { name: "Herramientas de JSON", url: "/json" },
      ],
    },
    de: {
      category: "JSON-Werkzeuge",
      title: "Kostenlose Online-JSON-Tools – Formatieren, Validieren, Vergleichen & Konvertieren | GainUtility",
      description:
        "Nutzen Sie kostenlose JSON-Tools im Browser. JSON-Daten formatieren, validieren, minifizieren, vergleichen und konvertieren. Schnell, privat, keine Uploads.",
      intro:
        "Das JSON-Toolset von GainUtility hilft Entwicklern beim Formatieren, Validieren, Vergleichen und Umwandeln von JSON-Daten – alle Verarbeitung läuft lokal im Browser. Keine Daten verlassen Ihr Gerät.",
      useCases: [
        { title: "Formatieren & verschönern", desc: "Minifiziertes JSON mit Syntax-Highlighting und eigener Einrückung lesbar machen." },
        { title: "Validieren & debuggen", desc: "Syntaxfehler mit Zeilennummern und Zeichenpositionen für schnelles Debugging finden." },
        { title: "Vergleichen & diffen", desc: "Direkter Vergleich, um strukturelle Unterschiede zwischen JSON-Objekten zu erkennen." },
        { title: "Daten konvertieren", desc: "JSON in CSV umwandeln oder CSV/XML in das JSON-Format konvertieren." },
      ],
      steps: [
        "Wählen Sie das benötigte JSON-Tool aus der Sammlung.",
        "Fügen Sie Ihre JSON-Daten in den Editor ein oder tippen Sie sie hinein.",
        "Nutzen Sie die Funktionen des Tools – formatieren, validieren, vergleichen oder konvertieren.",
        "Kopieren Sie das Ergebnis oder laden Sie es als Datei herunter.",
      ],
      faq: [
        { question: "Werden meine JSON-Daten an einen Server gesendet?", answer: "Nein. Die gesamte JSON-Verarbeitung erfolgt vollständig in Ihrem Browser. Ihre Daten verlassen Ihr Gerät nie." },
        { question: "Welche JSON-Funktionen werden unterstützt?", answer: "Volle Unterstützung der JSON-Spezifikation einschließlich verschachtelter Objekte, Arrays, Unicode-Zeichenketten und numerischer Typen." },
      ],
      breadcrumbs: [
        { name: "Startseite", url: "/" },
        { name: "JSON-Werkzeuge", url: "/json" },
      ],
    },
    fr: {
      category: "Outils JSON",
      title: "Outils JSON en ligne gratuits – Formater, valider, comparer et convertir | GainUtility",
      description:
        "Utilisez des outils JSON gratuits dans votre navigateur. Formatez, validez, minifiez, comparez et convertissez des données JSON instantanément. Rapide, privé, sans envoi.",
      intro:
        "La suite d'outils JSON de GainUtility aide les développeurs à formater, valider, comparer et transformer des données JSON : tout est traité localement dans votre navigateur. Aucune donnée ne quitte votre appareil.",
      useCases: [
        { title: "Formater et embellir", desc: "Rendez plus lisible un JSON minifié avec coloration syntaxique et indentation personnalisée." },
        { title: "Valider et déboguer", desc: "Trouvez les erreurs de syntaxe avec numéros de ligne et positions de caractère pour déboguer vite." },
        { title: "Comparer et différencier", desc: "Comparaison côte à côte pour repérer les différences structurelles entre objets JSON." },
        { title: "Convertir les données", desc: "Transformez du JSON en CSV, ou convertissez du CSV/XML au format JSON." },
      ],
      steps: [
        "Choisissez l'outil JSON dont vous avez besoin dans la collection.",
        "Collez ou saisissez vos données JSON dans l'éditeur.",
        "Utilisez les fonctions de l'outil : formater, valider, comparer ou convertir.",
        "Copiez le résultat ou téléchargez-le sous forme de fichier.",
      ],
      faq: [
        { question: "Mes données JSON sont-elles envoyées à un serveur ?", answer: "Non. Tout le traitement JSON se fait entièrement dans votre navigateur. Vos données ne quittent jamais votre appareil." },
        { question: "Quelles fonctionnalités JSON sont prises en charge ?", answer: "Prise en charge complète de la spécification JSON : objets imbriqués, tableaux, chaînes unicode et types numériques." },
      ],
      breadcrumbs: [
        { name: "Accueil", url: "/" },
        { name: "Outils JSON", url: "/json" },
      ],
    },
    it: {
      category: "Strumenti JSON",
      title: "Strumenti JSON online gratuiti – Formatta, valida, confronta e converti | GainUtility",
      description:
        "Usa strumenti JSON gratuiti nel tuo browser. Formatta, valida, minifica, confronta e converti dati JSON all'istante. Veloce, privato, senza caricamenti.",
      intro:
        "Il pacchetto di strumenti JSON di GainUtility aiuta gli sviluppatori a formattare, validare, confrontare e trasformare dati JSON: tutto viene elaborato localmente nel browser. Nessun dato lascia il tuo dispositivo.",
      useCases: [
        { title: "Formatta e abbellisci", desc: "Rendi leggibile il JSON minificato con evidenziazione della sintassi e indentazione personalizzata." },
        { title: "Valida e fai debug", desc: "Trova errori di sintassi con numeri di riga e posizioni dei caratteri per un debug rapido." },
        { title: "Confronta e differenzia", desc: "Confronto affiancato per individuare differenze strutturali tra oggetti JSON." },
        { title: "Converti i dati", desc: "Trasforma JSON in CSV oppure converti CSV/XML nel formato JSON." },
      ],
      steps: [
        "Scegli lo strumento JSON che ti serve dalla collezione.",
        "Incolla o digita i tuoi dati JSON nell'editor.",
        "Usa le funzioni dello strumento: formatta, valida, confronta o converti.",
        "Copia il risultato o scaricalo come file.",
      ],
      faq: [
        { question: "I miei dati JSON vengono inviati a un server?", answer: "No. Tutta l'elaborazione JSON avviene interamente nel tuo browser. I tuoi dati non lasciano mai il tuo dispositivo." },
        { question: "Quali funzioni JSON sono supportate?", answer: "Supporto completo della specifica JSON, inclusi oggetti annidati, array, stringhe unicode e tipi numerici." },
      ],
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Strumenti JSON", url: "/json" },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* Image hub                                                           */
  /* ------------------------------------------------------------------ */
  image: {
    "pt-br": {
      category: "Ferramentas de Imagem",
      title: "Ferramentas de Imagem Online Grátis – Comprima, Redimensione, Converta & Edite | GainUtility",
      description:
        "Use ferramentas de imagem grátis no seu navegador. Comprima, redimensione, recorte, converta, adicione marcas d'água e edite imagens instantaneamente. Rápido, privado, sem uploads.",
      intro:
        "O pacote de ferramentas de imagem da GainUtility processa tudo no seu navegador — sem uploads para servidores. Comprima fotos, redimensione para redes sociais, converta formatos, adicione marcas d'água e muito mais.",
      useCases: [
        { title: "Comprimir para a web", desc: "Reduza o tamanho dos arquivos de imagem para carregar páginas mais rápido, sem perda visível de qualidade." },
        { title: "Redimensionar para redes sociais", desc: "Recorte e redimensione imagens nas dimensões exatas para Instagram, Facebook, LinkedIn e Twitter." },
        { title: "Converter formatos", desc: "Alterne entre JPG, PNG, WebP, AVIF e outros formatos com controle de qualidade." },
        { title: "Proteger com marcas d'água", desc: "Adicione marcas d'água de texto ou logotipo para proteger suas imagens antes de compartilhar." },
      ],
      steps: [
        "Escolha a ferramenta de imagem que você precisa na coleção.",
        "Arraste suas imagens para a área de upload.",
        "Ajuste as opções, como qualidade, dimensões ou formato.",
        "Baixe as imagens processadas individualmente ou em um ZIP.",
      ],
      faq: [
        { question: "Minhas imagens são enviadas a um servidor?", answer: "Não. Todo o processamento de imagem acontece no seu navegador usando a Canvas API. Suas imagens nunca saem do seu dispositivo." },
        { question: "Quais formatos de imagem são suportados?", answer: "Suportamos JPG, JPEG, PNG, WebP, AVIF, BMP, TIFF, GIF e SVG nas nossas ferramentas." },
      ],
      breadcrumbs: [
        { name: "Início", url: "/" },
        { name: "Ferramentas de Imagem", url: "/image" },
      ],
    },
    id: {
      category: "Alat Gambar",
      title: "Alat Gambar Online Gratis — Kompres, Ubah Ukuran, Konversi & Edit | GainUtility",
      description:
        "Gunakan alat gambar gratis di browser Anda. Kompres, ubah ukuran, potong, konversi, beri tanda air, dan edit gambar secara instan. Cepat, pribadi, tanpa unggahan.",
      intro:
        "Perangkat gambar GainUtility memproses semuanya di peramban Anda — tanpa unggahan ke server. Kompres foto, ubah ukuran untuk media sosial, konversi format, tambahkan tanda air, dan banyak lagi.",
      useCases: [
        { title: "Kompres untuk Web", desc: "Kurangi ukuran file gambar untuk pemuatan situs yang lebih cepat tanpa kehilangan kualitas yang terlihat." },
        { title: "Ubah Ukuran untuk Sosmed", desc: "Potong dan ubah ukuran gambar sesuai dimensi untuk Instagram, Facebook, LinkedIn, dan Twitter." },
        { title: "Konversi Format", desc: "Ganti antara JPG, PNG, WebP, AVIF, dan format lain dengan kontrol kualitas." },
        { title: "Lindungi dengan Tanda Air", desc: "Tambahkan tanda air teks atau logo untuk melindungi gambar Anda sebelum dibagikan." },
      ],
      steps: [
        "Pilih alat gambar yang Anda butuhkan dari koleksi.",
        "Seret gambar Anda ke area unggah.",
        "Sesuaikan pengaturan seperti kualitas, dimensi, atau format.",
        "Unduh gambar yang telah diproses satu per satu atau sebagai ZIP.",
      ],
      faq: [
        { question: "Apakah gambar saya diunggah ke server?", answer: "Tidak. Semua pemrosesan gambar terjadi di peramban Anda menggunakan Canvas API. Gambar Anda tidak pernah meninggalkan perangkat Anda." },
        { question: "Format gambar apa yang didukung?", answer: "Kami mendukung format JPG, JPEG, PNG, WebP, AVIF, BMP, TIFF, GIF, dan SVG di seluruh alat kami." },
      ],
      breadcrumbs: [
        { name: "Beranda", url: "/" },
        { name: "Alat Gambar", url: "/image" },
      ],
    },
    "es-mx": {
      category: "Herramientas de Imagen",
      title: "Herramientas de imagen en línea gratis – Comprime, redimensiona, convierte y edita | GainUtility",
      description:
        "Usa herramientas de imagen gratis en tu navegador. Comprime, redimensiona, recorta, convierte, añade marcas de agua y edita imágenes al instante. Rápido, privado, sin subidas.",
      intro:
        "El kit de herramientas de imagen de GainUtility procesa todo en tu navegador: sin subidas a servidores. Comprime fotos, redimensiona para redes sociales, convierte formatos, añade marcas de agua y mucho más.",
      useCases: [
        { title: "Comprimir para la web", desc: "Reduce el tamaño de las imágenes para que los sitios carguen más rápido sin pérdida visible de calidad." },
        { title: "Redimensionar para redes", desc: "Recorta y redimensiona a las dimensiones exactas para Instagram, Facebook, LinkedIn y Twitter." },
        { title: "Convertir formatos", desc: "Cambia entre JPG, PNG, WebP, AVIF y otros formatos con control de calidad." },
        { title: "Proteger con marcas de agua", desc: "Añade marcas de agua de texto o logotipo para proteger tus imágenes antes de compartirlas." },
      ],
      steps: [
        "Elige la herramienta de imagen que necesites de la colección.",
        "Arrastra tus imágenes a la zona de carga.",
        "Ajusta opciones como calidad, dimensiones o formato.",
        "Descarga las imágenes procesadas por separado o en un ZIP.",
      ],
      faq: [
        { question: "¿Mis imágenes se suben a un servidor?", answer: "No. Todo el procesamiento de imágenes ocurre en tu navegador usando la API Canvas. Tus imágenes nunca salen de tu dispositivo." },
        { question: "¿Qué formatos de imagen se admiten?", answer: "Admitimos JPG, JPEG, PNG, WebP, AVIF, BMP, TIFF, GIF y SVG en nuestras herramientas." },
      ],
      breadcrumbs: [
        { name: "Inicio", url: "/" },
        { name: "Herramientas de Imagen", url: "/image" },
      ],
    },
    de: {
      category: "Bildwerkzeuge",
      title: "Kostenlose Online-Bildtools – Komprimieren, Skalieren, Konvertieren & Bearbeiten | GainUtility",
      description:
        "Nutzen Sie kostenlose Bildtools im Browser. Bilder komprimieren, skalieren, zuschneiden, konvertieren, mit Wasserzeichen versehen und bearbeiten. Schnell, privat, keine Uploads.",
      intro:
        "Das Bildtoolkit von GainUtility verarbeitet alles im Browser – keine Uploads auf einen Server. Fotos komprimieren, für soziale Medien skalieren, Formate konvertieren, Wasserzeichen hinzufügen und vieles mehr.",
      useCases: [
        { title: "Für das Web komprimieren", desc: "Bilddateien verkleinern, damit Seiten schneller laden, ohne sichtbaren Qualitätsverlust." },
        { title: "Für Social Media skalieren", desc: "Bilder exakt auf die Maße für Instagram, Facebook, LinkedIn und Twitter zuschneiden und skalieren." },
        { title: "Formate konvertieren", desc: "Zwischen JPG, PNG, WebP, AVIF und anderen Formaten mit Qualitätskontrolle wechseln." },
        { title: "Mit Wasserzeichen schützen", desc: "Text- oder Logo-Wasserzeichen hinzufügen, um Bilder vor dem Teilen zu schützen." },
      ],
      steps: [
        "Wählen Sie das benötigte Bildtool aus der Sammlung.",
        "Ziehen Sie Ihre Bilder in den Upload-Bereich.",
        "Stellen Sie Qualität, Maße oder Format ein.",
        "Laden Sie die bearbeiteten Bilder einzeln oder als ZIP herunter.",
      ],
      faq: [
        { question: "Werden meine Bilder auf einen Server hochgeladen?", answer: "Nein. Die gesamte Bildverarbeitung läuft über die Canvas API im Browser. Ihre Bilder verlassen Ihr Gerät nie." },
        { question: "Welche Bildformate werden unterstützt?", answer: "Wir unterstützen JPG, JPEG, PNG, WebP, AVIF, BMP, TIFF, GIF und SVG in unseren Tools." },
      ],
      breadcrumbs: [
        { name: "Startseite", url: "/" },
        { name: "Bildwerkzeuge", url: "/image" },
      ],
    },
    fr: {
      category: "Outils d'image",
      title: "Outils d'image en ligne gratuits – Comprimer, redimensionner, convertir et éditer | GainUtility",
      description:
        "Utilisez des outils d'image gratuits dans votre navigateur. Compressez, redimensionnez, recadrez, convertissez, filigranez et éditez des images instantanément. Rapide, privé, sans envoi.",
      intro:
        "La suite d'outils d'image de GainUtility traite tout dans votre navigateur, sans envoi vers un serveur. Compressez des photos, redimensionnez pour les réseaux sociaux, convertissez des formats, ajoutez des filigranes et bien plus encore.",
      useCases: [
        { title: "Compresser pour le web", desc: "Réduisez la taille des images pour des pages plus rapides sans perte visible de qualité." },
        { title: "Redimensionner pour les réseaux", desc: "Recadrez et redimensionnez aux dimensions exactes pour Instagram, Facebook, LinkedIn et Twitter." },
        { title: "Convertir des formats", desc: "Basculez entre JPG, PNG, WebP, AVIF et d'autres formats avec contrôle de la qualité." },
        { title: "Protéger avec des filigranes", desc: "Ajoutez des filigranes texte ou logo pour protéger vos images avant de les partager." },
      ],
      steps: [
        "Choisissez l'outil d'image dont vous avez besoin dans la collection.",
        "Déposez vos images dans la zone d'envoi.",
        "Réglez la qualité, les dimensions ou le format.",
        "Téléchargez les images traitées individuellement ou dans un ZIP.",
      ],
      faq: [
        { question: "Mes images sont-elles envoyées sur un serveur ?", answer: "Non. Tout le traitement d'image se fait dans votre navigateur via l'API Canvas. Vos images ne quittent jamais votre appareil." },
        { question: "Quels formats d'image sont pris en charge ?", answer: "Nous prenons en charge JPG, JPEG, PNG, WebP, AVIF, BMP, TIFF, GIF et SVG dans nos outils." },
      ],
      breadcrumbs: [
        { name: "Accueil", url: "/" },
        { name: "Outils d'image", url: "/image" },
      ],
    },
    it: {
      category: "Strumenti Immagine",
      title: "Strumenti immagine online gratuiti – Comprimi, ridimensiona, converti e modifica | GainUtility",
      description:
        "Usa strumenti immagine gratuiti nel tuo browser. Comprimi, ridimensiona, ritaglia, converti, applica filigrane e modifica immagini all'istante. Veloce, privato, senza caricamenti.",
      intro:
        "Il pacchetto di strumenti immagine di GainUtility elabora tutto nel browser, senza caricamenti su server. Comprimi foto, ridimensiona per i social, converti formati, aggiungi filigrane e molto altro.",
      useCases: [
        { title: "Comprimi per il web", desc: "Riduci le dimensioni dei file immagine per siti più veloci senza perdita visibile di qualità." },
        { title: "Ridimensiona per i social", desc: "Ritaglia e ridimensiona alle dimensioni esatte per Instagram, Facebook, LinkedIn e Twitter." },
        { title: "Converti formati", desc: "Passa tra JPG, PNG, WebP, AVIF e altri formati con controllo della qualità." },
        { title: "Proteggi con filigrane", desc: "Aggiungi filigrane di testo o logo per proteggere le tue immagini prima di condividerle." },
      ],
      steps: [
        "Scegli lo strumento immagine che ti serve dalla collezione.",
        "Trascina le tue immagini nella zona di caricamento.",
        "Regola qualità, dimensioni o formato.",
        "Scarica le immagini elaborate singolarmente o in un file ZIP.",
      ],
      faq: [
        { question: "Le mie immagini vengono caricate su un server?", answer: "No. Tutta l'elaborazione delle immagini avviene nel browser tramite la Canvas API. Le tue immagini non lasciano mai il tuo dispositivo." },
        { question: "Quali formati immagine sono supportati?", answer: "Supportiamo JPG, JPEG, PNG, WebP, AVIF, BMP, TIFF, GIF e SVG nei nostri strumenti." },
      ],
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Strumenti Immagine", url: "/image" },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* CSS hub                                                             */
  /* ------------------------------------------------------------------ */
  css: {
    "pt-br": {
      category: "Ferramentas de CSS",
      title: "Ferramentas de CSS Online Grátis – Gradientes, Sombras e Utilitários de Design | GainUtility",
      description:
        "Use ferramentas de CSS grátis no seu navegador. Gere gradientes, sombras, raios de borda, verifique contraste e explore sistemas de design. Sem uploads.",
      intro:
        "O conjunto de ferramentas CSS da GainUtility ajuda designers e desenvolvedores a criar efeitos visuais para páginas e interfaces. Gere gradientes, construa sombras em camadas, crie padrões de raio de borda e verifique acessibilidade de cores — tudo com visualização em tempo real.",
      useCases: [
        { title: "Design de gradientes", desc: "Crie gradientes lineares e radiais com várias paradas de cor, embaralhe paletas e exporte como CSS ou PNG." },
        { title: "Construção de sombras", desc: "Monte sombras box multiplicadas com controles de deslocamento, desfoque, expansão e cor." },
        { title: "Verificação de acessibilidade", desc: "Confirme se as combinações de cores atendem aos padrões de contraste WCAG AA e AAA." },
      ],
      steps: [
        "Escolha a ferramenta de CSS que você precisa na coleção.",
        "Ajuste os parâmetros usando os controles interativos.",
        "Visualize as mudanças em tempo real.",
        "Copie o código CSS gerado ou exporte os recursos.",
      ],
      faq: [
        { question: "Posso exportar código CSS?", answer: "Sim. Todas as ferramentas de CSS geram código pronto para copiar. Algumas ferramentas também suportam aproximações de classes Tailwind CSS e exportação de PNG." },
      ],
      breadcrumbs: [
        { name: "Início", url: "/" },
        { name: "Ferramentas de CSS", url: "/css" },
      ],
    },
    id: {
      category: "Alat CSS",
      title: "Alat CSS Online Gratis — Gradien, Bayangan & Utilitas Desain | GainUtility",
      description:
        "Gunakan alat CSS gratis di browser Anda. Buat gradien, bayangan kotak, radius sudut, periksa kontras, dan jelajahi sistem desain. Tanpa unggahan.",
      intro:
        "Perangkat CSS GainUtility membantu desainer dan pengembang membuat efek visual untuk halaman dan antarmuka. Buat gradien, susun bayangan berlapis, rancang pola radius sudut, dan periksa aksesibilitas warna — semuanya dengan pratinjau langsung.",
      useCases: [
        { title: "Desain Gradien", desc: "Buat gradien linier dan radial dengan banyak titik warna, acak palet, dan ekspor sebagai CSS atau PNG." },
        { title: "Konstruksi Bayangan", desc: "Bangun bayangan kotak berlapis dengan kontrol offset, blur, spread, dan warna khusus." },
        { title: "Pemeriksaan Aksesibilitas", desc: "Verifikasi kombinasi warna memenuhi standar kontras WCAG AA dan AAA." },
      ],
      steps: [
        "Pilih alat CSS yang Anda butuhkan dari koleksi.",
        "Sesuaikan parameter menggunakan kontrol interaktif.",
        "Lihat perubahan secara real-time.",
        "Salin kode CSS yang dihasilkan atau ekspor aset.",
      ],
      faq: [
        { question: "Bisakah saya mengekspor kode CSS?", answer: "Ya. Semua alat CSS menghasilkan kode CSS siap salin. Beberapa alat juga mendukung perkiraan kelas Tailwind CSS dan ekspor PNG." },
      ],
      breadcrumbs: [
        { name: "Beranda", url: "/" },
        { name: "Alat CSS", url: "/css" },
      ],
    },
    "es-mx": {
      category: "Herramientas de CSS",
      title: "Herramientas CSS en línea gratis – Gradientes, sombras y utilidades de diseño | GainUtility",
      description:
        "Usa herramientas CSS gratis en tu navegador. Genera gradientes, sombras, radios de borde, comprueba el contraste y explora sistemas de diseño. Sin subidas.",
      intro:
        "El conjunto de herramientas CSS de GainUtility ayuda a diseñadores y desarrolladores a crear efectos visuales para páginas e interfaces. Genera gradientes, construye sombras multicapa, diseña patrones de radio de borde y verifica la accesibilidad del color, todo con vista previa en vivo.",
      useCases: [
        { title: "Diseño de gradientes", desc: "Crea gradientes lineales y radiales con múltiples paradas, aleatoriza paletas y exporta como CSS o PNG." },
        { title: "Construcción de sombras", desc: "Crea sombras de caja multicapa con controles de desplazamiento, desenfoque, expansión y color." },
        { title: "Verificación de accesibilidad", desc: "Comprueba que las combinaciones de color cumplan los estándares de contraste WCAG AA y AAA." },
      ],
      steps: [
        "Elige la herramienta CSS que necesites de la colección.",
        "Ajusta los parámetros con los controles interactivos.",
        "Previsualiza los cambios en tiempo real.",
        "Copia el código CSS generado o exporta los recursos.",
      ],
      faq: [
        { question: "¿Puedo exportar código CSS?", answer: "Sí. Todas las herramientas CSS generan código listo para copiar. Algunas también admiten aproximaciones de clases Tailwind CSS y exportación PNG." },
      ],
      breadcrumbs: [
        { name: "Inicio", url: "/" },
        { name: "Herramientas de CSS", url: "/css" },
      ],
    },
    de: {
      category: "CSS-Werkzeuge",
      title: "Kostenlose Online-CSS-Tools – Verläufe, Schatten & Design-Utilities | GainUtility",
      description:
        "Nutzen Sie kostenlose CSS-Tools im Browser. Verläufe, Box-Schatten, Rahmenradien erzeugen, Kontrast prüfen und Designsysteme erkunden. Keine Uploads.",
      intro:
        "Das CSS-Toolset von GainUtility hilft Designer:innen und Entwickler:innen, visuelle Effekte für Seiten und Oberflächen zu erstellen. Verläufe generieren, mehrschichtige Schatten bauen, Border-Radius-Muster gestalten und Farbzugänglichkeit prüfen – alles mit Live-Vorschau.",
      useCases: [
        { title: "Verlaufsdesign", desc: "Lineare und radiale Verläufe mit mehreren Farbstopps erstellen, Paletten mischen und als CSS oder PNG exportieren." },
        { title: "Schattenkonstruktion", desc: "Mehrschichtige Box-Schatten mit Offset-, Unschärfe-, Verteilungs- und Farbsteuerung zusammenstellen." },
        { title: "Zugänglichkeit prüfen", desc: "Prüfen, ob Farbkombinationen die Kontraststandards WCAG AA und AAA erfüllen." },
      ],
      steps: [
        "Wählen Sie das benötigte CSS-Tool aus der Sammlung.",
        "Passen Sie die Parameter mit den interaktiven Steuerelementen an.",
        "Sehen Sie Änderungen in Echtzeit.",
        "Kopieren Sie den generierten CSS-Code oder exportieren Sie Assets.",
      ],
      faq: [
        { question: "Kann ich CSS-Code exportieren?", answer: "Ja. Alle CSS-Tools erzeugen kopierfertigen CSS-Code. Einige Tools unterstützen auch Näherungen für Tailwind-CSS-Klassen und PNG-Export." },
      ],
      breadcrumbs: [
        { name: "Startseite", url: "/" },
        { name: "CSS-Werkzeuge", url: "/css" },
      ],
    },
    fr: {
      category: "Outils CSS",
      title: "Outils CSS en ligne gratuits – Dégradés, ombres et utilitaires de design | GainUtility",
      description:
        "Utilisez des outils CSS gratuits dans votre navigateur. Générer des dégradés, des ombres portées, des rayons de bordure, vérifier le contraste et explorer des systèmes de design. Sans envoi.",
      intro:
        "La suite d'outils CSS de GainUtility aide designers et développeurs à créer des effets visuels pour des pages et des interfaces. Générer des dégradés, construire des ombres multicouches, concevoir des rayons de bordure et vérifier l'accessibilité des couleurs, le tout avec un aperçu en direct.",
      useCases: [
        { title: "Design de dégradés", desc: "Créez des dégradés linéaires et radiaux avec plusieurs points de couleur, mélangez des palettes et exportez en CSS ou PNG." },
        { title: "Construction d'ombres", desc: "Composez des ombres de boîte multicouches avec réglages d'offset, de flou, d'extension et de couleur." },
        { title: "Vérification d'accessibilité", desc: "Vérifiez que les combinaisons de couleurs respectent les normes de contraste WCAG AA et AAA." },
      ],
      steps: [
        "Choisissez l'outil CSS dont vous avez besoin dans la collection.",
        "Réglez les paramètres avec les contrôles interactifs.",
        "Apercevez les changements en temps réel.",
        "Copiez le code CSS généré ou exportez les ressources.",
      ],
      faq: [
        { question: "Puis-je exporter du code CSS ?", answer: "Oui. Tous les outils CSS génèrent du code prêt à copier. Certains outils prennent aussi en charge des approximations de classes Tailwind CSS et l'export PNG." },
      ],
      breadcrumbs: [
        { name: "Accueil", url: "/" },
        { name: "Outils CSS", url: "/css" },
      ],
    },
    it: {
      category: "Strumenti CSS",
      title: "Strumenti CSS online gratuiti – Gradient, ombre e utility di design | GainUtility",
      description:
        "Usa strumenti CSS gratuiti nel tuo browser. Genera gradient, ombre, raggi di bordo, controlla il contrasto ed esplora sistemi di design. Senza caricamenti.",
      intro:
        "Il pacchetto di strumenti CSS di GainUtility aiuta designer e sviluppatori a creare effetti visivi per pagine e interfacce. Genera gradient, costruisci ombre multistrato, disegna pattern di raggio del bordo e verifica l'accessibilità dei colori, tutto con anteprima dal vivo.",
      useCases: [
        { title: "Design di gradient", desc: "Crea gradient lineari e radiali con più stop di colore, mescola le palette ed esporta come CSS o PNG." },
        { title: "Costruzione di ombre", desc: "Componi ombre box multistrato con controlli di offset, sfocatura, espansione e colore." },
        { title: "Verifica accessibilità", desc: "Verifica che le combinazioni di colori rispettino gli standard di contrasto WCAG AA e AAA." },
      ],
      steps: [
        "Scegli lo strumento CSS che ti serve dalla collezione.",
        "Regola i parametri con i controlli interattivi.",
        "Anteprima le modifiche in tempo reale.",
        "Copia il codice CSS generato o esporta le risorse.",
      ],
      faq: [
        { question: "Posso esportare il codice CSS?", answer: "Sì. Tutti gli strumenti CSS generano codice pronto da copiare. Alcuni strumenti supportano anche approssimazioni delle classi Tailwind CSS ed esportazione PNG." },
      ],
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Strumenti CSS", url: "/css" },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* Developer hub                                                       */
  /* ------------------------------------------------------------------ */
  dev: {
    "pt-br": {
      category: "Ferramentas para Desenvolvedores",
      title: "Ferramentas Online Grátis para Desenvolvedores – QR, Base64, UUID, Regex e Mais | GainUtility",
      description:
        "Use ferramentas grátis para desenvolvedores no seu navegador. Gere QR codes, codifique Base64, crie UUIDs, teste expressões regulares e muito mais. Rápido, privado, sem uploads.",
      intro:
        "O conjunto de ferramentas para desenvolvedores da GainUtility oferece utilitários essenciais para as tarefas do dia a dia de desenvolvimento. Gere QR codes, codifique e decodifique Base64 e URLs, crie UUIDs, decodifique JWTs, teste padrões de regex e muito mais — tudo processado localmente.",
      useCases: [
        { title: "Geração de QR codes", desc: "Crie QR codes estilizados para URLs, WiFi, e-mail, WhatsApp e contatos vCard." },
        { title: "Codificação de dados", desc: "Codifique e decodifique Base64, codificação percentual de URL e entidades HTML." },
        { title: "Geração de identificadores", desc: "Gere UUIDs (v1, v4, v7), hashes e crie senhas seguras." },
        { title: "Utilitários de código", desc: "Teste padrões de regex, formate SQL/YAML e monte expressões cron." },
      ],
      steps: [
        "Escolha a ferramenta para desenvolvedores que você precisa na coleção.",
        "Digite seus dados de entrada.",
        "Configure opções ou configurações.",
        "Copie a saída ou baixe os resultados.",
      ],
      faq: [
        { question: "Essas ferramentas são adequadas para uso em produção?", answer: "Nossas ferramentas são feitas para desenvolvimento, testes e depuração. Para ferramentas de segurança em produção, como geração de senhas, use sempre bibliotecas consolidadas." },
      ],
      breadcrumbs: [
        { name: "Início", url: "/" },
        { name: "Ferramentas para Desenvolvedores", url: "/dev" },
      ],
    },
    id: {
      category: "Alat Developer",
      title: "Alat Developer Online Gratis — QR, Base64, UUID, Regex & Lainnya | GainUtility",
      description:
        "Gunakan alat developer gratis di browser Anda. Buat kode QR, enkode Base64, buat UUID, uji regex, dan banyak lagi. Cepat, pribadi, tanpa unggahan.",
      intro:
        "Perangkat developer GainUtility menyediakan utilitas penting untuk tugas pengembangan sehari-hari. Buat kode QR, enkode/dekode Base64 dan URL, buat UUID, dekode JWT, uji pola regex, dan banyak lagi — semuanya diproses secara lokal.",
      useCases: [
        { title: "Pembuatan Kode QR", desc: "Buat kode QR bergaya untuk URL, WiFi, email, WhatsApp, dan kontak vCard." },
        { title: "Enkode Data", desc: "Enkode dan dekode Base64, persen-encoding URL, dan entitas HTML." },
        { title: "Pembuatan Identitas", desc: "Buat UUID (v1, v4, v7), hash string, dan buat kata sandi yang aman." },
        { title: "Utilitas Kode", desc: "Uji pola regex, format SQL/YAML, dan susun ekspresi cron." },
      ],
      steps: [
        "Pilih alat developer yang Anda butuhkan dari koleksi.",
        "Masukkan data masukan Anda.",
        "Konfigurasikan pengaturan atau opsi apa pun.",
        "Salin keluaran atau unduh hasilnya.",
      ],
      faq: [
        { question: "Apakah alat ini cocok untuk penggunaan produksi?", answer: "Alat kami dirancang untuk pengembangan, pengujian, dan debugging. Untuk alat keamanan produksi seperti pembuatan kata sandi, selalu gunakan pustaka yang mapan." },
      ],
      breadcrumbs: [
        { name: "Beranda", url: "/" },
        { name: "Alat Developer", url: "/dev" },
      ],
    },
    "es-mx": {
      category: "Herramientas para Desarrolladores",
      title: "Herramientas gratis en línea para desarrolladores – QR, Base64, UUID, regex y más | GainUtility",
      description:
        "Usa herramientas gratis para desarrolladores en tu navegador. Genera códigos QR, codifica Base64, crea UUID, prueba regex y mucho más. Rápido, privado, sin subidas.",
      intro:
        "El kit de herramientas para desarrolladores de GainUtility ofrece utilidades esenciales para las tareas diarias de desarrollo. Genera códigos QR, codifica y decodifica Base64 y URLs, crea UUID, decodifica JWT, prueba patrones regex y mucho más: todo se procesa localmente.",
      useCases: [
        { title: "Generación de códigos QR", desc: "Crea códigos QR con estilo para URLs, WiFi, correo, WhatsApp y contactos vCard." },
        { title: "Codificación de datos", desc: "Codifica y decodifica Base64, codificación percentual de URLs y entidades HTML." },
        { title: "Generación de identidades", desc: "Genera UUID (v1, v4, v7), hashes y crea contraseñas seguras." },
        { title: "Utilidades de código", desc: "Prueba patrones regex, formatea SQL/YAML y construye expresiones cron." },
      ],
      steps: [
        "Elige la herramienta para desarrolladores que necesites de la colección.",
        "Introduce tus datos de entrada.",
        "Configura las opciones o ajustes.",
        "Copia el resultado o descarga los resultados.",
      ],
      faq: [
        { question: "¿Estas herramientas son aptas para producción?", answer: "Nuestras herramientas están pensadas para desarrollo, pruebas y depuración. Para herramientas de seguridad en producción, como la generación de contraseñas, usa siempre librerías consolidadas." },
      ],
      breadcrumbs: [
        { name: "Inicio", url: "/" },
        { name: "Herramientas para Desarrolladores", url: "/dev" },
      ],
    },
    de: {
      category: "Entwicklerwerkzeuge",
      title: "Kostenlose Online-Entwicklertools – QR, Base64, UUID, Regex & mehr | GainUtility",
      description:
        "Nutzen Sie kostenlose Entwicklertools im Browser. QR-Codes erstellen, Base64 kodieren, UUIDs generieren, Regex testen und mehr. Schnell, privat, keine Uploads.",
      intro:
        "Das Entwickler-Toolkit von GainUtility bietet wesentliche Hilfsmittel für alltägliche Entwicklungsaufgaben. QR-Codes erstellen, Base64 und URLs kodieren/dekodieren, UUIDs generieren, JWTs entschlüsseln, Regex-Muster testen und mehr – alles wird lokal verarbeitet.",
      useCases: [
        { title: "QR-Code-Erstellung", desc: "Gestaltete QR-Codes für URLs, WLAN, E-Mail, WhatsApp und vCard-Kontakte erstellen." },
        { title: "Datenkodierung", desc: "Base64, URL-Prozentkodierung und HTML-Entities kodieren und dekodieren." },
        { title: "Identitätserzeugung", desc: "UUIDs (v1, v4, v7) generieren, Strings hashen und sichere Passwörter erstellen." },
        { title: "Code-Utilities", desc: "Regex-Muster testen, SQL/YAML formatieren und Cron-Ausdrücke bauen." },
      ],
      steps: [
        "Wählen Sie das benötigte Entwicklertool aus der Sammlung.",
        "Geben Sie Ihre Eingabedaten ein.",
        "Konfigurieren Sie alle Einstellungen oder Optionen.",
        "Kopieren Sie die Ausgabe oder laden Sie die Ergebnisse herunter.",
      ],
      faq: [
        { question: "Sind diese Tools für den Produktiveinsatz geeignet?", answer: "Unsere Tools sind für Entwicklung, Tests und Debugging gedacht. Verwenden Sie für Sicherheitstools in der Produktion, etwa zur Passworterstellung, immer etablierte Bibliotheken." },
      ],
      breadcrumbs: [
        { name: "Startseite", url: "/" },
        { name: "Entwicklerwerkzeuge", url: "/dev" },
      ],
    },
    fr: {
      category: "Outils pour développeurs",
      title: "Outils gratuits en ligne pour développeurs – QR, Base64, UUID, regex et plus | GainUtility",
      description:
        "Utilisez des outils gratuits pour développeurs dans votre navigateur. Générez des codes QR, encodez en Base64, créez des UUID, testez des regex et plus encore. Rapide, privé, sans envoi.",
      intro:
        "La suite d'outils pour développeurs de GainUtility fournit des utilitaires essentiels pour les tâches de développement courantes. Générez des codes QR, encodez/décodez le Base64 et les URLs, créez des UUID, décodez des JWT, testez des motifs regex et plus encore, le tout traité localement.",
      useCases: [
        { title: "Génération de codes QR", desc: "Créez des codes QR stylisés pour URLs, WiFi, e-mail, WhatsApp et contacts vCard." },
        { title: "Encodage de données", desc: "Encodez et décodez le Base64, l'encodage pourcent des URLs et les entités HTML." },
        { title: "Génération d'identités", desc: "Générez des UUID (v1, v4, v7), hachez des chaînes et créez des mots de passe sécurisés." },
        { title: "Utilitaires de code", desc: "Testez des motifs regex, formatez du SQL/YAML et construisez des expressions cron." },
      ],
      steps: [
        "Choisissez l'outil pour développeurs dont vous avez besoin dans la collection.",
        "Saisissez vos données d'entrée.",
        "Configurez les options ou réglages.",
        "Copiez la sortie ou téléchargez les résultats.",
      ],
      faq: [
        { question: "Ces outils conviennent-ils à une utilisation en production ?", answer: "Nos outils sont conçus pour le développement, les tests et le débogage. Pour les outils de sécurité en production, comme la génération de mots de passe, utilisez toujours des bibliothèques éprouvées." },
      ],
      breadcrumbs: [
        { name: "Accueil", url: "/" },
        { name: "Outils pour développeurs", url: "/dev" },
      ],
    },
    it: {
      category: "Strumenti per sviluppatori",
      title: "Strumenti gratuiti online per sviluppatori – QR, Base64, UUID, regex e altro | GainUtility",
      description:
        "Usa strumenti gratuiti per sviluppatori nel tuo browser. Genera codici QR, codifica Base64, crea UUID, prova le regex e molto altro. Veloce, privato, senza caricamenti.",
      intro:
        "Il pacchetto di strumenti per sviluppatori di GainUtility offre utility essenziali per le attività di sviluppo quotidiane. Genera codici QR, codifica/decodifica Base64 e URL, crea UUID, decodifica JWT, prova modelli regex e molto altro: tutto elaborato localmente.",
      useCases: [
        { title: "Generazione di codici QR", desc: "Crea codici QR stilizzati per URL, WiFi, e-mail, WhatsApp e contatti vCard." },
        { title: "Codifica dei dati", desc: "Codifica e decodifica Base64, percent-encoding di URL ed entità HTML." },
        { title: "Generazione di identità", desc: "Genera UUID (v1, v4, v7), hash di stringhe e crea password sicure." },
        { title: "Utility di codice", desc: "Prova modelli regex, formatta SQL/YAML e costruisci espressioni cron." },
      ],
      steps: [
        "Scegli lo strumento per sviluppatori che ti serve dalla collezione.",
        "Inserisci i tuoi dati di input.",
        "Configura impostazioni o opzioni.",
        "Copia l'output o scarica i risultati.",
      ],
      faq: [
        { question: "Questi strumenti sono adatti alla produzione?", answer: "I nostri strumenti sono pensati per sviluppo, test e debug. Per gli strumenti di sicurezza in produzione, come la generazione di password, usa sempre librerie consolidate." },
      ],
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Strumenti per sviluppatori", url: "/dev" },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  /* SEO hub                                                             */
  /* ------------------------------------------------------------------ */
  seo: {
    "pt-br": {
      category: "Ferramentas de SEO",
      title: "Ferramentas de SEO Online Grátis – Meta Tags, Schema, Sitemaps e Mais | GainUtility",
      description:
        "Use ferramentas de SEO grátis no seu navegador. Gere meta tags, cards Open Graph, schema markup, sitemaps, robots.txt e previews de SERP. Rápido e privado.",
      intro:
        "O pacote de SEO da GainUtility ajuda você a controlar exatamente como os mecanismos de busca veem suas páginas. Gere títulos e descrições otimizados, crie schema markup JSON-LD, gere sitemaps XML e regras de robots.txt, visualize snippets de SERP e acompanhe campanhas com links UTM — tudo processado localmente no seu navegador.",
      useCases: [
        { title: "SEO on-page", desc: "Gere title tags, meta descriptions e URLs canônicas otimizadas dentro dos limites de tamanho dos mecanismos de busca." },
        { title: "Resultados ricos", desc: "Crie schema markup JSON-LD para produtos, artigos, FAQs e entidades de organização." },
        { title: "Controle de rastreamento", desc: "Monte diretivas de robots.txt e sitemaps XML para guiar os bots de busca pelo seu site." },
        { title: "Compartilhamento social", desc: "Crie metadados Open Graph e Twitter Card para pré-visualizações de links caprichadas." },
      ],
      steps: [
        "Escolha a ferramenta de SEO que você precisa na coleção.",
        "Digite a URL da sua página, o título e os detalhes do conteúdo.",
        "Configure as opções, desde limites de caracteres até tipos de dados estruturados.",
        "Copie as tags, o markup ou os arquivos gerados para o seu site.",
      ],
      faq: [
        { question: "Essas ferramentas de SEO são grátis?", answer: "Sim, todas as ferramentas de SEO são gratuitas e rodam inteiramente no seu navegador — sem contas, uploads ou assinaturas." },
        { question: "Vocês verificam posições de busca ao vivo?", answer: "Não. Nossas ferramentas geram ativos de SEO (meta tags, schema, sitemaps). Elas não consultam mecanismos de busca por dados de classificação." },
        { question: "Posso usar o código gerado diretamente em produção?", answer: "Sim. Toda a saída é pronta para produção. Copie as meta tags, o JSON-LD ou o XML diretamente para o head do seu HTML ou arquivos de configuração." },
      ],
      breadcrumbs: [
        { name: "Início", url: "/" },
        { name: "Ferramentas de SEO", url: "/seo" },
      ],
    },
    id: {
      category: "Alat SEO",
      title: "Alat SEO Online Gratis — Meta Tag, Schema, Sitemap & Lainnya | GainUtility",
      description:
        "Gunakan alat SEO gratis di browser Anda. Buat meta tag, kartu Open Graph, markup schema, sitemap, robots.txt, dan pratinjau SERP. Cepat dan pribadi.",
      intro:
        "Perangkat SEO GainUtility membantu Anda mengontrol persis bagaimana mesin telusur melihat halaman Anda. Buat judul dan deskripsi meta yang dioptimalkan, bangun markup schema JSON-LD, buat sitemap XML dan aturan robots.txt, pratinjau cuplikan SERP, dan lacak kampanye dengan tautan UTM — semuanya diproses secara lokal di peramban Anda.",
      useCases: [
        { title: "SEO On-Page", desc: "Buat title tag, meta description, dan URL kanonis yang dioptimalkan sesuai batas panjang mesin telusur." },
        { title: "Hasil Kaya", desc: "Buat markup schema JSON-LD untuk produk, artikel, FAQ, dan entitas organisasi." },
        { title: "Kontrol Perayapan", desc: "Susun direktif robots.txt dan sitemap XML untuk memandu bot telusur di situs Anda." },
        { title: "Berbagi Sosial", desc: "Susun metadata Open Graph dan Twitter Card untuk pratinjau tautan yang rapi." },
      ],
      steps: [
        "Pilih alat SEO yang Anda butuhkan dari koleksi.",
        "Masukkan URL halaman, judul, dan detail konten Anda.",
        "Konfigurasikan pengaturan, dari batas karakter hingga jenis data terstruktur.",
        "Salin tag, markup, atau file yang dihasilkan ke situs Anda.",
      ],
      faq: [
        { question: "Apakah alat SEO ini gratis?", answer: "Ya, setiap alat SEO gratis digunakan dan berjalan sepenuhnya di peramban Anda — tanpa akun, unggahan, atau langganan." },
        { question: "Apakah Anda memeriksa peringkat pencarian langsung?", answer: "Tidak. Alat kami menghasilkan aset SEO (meta tag, schema, sitemap). Alat tersebut tidak menanyakan data peringkat ke mesin telusur." },
        { question: "Bisakah saya menggunakan kode yang dihasilkan langsung di produksi?", answer: "Ya. Semua keluaran siap produksi. Salin meta tag, JSON-LD, atau XML langsung ke head HTML atau file konfigurasi Anda." },
      ],
      breadcrumbs: [
        { name: "Beranda", url: "/" },
        { name: "Alat SEO", url: "/seo" },
      ],
    },
    "es-mx": {
      category: "Herramientas de SEO",
      title: "Herramientas SEO en línea gratis – Meta tags, Schema, sitemaps y más | GainUtility",
      description:
        "Usa herramientas SEO gratis en tu navegador. Genera meta tags, tarjetas Open Graph, schema markup, sitemaps, robots.txt y vistas previas SERP. Rápido y privado.",
      intro:
        "El kit de SEO de GainUtility te ayuda a controlar exactamente cómo ven tus páginas los motores de búsqueda. Genera títulos y descripciones optimizados, crea schema markup JSON-LD, genera sitemaps XML y reglas robots.txt, previsualiza fragmentos SERP y mide campañas con enlaces UTM: todo se procesa localmente en tu navegador.",
      useCases: [
        { title: "SEO on-page", desc: "Genera title tags, meta descriptions y URLs canónicas optimizadas dentro de los límites de caracteres de los buscadores." },
        { title: "Resultados enriquecidos", desc: "Crea schema markup JSON-LD para productos, artículos, FAQs y entidades de organización." },
        { title: "Control de rastreo", desc: "Construye directivas robots.txt y sitemaps XML para guiar a los bots de búsqueda por tu sitio." },
        { title: "Compartir en redes", desc: "Crea metadatos Open Graph y Twitter Card para vistas previas de enlaces pulidas." },
      ],
      steps: [
        "Elige la herramienta SEO que necesites de la colección.",
        "Introduce la URL de tu página, el título y los detalles del contenido.",
        "Configura las opciones, desde límites de caracteres hasta tipos de datos estructurados.",
        "Copia las etiquetas, el markup o los archivos generados en tu sitio.",
      ],
      faq: [
        { question: "¿Estas herramientas SEO son gratis?", answer: "Sí, todas las herramientas SEO son gratuitas y funcionan por completo en tu navegador: sin cuentas, subidas ni suscripciones." },
        { question: "¿Comprueban posiciones de búsqueda en vivo?", answer: "No. Nuestras herramientas generan activos SEO (meta tags, schema, sitemaps). No consultan a los buscadores por datos de clasificación." },
        { question: "¿Puedo usar el código generado directamente en producción?", answer: "Sí. Toda la salida está lista para producción. Copia las meta tags, el JSON-LD o el XML directamente en el head de tu HTML o en los archivos de configuración." },
      ],
      breadcrumbs: [
        { name: "Inicio", url: "/" },
        { name: "Herramientas de SEO", url: "/seo" },
      ],
    },
    de: {
      category: "SEO-Werkzeuge",
      title: "Kostenlose Online-SEO-Tools – Meta-Tags, Schema, Sitemaps & mehr | GainUtility",
      description:
        "Nutzen Sie kostenlose SEO-Tools im Browser. Meta-Tags, Open-Graph-Karten, Schema-Markup, Sitemaps, robots.txt und SERP-Vorschauen erstellen. Schnell und privat.",
      intro:
        "Das SEO-Toolkit von GainUtility hilft Ihnen, genau zu steuern, wie Suchmaschinen Ihre Seiten sehen. Generieren Sie optimierte Title-Tags und Meta-Beschreibungen, bauen Sie JSON-LD-Schema-Markup, erstellen Sie XML-Sitemaps und robots.txt-Regeln, sehen Sie sich SERP-Snippets an und verfolgen Sie Kampagnen mit UTM-Links – alles wird lokal in Ihrem Browser verarbeitet.",
      useCases: [
        { title: "On-Page-SEO", desc: "Optimierte Title-Tags, Meta-Descriptions und kanonische URLs innerhalb der Zeichenlimits der Suchmaschinen erstellen." },
        { title: "Rich Results", desc: "JSON-LD-Schema-Markup für Produkte, Artikel, FAQs und Organisationen erstellen." },
        { title: "Crawl-Kontrolle", desc: "robots.txt-Direktiven und XML-Sitemaps bauen, um Suchbots durch Ihre Seite zu führen." },
        { title: "Social Sharing", desc: "Open-Graph- und Twitter-Card-Metadaten für saubere Linkvorschauen gestalten." },
      ],
      steps: [
        "Wählen Sie das benötigte SEO-Tool aus der Sammlung.",
        "Geben Sie Seiten-URL, Titel und Inhaltsdetails ein.",
        "Konfigurieren Sie die Einstellungen – von Zeichenlimits bis zu strukturierten Datentypen.",
        "Kopieren Sie die generierten Tags, das Markup oder die Dateien in Ihre Website.",
      ],
      faq: [
        { question: "Sind diese SEO-Tools kostenlos?", answer: "Ja, jedes SEO-Tool ist kostenlos nutzbar und läuft vollständig in Ihrem Browser – ohne Konten, Uploads oder Abos." },
        { question: "Prüfen Sie Live-Suchpositionen?", answer: "Nein. Unsere Tools erzeugen SEO-Assets (Meta-Tags, Schema, Sitemaps). Sie fragen keine Ranking-Daten von Suchmaschinen ab." },
        { question: "Kann ich den generierten Code direkt in Produktion verwenden?", answer: "Ja. Die gesamte Ausgabe ist produktionsreif. Kopieren Sie die Meta-Tags, das JSON-LD oder das XML direkt in den Head Ihrer HTML- oder Konfigurationsdateien." },
      ],
      breadcrumbs: [
        { name: "Startseite", url: "/" },
        { name: "SEO-Werkzeuge", url: "/seo" },
      ],
    },
    fr: {
      category: "Outils SEO",
      title: "Outils SEO en ligne gratuits – Meta tags, Schema, sitemaps et plus | GainUtility",
      description:
        "Utilisez des outils SEO gratuits dans votre navigateur. Générez des meta tags, des cartes Open Graph, du schema markup, des sitemaps, robots.txt et des aperçus SERP. Rapide et privé.",
      intro:
        "La suite SEO de GainUtility vous aide à contrôler précisément la façon dont les moteurs de recherche voient vos pages. Générez des titres et descriptions optimisés, créez du schema markup JSON-LD, générez des sitemaps XML et des règles robots.txt, prévisualisez des extraits SERP et suivez vos campagnes avec des liens UTM : tout est traité localement dans votre navigateur.",
      useCases: [
        { title: "SEO on-page", desc: "Générez title tags, meta descriptions et URLs canoniques optimisées dans les limites de longueur des moteurs." },
        { title: "Résultats enrichis", desc: "Créez du schema markup JSON-LD pour produits, articles, FAQ et entités d'organisation." },
        { title: "Contrôle du crawling", desc: "Construisez des directives robots.txt et des sitemaps XML pour guider les bots sur votre site." },
        { title: "Partage social", desc: "Créez des métadonnées Open Graph et Twitter Card pour des aperçus de liens soignés." },
      ],
      steps: [
        "Choisissez l'outil SEO dont vous avez besoin dans la collection.",
        "Saisissez l'URL de votre page, le titre et les détails du contenu.",
        "Configurez les options, des limites de caractères aux types de données structurées.",
        "Copiez les tags, le markup ou les fichiers générés dans votre site.",
      ],
      faq: [
        { question: "Ces outils SEO sont-ils gratuits ?", answer: "Oui, chaque outil SEO est gratuit et fonctionne entièrement dans votre navigateur : sans comptes, sans envois ni abonnements." },
        { question: "Vérifiez-vous les classements de recherche en direct ?", answer: "Non. Nos outils génèrent des actifs SEO (meta tags, schema, sitemaps). Ils n'interrogent pas les moteurs de recherche pour des données de classement." },
        { question: "Puis-je utiliser le code généré directement en production ?", answer: "Oui. Toute la sortie est prête pour la production. Copiez les meta tags, le JSON-LD ou le XML directement dans le head de votre HTML ou vos fichiers de configuration." },
      ],
      breadcrumbs: [
        { name: "Accueil", url: "/" },
        { name: "Outils SEO", url: "/seo" },
      ],
    },
    it: {
      category: "Strumenti SEO",
      title: "Strumenti SEO online gratuiti – Meta tag, Schema, sitemap e altro | GainUtility",
      description:
        "Usa strumenti SEO gratuiti nel tuo browser. Genera meta tag, card Open Graph, schema markup, sitemap, robots.txt e anteprime SERP. Veloce e privato.",
      intro:
        "Il pacchetto SEO di GainUtility ti aiuta a controllare esattamente come i motori di ricerca vedono le tue pagine. Genera title tag e descrizioni ottimizzati, crea schema markup JSON-LD, genera sitemap XML e regole robots.txt, visualizza in anteprima gli snippet SERP e monitora le campagne con link UTM: tutto viene elaborato localmente nel tuo browser.",
      useCases: [
        { title: "SEO on-page", desc: "Genera title tag, meta description e URL canoniche ottimizzate entro i limiti di lunghezza dei motori di ricerca." },
        { title: "Risultati avanzati", desc: "Crea schema markup JSON-LD per prodotti, articoli, FAQ ed entità organizzative." },
        { title: "Controllo della scansione", desc: "Costruisci direttive robots.txt e sitemap XML per guidare i bot nei contenuti del tuo sito." },
        { title: "Condivisione social", desc: "Crea metadati Open Graph e Twitter Card per anteprime di link curate." },
      ],
      steps: [
        "Scegli lo strumento SEO che ti serve dalla collezione.",
        "Inserisci l'URL della pagina, il titolo e i dettagli del contenuto.",
        "Configura le impostazioni, dai limiti di caratteri ai tipi di dati strutturati.",
        "Copia i tag, il markup o i file generati nel tuo sito.",
      ],
      faq: [
        { question: "Questi strumenti SEO sono gratuiti?", answer: "Sì, ogni strumento SEO è gratuito e funziona interamente nel tuo browser: senza account, caricamenti o abbonamenti." },
        { question: "Controllate le posizioni di ricerca in tempo reale?", answer: "No. I nostri strumenti generano asset SEO (meta tag, schema, sitemap). Non interrogano i motori di ricerca per dati di ranking." },
        { question: "Posso usare il codice generato direttamente in produzione?", answer: "Sì. Tutto l'output è pronto per la produzione. Copia i meta tag, il JSON-LD o l'XML direttamente nell'head del tuo HTML o nei file di configurazione." },
      ],
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Strumenti SEO", url: "/seo" },
      ],
    },
  },
};

/** Resolve the localized overlay for a hub slug + locale (es-co → es-mx). */
export const localizedHubOverlay = (slug: string, locale: string): HubOverlay | undefined => {
  const overlays = HUB_LOCALIZED[slug];
  if (!overlays) return undefined;
  const code = (locale || "en").toLowerCase() as LocaleCode;
  if (code === "es-co") return overlays["es-co"] ?? overlays["es-mx"];
  return overlays[code];
};