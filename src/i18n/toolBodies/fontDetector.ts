/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlay for font-detector (6 locales).
 * Source: src/data.ts "font-detector"
 */

import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";

export const overlay: Partial<Record<LocaleCode, ToolBodyOverlay>> = {
  fr: {
    desc: "Identifiez les polices à partir d'images ou de PDF, prévisualisez les typographies en direct et copiez le CSS prêt à l'emploi.",
    whatText:
      "Un outil de détection de polices et studio typographique complet. Importez une image pour identifier le texte grâce à une reconnaissance OCR et une analyse de forme directement dans votre navigateur, lisez les polices intégrées dans les PDF, et explorez un catalogue sélectionné de polices Google Fonts avec alternatives libres pour les typographies payantes courantes.",
    whyText:
      "Trouver la bonne police exige souvent d'ouvrir des dizaines d'onglets de spécimens sans savoir comment elles s'adapteront à votre mise en page. Cet outil identifie les polices d'après des échantillons réels, vous permet de les tester côte à côte avec vos propres textes et de copier le code CSS en un clic.",
    features: [
      "Identification de polices à partir d'images importées ou collées par analyse OCR locale",
      "Lecture directe des polices vectorielles intégrées dans les documents PDF",
      "Catalogue Google Fonts sélectionné avec filtres sans-serif, serif, monospace, display et script",
      "Suggestions d'alternatives libres et open source aux polices commerciales populaires",
      "Prévisualisation en direct avec texte personnalisé, taille, graisse et couleur modifiables",
      "Tableau comparatif des graisses et suggestions d'associations titre/corps",
      "Génération et copie en un clic de la règle @import et de la déclaration font-family CSS",
    ],
    steps: [
      "Importez ou collez une image (ou un PDF) et recadrez sur les lettres à identifier.",
      "Consultez les correspondances classées par pertinence (Probable, Possible, Similaire).",
      "Prévisualisez la police sélectionnée avec votre propre texte en réglant la taille et la graisse.",
      "Consultez les suggestions d'associations et ajoutez les typographies au comparateur.",
      "Pour une police payante, découvrez les alternatives gratuites et libres recommandées.",
      "Copiez le code CSS (@import et font-family) pour l'intégrer à votre projet.",
    ],
    mistakes: [
      "Considérer un résultat 'Possible' ou 'Similaire' comme définitif sans vérifier l'échantillon d'origine.",
      "Juger une police uniquement sur des grands titres sans tester la lisibilité en petit texte.",
    ],
    privacyExplanation:
      "100 % côté client. Vos images et PDF sont analysés localement dans votre navigateur et ne sont jamais téléversés sur un serveur. Aucun fichier ne quitte votre appareil.",
    limitations: [
      "La détection visuelle repose sur l'OCR et l'analyse de contours du navigateur : les résultats sont honnêtement indiqués comme Probables ou Similaires.",
      "La lecture du CSS direct d'un site web externe n'est pas possible dans le navigateur pour des raisons de sécurité inter-domaines.",
    ],
    faqs: [
      {
        question: "Cet outil peut-il identifier une police à partir d'une image ?",
        answer:
          "Oui, entièrement dans votre navigateur. Déposez ou collez une image, recadrez sur le mot désiré, et l'outil exécute une reconnaissance OCR et un classement de similarité sans rien envoyer sur Internet.",
      },
      {
        question: "Peut-il extraire les polices intégrées dans un PDF ?",
        answer:
          "Oui. L'outil lit les métadonnées de polices intégrées dans les pages PDF (noms BaseFont) et propose une détection visuelle en cas de texte vectorisé.",
      },
      {
        question: "Puis-je tester les polices avec mon propre texte avant de choisir ?",
        answer:
          "Absolument. La zone de prévisualisation en direct affiche n'importe quelle phrase que vous saisissez avec ajustement instantané de la taille, de la graisse et de la couleur.",
      },
      {
        question: "Comment utiliser la police trouvée dans mon site web ?",
        answer:
          "Cliquez sur Copier le CSS pour obtenir la règle @import et la déclaration font-family à coller directement dans votre feuille de style.",
      },
      {
        question: "Ces polices sont-elles gratuites pour un usage commercial ?",
        answer:
          "Les polices du catalogue Google Fonts sont gratuites et sous licence libre (SIL Open Font License ou Apache). Pour les polices commerciales reconnues, des alternatives libres équivalentes vous sont suggérées.",
      },
    ],
  },
  "pt-br": {
    desc: "Identifique fontes em imagens ou PDFs, visualize tipografias ao vivo e copie o CSS pronto para uso.",
    whatText:
      "Um identificador de fontes e estúdio tipográfico completo no navegador. Envie uma imagem para detectar fontes com OCR local e análise de formas, descubra fontes incorporadas em PDFs e navegue por um catálogo selecionado do Google Fonts com alternativas gratuitas para fontes comerciais famosas.",
    whyText:
      "Descobrir qual fonte está em uma imagem costuma ser um desafio. Esta ferramenta identifica a tipografia a partir de amostras reais, permite testar o resultado com seu próprio texto e copiar o CSS pronto para o seu site.",
    features: [
      "Identificação de fontes a partir de imagens coladas ou enviadas usando OCR no navegador",
      "Leitura de nomes de fontes incorporadas em arquivos PDF",
      "Catálogo Google Fonts organizado por categorias (Sans, Serif, Monospace, Display, Script)",
      "Sugestões de alternativas gratuitas de código aberto para fontes comerciais populares",
      "Pré-visualização interativa com texto próprio, controles de tamanho, peso e cores",
      "Cópia em um clique da regra @import e declaração font-family para CSS",
    ],
    steps: [
      "Envie ou cole uma imagem (ou PDF) e recorte ao redor do texto que deseja identificar.",
      "Analise os resultados ordenados por probabilidade (Provável, Possível ou Semelhante).",
      "Teste a fonte selecionada com seu próprio texto, ajustando tamanho e espessura.",
      "Para fontes comerciais pagas, confira as alternativas gratuitas sugeridas.",
      "Copie o código CSS gerado diretamente para o seu projeto.",
    ],
    mistakes: [
      "Tratar um resultado 'Possível' como definitivo sem comparar visualmente com a imagem original.",
    ],
    privacyExplanation:
      "100% no navegador. Suas fotos e documentos PDF são processados na memória local do dispositivo e nunca são enviados para a internet.",
    limitations: [
      "A detecção em imagens usa OCR local; fontes decorativas muito distorcidas ou com baixa resolução podem reduzir a precisão.",
    ],
    faqs: [
      {
        question: "Como descobrir o nome de uma fonte em uma imagem?",
        answer:
          "Envie ou cole a imagem na ferramenta, ajuste o corte sobre o texto e o detector analisará as características tipográficas para listar as fontes mais prováveis.",
      },
      {
        question: "É seguro enviar imagens com dados confidenciais?",
        answer:
          "Sim. O processamento acontece 100% no seu navegador; nenhum arquivo é transmitido para servidores.",
      },
      {
        question: "As fontes recomendadas são gratuitas para uso comercial?",
        answer:
          "Sim, as opções do catálogo Google Fonts possuem licença livre (como SIL OFL) e são gratuitas inclusive para fins comerciais.",
      },
    ],
  },
  "es-mx": {
    desc: "Identifica fuentes en imágenes o PDF, previsualiza tipografías en vivo y copia el CSS listo para usar.",
    whatText:
      "Un detector de fuentes y estudio tipográfico completo en tu navegador. Sube una imagen para identificar tipografías mediante OCR y análisis de forma local, lee fuentes incrustadas en documentos PDF y explora un catálogo seleccionado de Google Fonts con alternativas gratuitas a fuentes de pago conocidas.",
    whyText:
      "Identificar qué fuente se utilizó en un diseño suele requerir tiempo. Esta herramienta reconoce la tipografía a partir de capturas de pantalla, te permite probarla con tus propios textos y exportar el código CSS en un solo clic.",
    features: [
      "Detección de fuentes a partir de imágenes mediante OCR local en el navegador",
      "Lectura de metadatos de fuentes incrustadas en documentos PDF",
      "Catálogo selecto de Google Fonts con filtros por categorías y licencias libres",
      "Alternativas gratuitas de código abierto sugeridas para fuentes comerciales famosas",
      "Previsualización en tiempo real con texto personalizado, tamaño, peso y color",
      "Copia en un clic de la regla @import y font-family para tus estilos CSS",
    ],
    steps: [
      "Sube o pega una imagen (o documento PDF) y recorta el área del texto a identificar.",
      "Revisa la lista de fuentes coincidentes ordenadas por similitud.",
      "Prueba la fuente elegida con tus propios textos y ajusta el tamaño y peso.",
      "Si la fuente original es de pago, revisa las alternativas libres recomendadas.",
      "Copia el código CSS generado para usarlo en tu página o aplicación.",
    ],
    mistakes: [
      "Aceptar un resultado 'Posible' como definitivo sin contrastarlo con la muestra inicial.",
    ],
    privacyExplanation:
      "100% en tu navegador. Tus imágenes y documentos se procesan en la memoria local y nunca se transfieren a ningún servidor externo.",
    limitations: [
      "El reconocimiento visual en imágenes depende de la calidad y contraste del texto recortado.",
    ],
    faqs: [
      {
        question: "¿Cómo saber qué tipografía tiene una imagen?",
        answer:
          "Sube una captura o foto, recorta las letras que quieras identificar y el detector comparará los rasgos tipográficos para indicarte la fuente exacta o las alternativas más cercanas.",
      },
      {
        question: "¿Puedo probar la fuente con mi propio texto?",
        answer:
          "Sí. Puedes escribir cualquier frase en el visor en vivo para comprobar su legibilidad en titulares y párrafos antes de descargarla.",
      },
      {
        question: "¿Es seguro analizar documentos y fotos confidenciales aquí?",
        answer:
          "Completamente seguro. Todo el análisis corre localmente en tu navegador sin subir ningún archivo a la red.",
      },
    ],
  },
  de: {
    desc: "Schriftarten aus Bildern und PDFs erkennen, Schriftarten live testen und fertigen CSS-Code kopieren.",
    whatText:
      "Ein intuitiver Schriftarten-Finder und typografisches Werkzeug für den Browser. Laden Sie ein Bild hoch, um Schriften per lokaler OCR- und Formanalyse zu bestimmen, lesen Sie eingebettete Schriften aus PDFs aus und finden Sie kostenlose Google-Fonts-Alternativen zu kommerziellen Schriften.",
    whyText:
      "Eine unbekannte Schriftart zu identifizieren ist oft mühsam. Dieses Tool ermittelt passende Schriften direkt aus Bildproben, zeigt eine Live-Vorschau mit Ihren eigenen Texten und liefert den passenden CSS-Code mit einem Klick.",
    features: [
      "Schriftarten-Erkennung aus Bildern per clientseitiger OCR-Analyse",
      "Auslesen eingebetteter Schriftnamen direkt aus PDF-Seiten",
      "Kuratierter Google-Fonts-Katalog mit Stil- und Lizenzfiltern",
      "Kostenlose Open-Source-Alternativen für bekannte kommerzielle Schriftarten",
      "Live-Textvorschau mit anpassbarer Schriftgröße, Schriftstärke und Farbe",
      "Generierung von @import-Regeln und font-family CSS-Deklarationen",
    ],
    steps: [
      "Bild oder PDF hochladen und den Textbereich passgenau zuschneiden.",
      "Ergebnisliste mit Übereinstimmungen und Ähnlichkeiten prüfen.",
      "Schriftart mit eigenem Text in verschiedenen Schriftstärken testen.",
      "Empfohlene kostenlose Alternativen für kommerzielle Schriften ansehen.",
      "CSS-Code kopieren und in das Stylesheet Ihres Projekts einfügen.",
    ],
    mistakes: [
      "Ergebnisse mit 'Möglich' ohne visuellen Direktvergleich als sicher ansehen.",
    ],
    privacyExplanation:
      "100 % im Browser. Alle Dateien verbleiben auf Ihrem Endgerät und werden niemals auf einen Webserver übertragen.",
    limitations: [
      "Verzierte oder niedrig aufgelöste Schriftzüge können die Erkennungsgenauigkeit einschränken.",
    ],
    faqs: [
      {
        question: "Wie kann ich eine Schriftart aus einem Bild erkennen?",
        answer:
          "Laden Sie einen Screenshot oder ein Foto hoch, schneiden Sie den gewünschten Buchstabenbereich aus und das Tool analysiert die typografischen Merkmale lokal im Browser.",
      },
      {
        question: "Sind die gefundenen Schriften für kommerzielle Websites kostenlos?",
        answer:
          "Die Schriften aus dem Google-Fonts-Katalog stehen unter freien Open-Source-Lizenzen (wie SIL OFL) und sind kostenlos nutzbar.",
      },
    ],
  },
  it: {
    desc: "Identifica i font da immagini e PDF, prova i caratteri in tempo reale e copia il codice CSS pronto all'uso.",
    whatText:
      "Un identificatore di font e studio tipografico completo nel tuo browser. Carica un'immagine per identificare il testo tramite OCR e analisi geometrica, leggi i font incorporati nei PDF ed esplora il catalogo Google Fonts con alternative gratuite ai font commerciali più usati.",
    whyText:
      "Riconoscere un font sconosciuto da uno screenshot è un'esigenza frequente per designer e sviluppatori. Questo strumento analizza il testo, permette di provarlo con le tue parole ed esporta il codice CSS in un istante.",
    features: [
      "Identificazione dei font da immagini caricate o incollate tramite OCR nel browser",
      "Lettura dei font incorporati nei file PDF",
      "Catalogo Google Fonts selezionato per categorie tipografiche",
      "Suggerimenti di alternative gratuite e open source ai font a pagamento",
      "Anteprima interattiva con testo personalizzato, controlli di dimensione e peso",
      "Copia del codice CSS (@import e font-family) con un solo clic",
    ],
    steps: [
      "Carica o incolla un'immagine (o un PDF) e ritaglia attorno al testo da riconoscere.",
      "Consulta le corrispondenze ordinate per grado di somiglianza.",
      "Verifica il font con una tua frase personalizzata regolando dimensioni e peso.",
      "Se il font originale è a pagamento, scopri le alternative gratuite consigliate.",
      "Copia il codice CSS direttamente nel tuo foglio di stile.",
    ],
    mistakes: [
      "Considerare definitiva una corrispondenza 'Possibile' senza verificare i dettagli dei caratteri.",
    ],
    privacyExplanation:
      "100% nel browser. Immagini e PDF rimangono sul tuo computer e non vengono mai caricati su server esterni.",
    limitations: [
      "Testi a bassa risoluzione o fortemente deformati possono ridurre l'accuratezza del riconoscimento.",
    ],
    faqs: [
      {
        question: "Come posso scoprire che font è presente in un'immagine?",
        answer:
          "Trascina l'immagine nel riquadro, ritaglia le lettere da analizzare e il sistema confronterà la forma dei caratteri indicandoti il nome della tipografia più affine.",
      },
      {
        question: "I font suggeriti sono gratuiti anche per uso commerciale?",
        answer:
          "Sì, i font del catalogo Google Fonts utilizzano licenze open source libere (come la SIL Open Font License).",
      },
    ],
  },
  id: {
    desc: "Identifikasi font dari gambar atau PDF, pratinjau tipografi secara langsung, dan salin kode CSS siap pakai.",
    whatText:
      "Alat pendeteksi font dan studio tipografi lengkap di browser Anda. Unggah gambar untuk mengenali teks menggunakan OCR lokal dan analisis bentuk huruf, baca font yang tersemat di dalam PDF, serta temukan alternatif font gratis dari Google Fonts.",
    whyText:
      "Mencari tahu font apa yang digunakan pada suatu desain kini lebih cepat. Alat ini menganalisis sampel teks, memungkinkan Anda mencobanya dengan teks sendiri, dan menyalin kode CSS dalam sekali klik.",
    features: [
      "Identifikasi font dari gambar atau screenshot menggunakan analisis OCR lokal",
      "Membaca nama font yang tersemat langsung di halaman dokumen PDF",
      "Katalog Google Fonts pilihan dengan filter sans-serif, serif, monospace, dan display",
      "Saran alternatif gratis dan open source untuk font berbayar populer",
      "Pratinjau interaktif dengan teks kustom, pengatur ukuran, bobot, dan warna",
      "Salin aturan @import dan font-family CSS langsung ke proyek Anda",
    ],
    steps: [
      "Unggah atau tempel gambar (atau PDF) lalu potong tepat di area teks.",
      "Tinjau daftar font yang cocok berdasarkan tingkat kemiripan.",
      "Uji font terpilih dengan kalimat Anda sendiri di area pratinjau.",
      "Untuk font komersial, periksa alternatif font gratis yang disarankan.",
      "Salin kode CSS yang dihasilkan ke stylesheet proyek Anda.",
    ],
    mistakes: [
      "Menganggap hasil 'Mungkin' sebagai kecocokan mutlak tanpa memeriksa detail lekukan huruf.",
    ],
    privacyExplanation:
      "100% di browser. Gambar dan PDF diproses secara lokal di perangkat Anda tanpa pernah diunggah ke server mana pun.",
    limitations: [
      "Akurasi deteksi pada gambar sangat dipengaruhi oleh ketajaman dan kontras teks.",
    ],
    faqs: [
      {
        question: "Bagaimana cara mendeteksi font dari sebuah gambar?",
        answer:
          "Unggah gambar atau screenshot Anda, atur area potong pada kata yang ingin dicari tahu, dan alat akan menganalisis bentuk huruf untuk menampilkan kandidat font yang paling mendekati.",
      },
      {
        question: "Apakah font yang disarankan gratis untuk penggunaan komersial?",
        answer:
          "Ya. Font dari Google Fonts memiliki lisensi open source (seperti SIL Open Font License) yang bebas digunakan.",
      },
    ],
  },
};

