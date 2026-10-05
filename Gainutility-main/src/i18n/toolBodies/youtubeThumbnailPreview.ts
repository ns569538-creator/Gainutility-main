/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlay for youtube-thumbnail-preview (6 locales,
 * 4 FAQs each — base entry only). Source: src/seo/extraCreator.ts
 * CREATOR_SEO "youtube-thumbnail-preview" (steps/what/why/features/faqs),
 * registry desc from src/toolsRegistry.tsx, privacy line = shared LOCAL
 * constant. No examples/limitations in the English entry, so both are
 * omitted here.
 */

import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";

export const overlay: Partial<Record<LocaleCode, ToolBodyOverlay>> = {
  "pt-br": {
    desc: "Pré-visualize uma miniatura nos layouts desktop, mobile e TV do YouTube.",
    whatText:
      "Renderiza a imagem enviada dentro de simulações fiéis das interfaces reais do YouTube — grade de busca, feed inicial, barra lateral da página de exibição e TV da sala — em suas escalas relativas verdadeiras.",
    whyText:
      "A maioria das visualizações vem de espaços pequenos. Designs que só funcionam em resolução total desperdiçam impressões; testar em tamanhos realistas é como os grandes canais iteram miniaturas.",
    features: [
      "Modos de pré-visualização de busca, início, barra lateral e TV",
      "Renderização em escala real de cada superfície",
      "Troca instantânea entre imagens de teste",
      "Zero envios — pré-visualização local",
      "Completamente gratuito",
    ],
    steps: [
      "Envie a imagem da sua miniatura (recomendado 1280×720).",
      "Alterne entre os resultados de busca, o feed inicial, a barra lateral e as posições de TV.",
      "Verifique a legibilidade em cada tamanho.",
      "Itere até ela chamar atenção em todos os lugares.",
    ],
    mistakes: [],
    privacyExplanation:
      "Tudo roda localmente no seu navegador. Seus dados de entrada e seus arquivos nunca são enviados para um servidor.",
    faqs: [
      {
        question: "Como faço a pré-visualização da minha miniatura do YouTube?",
        answer:
          "Envie a imagem aqui e clique em cada simulação de posição para ver exatamente como os espectadores vão encontrá-la.",
      },
      {
        question: "Qual deve ser o tamanho das miniaturas do YouTube?",
        answer:
          "1280×720 pixels, menos de 2MB, em JPG/PNG — o padrão 16:9 que renderiza em todas as superfícies.",
      },
      {
        question: "Por que minha miniatura parece diferente no mobile?",
        answer:
          "No mobile o recorte é mais fechado e a imagem aparece menor; texto abaixo do equivalente a ~24pt fica ilegível — use a pré-visualização para conferir.",
      },
      {
        question: "Minha miniatura é enviada para algum lugar?",
        answer:
          "Não. Tudo roda localmente no seu navegador. Seus dados de entrada e seus arquivos nunca são enviados para um servidor.",
      },
    ],
  },
  id: {
    desc: "Pratinjau thumbnail di tata letak desktop, seluler, dan TV YouTube.",
    whatText:
      "Merender gambar yang Anda unggah di dalam simulasi setia antarmuka YouTube yang sebenarnya — kisi pencarian, umpan beranda, sidebar halaman tontonan, dan TV ruang keluarga — pada skala relatif yang sebenarnya.",
    whyText:
      "Sebagian besar tampilan datang dari penempatan kecil. Desain yang hanya berfungsi di resolusi penuh menyia-nyiakan impresi; menguji pada ukuran yang realistis adalah cara kanal besar mengiterasi thumbnail.",
    features: [
      "Mode pratinjau pencarian, beranda, sidebar, dan TV",
      "Render berukuran asli untuk setiap tampilan",
      "Pertukaran instan antar gambar uji",
      "Tanpa unggahan — dipratinjau secara lokal",
      "Sepenuhnya gratis",
    ],
    steps: [
      "Unggah gambar thumbnail Anda (disarankan 1280×720).",
      "Beralih antara hasil pencarian, umpan beranda, sidebar, dan penempatan TV.",
      "Periksa keterbacaan di setiap ukuran.",
      "Iterasi hingga mencolok di semua tempat.",
    ],
    mistakes: [],
    privacyExplanation:
      "Semuanya berjalan secara lokal di browser Anda. Input dan file Anda tidak pernah diunggah ke server mana pun.",
    faqs: [
      {
        question: "Bagaimana cara mempratinjau thumbnail YouTube saya?",
        answer:
          "Unggah gambar di sini dan klik melalui setiap simulasi penempatan untuk melihat persis bagaimana penonton akan menemukannya.",
      },
      {
        question: "Berapa ukuran thumbnail YouTube?",
        answer:
          "1280×720 piksel, di bawah 2MB, dalam JPG/PNG — standar 16:9 yang dirender di semua tampilan.",
      },
      {
        question: "Mengapa thumbnail saya berbeda di ponsel?",
        answer:
          "Ponsel memotong lebih ketat dan menampilkan lebih kecil; teks di bawah setara ~24pt menjadi tidak terbaca — pratinjau untuk memastikan.",
      },
      {
        question: "Apakah thumbnail saya diunggah ke suatu tempat?",
        answer:
          "Tidak. Semuanya berjalan secara lokal di browser Anda. Input dan file Anda tidak pernah diunggah ke server mana pun.",
      },
    ],
  },
  "es-mx": {
    desc: "Previsualiza una miniatura en los diseños de escritorio, móvil y TV de YouTube.",
    whatText:
      "Renderiza tu imagen subida dentro de simulaciones fieles de las interfaces reales de YouTube — cuadrícula de búsqueda, feed de inicio, barra lateral de la página de reproducción y TV del salón — a sus escalas relativas verdaderas.",
    whyText:
      "La mayoría de las vistas llegan mediante espacios pequeños. Los diseños que solo funcionan a resolución completa desperdician impresiones; probar en tamaños realistas es como los canales grandes iteran sus miniaturas.",
    features: [
      "Modos de vista previa de búsqueda, inicio, barra lateral y TV",
      "Renderización a escala real de cada superficie",
      "Cambio instantáneo entre imágenes de prueba",
      "Sin subidas — vista previa local",
      "Completamente gratis",
    ],
    steps: [
      "Sube la imagen de tu miniatura (se recomienda 1280×720).",
      "Alterna entre resultados de búsqueda, feed de inicio, barra lateral y posiciones de TV.",
      "Revisa la legibilidad en cada tamaño.",
      "Itera hasta que destaque en todas partes.",
    ],
    mistakes: [],
    privacyExplanation:
      "Todo se ejecuta localmente en tu navegador. Tu información y tus archivos nunca se suben a un servidor.",
    faqs: [
      {
        question: "¿Cómo previsualizo mi miniatura de YouTube?",
        answer:
          "Sube la imagen aquí y recorre cada simulación de ubicación para ver exactamente cómo la encontrarán los espectadores.",
      },
      {
        question: "¿De qué tamaño deben ser las miniaturas de YouTube?",
        answer:
          "1280×720 píxeles, menos de 2 MB, en JPG/PNG — el estándar 16:9 que se renderiza en todas las superficies.",
      },
      {
        question: "¿Por qué mi miniatura se ve distinta en móvil?",
        answer:
          "En móvil el recorte es más cerrado y la imagen se muestra más pequeña; el texto por debajo del equivalente a ~24pt queda ilegible — usa la vista previa para verificarlo.",
      },
      {
        question: "¿Se sube mi miniatura a algún lugar?",
        answer:
          "No. Todo se ejecuta localmente en tu navegador. Tu información y tus archivos nunca se suben a un servidor.",
      },
    ],
  },
  de: {
    desc: "Vorschau deiner Miniaturansicht in YouTubes Desktop-, Mobil- und TV-Layouts.",
    whatText:
      "Rendert dein hochgeladenes Bild in originalgetreuen Simulationen der tatsächlichen YouTube-Oberflächen — Suchraster, Startfeed, Seitenleiste der Watchpage und Wohnzimmer-TV — in ihrem echten Größenverhältnis.",
    whyText:
      "Die meisten Aufrufe kommen über kleine Platzierungen. Designs, die nur in voller Auflösung funktionieren, verschenken Impressionen; Tests in realistischen Größen sind die Art, wie große Kanäle Miniaturansichten iterieren.",
    features: [
      "Vorschau-Modi für Suche, Startseite, Seitenleiste und TV",
      "Maßstabsgetreues Rendern jeder Oberfläche",
      "Sofortiger Wechsel zwischen Testbildern",
      "Keine Uploads — lokal in der Vorschau",
      "Komplett kostenlos",
    ],
    steps: [
      "Lade dein Miniaturbild hoch (1280×720 empfohlen).",
      "Wechsle zwischen Suchergebnissen, Startfeed, Seitenleiste und TV-Platzierungen.",
      "Prüfe die Lesbarkeit in jeder Größe.",
      "Iteriere, bis es überall heraussticht.",
    ],
    mistakes: [],
    privacyExplanation:
      "Alles läuft lokal in Ihrem Browser. Ihre Eingaben und Dateien werden nie auf einen Server hochgeladen.",
    faqs: [
      {
        question: "Wie mache ich eine Vorschau meiner YouTube-Miniaturansicht?",
        answer:
          "Lade das Bild hier hoch und klicke dich durch jede Platzierungssimulation, um genau zu sehen, wie Zuschauer darauf treffen.",
      },
      {
        question: "Welche Größe sollten YouTube-Miniaturansichten haben?",
        answer:
          "1280×720 Pixel, unter 2MB, als JPG/PNG — das Standard-16:9-Format, das auf allen Oberflächen rendert.",
      },
      {
        question: "Warum sieht meine Miniaturansicht auf dem Handy anders aus?",
        answer:
          "Handys beschneiden enger und zeigen kleiner; Text unterhalb von ~24pt Äquivalent wird unlesbar — nutze die Vorschau zur Prüfung.",
      },
      {
        question: "Wird meine Miniaturansicht irgendwohin hochgeladen?",
        answer:
          "Nein. Alles läuft lokal in Ihrem Browser. Ihre Eingaben und Dateien werden nie auf einen Server hochgeladen.",
      },
    ],
  },
  fr: {
    desc: "Prévisualisez une miniature dans les dispositions bureau, mobile et TV de YouTube.",
    whatText:
      "Rend votre image importée dans des simulations fidèles des interfaces réelles de YouTube — grille de recherche, flux d'accueil, barre latérale de la page de lecture et TV du salon — à leur échelle relative réelle.",
    whyText:
      "La majorité des vues passent par des emplacements petits. Les designs qui ne fonctionnent qu'en pleine résolution gaspillent des impressions ; tester à des tailles réalistes est la façon dont les grandes chaînes itèrent leurs miniatures.",
    features: [
      "Modes d'aperçu recherche, accueil, barre latérale et TV",
      "Rendu à l'échelle exacte de chaque surface",
      "Échange instantané entre images de test",
      "Zéro import — aperçu en local",
      "Entièrement gratuit",
    ],
    steps: [
      "Importez l'image de votre miniature (1280×720 recommandé).",
      "Basculez entre les résultats de recherche, le flux d'accueil, la barre latérale et les emplacements TV.",
      "Vérifiez la lisibilité à chaque taille.",
      "Itérez jusqu'à ce qu'elle sorte du lot partout.",
    ],
    mistakes: [],
    privacyExplanation:
      "Tout s'exécute localement dans votre navigateur. Vos saisies et vos fichiers ne sont jamais envoyés sur un serveur.",
    faqs: [
      {
        question: "Comment prévisualiser ma miniature YouTube ?",
        answer:
          "Importez l'image ici et parcourez chaque simulation d'emplacement pour voir exactement comment les spectateurs la rencontreront.",
      },
      {
        question: "Quelle taille doivent avoir les miniatures YouTube ?",
        answer:
          "1280×720 pixels, moins de 2 Mo, en JPG/PNG — le format standard 16:9 qui s'affiche sur toutes les surfaces.",
      },
      {
        question: "Pourquoi ma miniature est-elle différente sur mobile ?",
        answer:
          "Le mobile recadre plus serré et affiche plus petit ; un texte en dessous de l'équivalent ~24pt devient illisible — utilisez l'aperçu pour vérifier.",
      },
      {
        question: "Ma miniature est-elle importée quelque part ?",
        answer:
          "Non. Tout s'exécute localement dans votre navigateur. Vos saisies et vos fichiers ne sont jamais envoyés sur un serveur.",
      },
    ],
  },
  it: {
    desc: "Anteprima una miniatura nei layout desktop, mobile e TV di YouTube.",
    whatText:
      "Rende la tua immagine caricata all'interno di simulazioni fedeli alle superfici reali dell'interfaccia di YouTube — griglia di ricerca, feed home, sidebar della pagina di visualizzazione e TV del soggiorno — alle loro vere scale relative.",
    whyText:
      "La maggior parte delle visualizzazioni arriva da spazi piccoli. I design che funzionano solo a risoluzione piena sprecano impressioni; testare a dimensioni realistiche è il modo in cui i canali grandi iterano le miniature.",
    features: [
      "Modalità di anteprima ricerca, home, sidebar e TV",
      "Rendering a scala reale di ogni superficie",
      "Cambio istantaneo tra immagini di prova",
      "Zero upload — anteprima in locale",
      "Completamente gratuito",
    ],
    steps: [
      "Carica l'immagine della tua miniatura (consigliato 1280×720).",
      "Passa dai risultati di ricerca al feed home, alla sidebar e alle posizioni TV.",
      "Controlla la leggibilità a ogni dimensione.",
      "Itera finché non spicca ovunque.",
    ],
    mistakes: [],
    privacyExplanation:
      "Tutto gira in locale nel tuo browser. I tuoi dati e i tuoi file non vengono mai caricati su un server.",
    faqs: [
      {
        question: "Come faccio l'anteprima della mia miniatura YouTube?",
        answer:
          "Carica l'immagine qui e scorri ogni simulazione di posizione per vedere esattamente come gli spettatori la incontreranno.",
      },
      {
        question: "Che dimensione devono avere le miniature YouTube?",
        answer:
          "1280×720 pixel, sotto 2MB, in JPG/PNG — lo standard 16:9 che viene reso su tutte le superfici.",
      },
      {
        question: "Perché la mia miniatura sembra diversa su mobile?",
        answer:
          "Su mobile il ritaglio è più stretto e l'immagine è più piccola; il testo sotto l'equivalente di ~24pt diventa illeggibile — usa l'anteprima per verificare.",
      },
      {
        question: "La mia miniatura viene caricata da qualche parte?",
        answer:
          "No. Tutto gira in locale nel tuo browser. I tuoi dati e i tuoi file non vengono mai caricati su un server.",
      },
    ],
  },
};
