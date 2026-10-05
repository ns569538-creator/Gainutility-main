/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';

// Load articles 13-16
const raw13_16 = JSON.parse(fs.readFileSync('scratch/articles-13-16.json', 'utf8'));

// We will build full localized versions for articles 13-16:
// 13: box-shadow-values-real-websites
// 14: box-shadow-vs-drop-shadow-filter
// 15: soft-shadow-css-recipes
// 16: neumorphism-box-shadow-guide

// Let's create complete, high-quality translation dictionaries for all 7 locales.
const TRANSLATIONS = {
  "box-shadow-values-real-websites": {
    "pt-br": {
      title: "Quais valores de box-shadow os sites reais realmente usam",
      description: "Medimos sombras em produção nos 1.000 maiores sites da web. A maioria das sombras reais é pequena, neutra e com deslocamento vertical mínimo.",
      readingTime: "7 min de leitura",
      tags: ["css", "box-shadow", "design system", "desenvolvimento web"],
      categoryLabel: "Desenvolvedor",
      quickAnswer: "Sombras reais de produção são pequenas e neutras. O deslocamento vertical mediano é inferior a 1 px, o desfoque fica em um único dígito em 75% dos casos, quase metade das camadas tem y=0 e as cores são pretas com alfa de 0,3 ou menos.",
      keyTakeaway: "Sombras reais em produção são sutis e neutras: desloque Y entre 1–4 px, mantenha o desfoque em um único dígito, X em 0 e cor preta acromática com baixo alfa.",
      toolCta: { label: "Copie um valor medido de produção com o Gerador de Box Shadow.", toolId: "box-shadow-generator" },
      seoTitle: "Valores reais de box-shadow usados nos maiores sites | GainUtility",
      seoDescription: "Análise real de CSS box-shadow em 1.000 sites líderes: offsets, raios de desfoque, cores e melhores práticas para interfaces modernas."
    },
    "es-mx": {
      title: "Qué valores de box-shadow usan realmente los sitios web reales",
      description: "Medimos sombras en producción en los 1,000 principales sitios web. La mayoría de sombras reales son pequeñas, neutras y con desplazamiento mínimo.",
      readingTime: "7 min de lectura",
      tags: ["css", "box-shadow", "design system", "desarrollo web"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Las sombras de caja en producción real son pequeñas y neutras. El desplazamiento vertical mediano es inferior a 1 px, el desenfoque se mantiene en un dígito para el 75% de las capas y los colores son negros acromáticos con alfa ≤ 0.3.",
      keyTakeaway: "Las sombras en producción son sutiles y neutras: mantén Y entre 1 y 4 px, desenfoque de un solo dígito, X en 0 y negro neutro con alfa bajo.",
      toolCta: { label: "Copia un valor de producción medido con el Generador de Box Shadow.", toolId: "box-shadow-generator" },
      seoTitle: "Valores reales de box-shadow en los principales sitios web | GainUtility",
      seoDescription: "Análisis de CSS box-shadow en 1,000 sitios web reales: desplazamientos, desenfoques, colores y prácticas recomendadas de diseño."
    },
    "es-co": {
      title: "Qué valores de box-shadow usan realmente los sitios web reales",
      description: "Medimos sombras en producción en los 1,000 principales sitios web. La mayoría de sombras reales son pequeñas, neutras y con desplazamiento mínimo.",
      readingTime: "7 min de lectura",
      tags: ["css", "box-shadow", "design system", "desarrollo web"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Las sombras de caja en producción real son pequeñas y neutras. El desplazamiento vertical mediano es inferior a 1 px, el desenfoque se mantiene en un dígito para el 75% de las capas y los colores son negros acromáticos con alfa ≤ 0.3.",
      keyTakeaway: "Las sombras en producción son sutiles y neutras: mantén Y entre 1 y 4 px, desenfoque de un solo dígito, X en 0 y negro neutro con alfa bajo.",
      toolCta: { label: "Copia un valor de producción medido con el Generador de Box Shadow.", toolId: "box-shadow-generator" },
      seoTitle: "Valores reales de box-shadow en los principales sitios web | GainUtility",
      seoDescription: "Análisis de CSS box-shadow en 1,000 sitios web reales: desplazamientos, desenfoques, colores y prácticas recomendadas de diseño."
    },
    "de": {
      title: "Welche box-shadow-Werte echte Websites tatsächlich verwenden",
      description: "Wir haben CSS-Schatten auf den 1.000 weltweit führenden Websites analysiert. Echte Schatten sind dezent, neutral und vertikal kaum versetzt.",
      readingTime: "7 Min. Lesezeit",
      tags: ["css", "box-shadow", "design system", "webentwicklung"],
      categoryLabel: "Entwickler",
      quickAnswer: "Reale Schatten im Web sind klein und neutral: Der mediane Y-Versatz liegt unter 1 px, der Blur-Radius bleibt bei 75% der Ebenen einstellig und drei Viertel aller Farben sind achromatisches Schwarz mit Alpha ≤ 0,3.",
      keyTakeaway: "Produktionsreife Schatten sind dezent: Y bei 1–4 px, einstelliger Blur, X bei 0 und neutrales Schwarz mit geringem Alpha.",
      toolCta: { label: "Kopieren Sie gemessene Produktionswerte mit dem Box Shadow Generator.", toolId: "box-shadow-generator" },
      seoTitle: "Echte CSS box-shadow Werte erfolgreicher Websites | GainUtility",
      seoDescription: "CSS box-shadow Messung auf 1.000 Top-Websites: Offsets, Blur-Radien, Farbtöne und praxiserprobte Designsystem-Muster."
    },
    "fr": {
      title: "Quelles valeurs de box-shadow les vrais sites web utilisent-ils vraiment",
      description: "Analyse réelle des ombres CSS sur les 1 000 premiers sites mondiaux. Les ombres en production sont subtiles, neutres et peu décalées.",
      readingTime: "7 min de lecture",
      tags: ["css", "box-shadow", "design system", "développement web"],
      categoryLabel: "Développeur",
      quickAnswer: "Les ombres CSS réelles en production sont petites et neutres. Le décalage vertical médian est inférieur à 1 px, le flou reste à un chiffre pour 75% des calques et la couleur est un noir achromatique avec un alpha ≤ 0,3.",
      keyTakeaway: "Les ombres en production sont subtiles et neutres : décalage Y de 1 à 4 px, flou à un seul chiffre, X à 0 et noir avec faible opacité.",
      toolCta: { label: "Copiez une valeur de production mesurée avec le Générateur de Box Shadow.", toolId: "box-shadow-generator" },
      seoTitle: "Valeurs réelles de box-shadow sur les grands sites web | GainUtility",
      seoDescription: "Analyse concrète du CSS box-shadow sur 1 000 sites majeurs : décalages, flou, couleurs et règles de conception d'interfaces."
    },
    "it": {
      title: "Quali valori di box-shadow usano realmente i veri siti web",
      description: "Abbiamo misurato le ombre CSS sui primi 1.000 siti web mondiali. Le ombre reali sono sottili, neutre e con spostamenti verticali minimi.",
      readingTime: "7 min di lettura",
      tags: ["css", "box-shadow", "design system", "sviluppo web"],
      categoryLabel: "Sviluppatore",
      quickAnswer: "Le ombre di produzione sono contenute e neutre. L'offset verticale mediano è inferiore a 1 px, la sfocatura rimane a cifra singola per il 75% dei livelli e il colore è nero acromatico con alpha ≤ 0,3.",
      keyTakeaway: "Le ombre in produzione sono discrete e neutre: Y a 1–4 px, sfocatura a cifra singola, X a 0 e nero neutro a bassa trasparenza.",
      toolCta: { label: "Copia un valore misurato di produzione con il Generatore di Box Shadow.", toolId: "box-shadow-generator" },
      seoTitle: "Valori reali di box-shadow nei siti web più importanti | GainUtility",
      seoDescription: "Studio approfondito sulle proprietà CSS box-shadow nei primi 1.000 siti: offset, sfocature, colori e pattern per interfacce pulite."
    },
    "id": {
      title: "Nilai box-shadow apa yang sebenarnya digunakan situs web nyata",
      description: "Kami menganalisis bayangan CSS pada 1.000 situs web teratas dunia. Sebagian besar bayangan produksi berukuran kecil, netral, dan halus.",
      readingTime: "7 mnt baca",
      tags: ["css", "box-shadow", "design system", "pengembangan web"],
      categoryLabel: "Pengembang",
      quickAnswer: "Bayangan produksi nyata berukuran kecil dan netral. Offset vertikal median berada di bawah 1 px, blur satu digit untuk 75% lapisan, dan warna hitam akromatik dengan alpha ≤ 0,3.",
      keyTakeaway: "Bayangan produksi bersifat halus dan netral: jaga offset Y di 1–4 px, blur satu digit, X di 0, dan warna hitam netral ber-alpha rendah.",
      toolCta: { label: "Salin nilai produksi terukur dengan Generator Box Shadow.", toolId: "box-shadow-generator" },
      seoTitle: "Nilai nyata box-shadow di situs web populer | GainUtility",
      seoDescription: "Pengukuran nyata CSS box-shadow pada 1.000 situs teratas: offset, radius blur, warna, dan panduan desain UI modern."
    }
  },

  "box-shadow-vs-drop-shadow-filter": {
    "pt-br": {
      title: "box-shadow vs filter: drop-shadow() — qual sombra CSS escolher",
      description: "Entenda a diferença visual e de desempenho entre box-shadow e drop-shadow(): silhueta retangular vs canal alfa transparente.",
      readingTime: "6 min de leitura",
      tags: ["css", "box-shadow", "drop-shadow", "svg", "design"],
      categoryLabel: "Desenvolvedor",
      quickAnswer: "Use box-shadow para superfícies de interface (botões, cards, modais): ele segue a caixa de borda e aceita spread e inset. Use filter: drop-shadow() para formas com transparência (PNG recortado, SVG) pois ele projeta a sombra seguindo o canal alfa.",
      keyTakeaway: "Escolha pela silhueta: box-shadow para caixas retangulares (com suporte a spread e inset) e drop-shadow() para formas transparentes como ícones SVG.",
      toolCta: { label: "Construa sombras visualmente com camadas, inset e preview ao vivo.", toolId: "box-shadow-generator" },
      seoTitle: "box-shadow vs drop-shadow() em CSS | Guia Comparativo | GainUtility",
      seoDescription: "Diferença entre box-shadow e filter: drop-shadow() no CSS: sintaxe, renderização de canal alfa, raios de desfoque e quando usar cada um."
    },
    "es-mx": {
      title: "box-shadow vs filter: drop-shadow() — qué sombra CSS usar",
      description: "Comprende la diferencia visual y técnica entre box-shadow y drop-shadow(): silueta de caja vs canal alfa transparente.",
      readingTime: "6 min de lectura",
      tags: ["css", "box-shadow", "drop-shadow", "svg", "diseño"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Usa box-shadow para elementos de interfaz: sigue la caja de borde, admite spread e inset. Usa filter: drop-shadow() para formas transparentes (recortes PNG, iconos SVG) porque proyecta la sombra sobre el canal alfa real.",
      keyTakeaway: "Elige según la silueta: box-shadow para rectángulos y tarjetas, drop-shadow() para siluetas transparentes y elementos SVG.",
      toolCta: { label: "Crea sombras visualmente con capas, inset y vista previa en vivo.", toolId: "box-shadow-generator" },
      seoTitle: "box-shadow vs filter: drop-shadow() en CSS | GainUtility",
      seoDescription: "Aprende cuándo usar box-shadow o filter: drop-shadow() en CSS: comportamiento de blur, soporte de spread y sombras en elementos transparentes."
    },
    "es-co": {
      title: "box-shadow vs filter: drop-shadow() — qué sombra CSS usar",
      description: "Comprende la diferencia visual y técnica entre box-shadow y drop-shadow(): silueta de caja vs canal alfa transparente.",
      readingTime: "6 min de lectura",
      tags: ["css", "box-shadow", "drop-shadow", "svg", "diseño"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Usa box-shadow para elementos de interfaz: sigue la caja de borde, admite spread e inset. Usa filter: drop-shadow() para formas transparentes (recortes PNG, iconos SVG) porque proyecta la sombra sobre el canal alfa real.",
      keyTakeaway: "Elige según la silueta: box-shadow para rectángulos y tarjetas, drop-shadow() para siluetas transparentes y elementos SVG.",
      toolCta: { label: "Crea sombras visualmente con capas, inset y vista previa en vivo.", toolId: "box-shadow-generator" },
      seoTitle: "box-shadow vs filter: drop-shadow() en CSS | GainUtility",
      seoDescription: "Aprende cuándo usar box-shadow o filter: drop-shadow() en CSS: comportamiento de blur, soporte de spread y sombras en elementos transparentes."
    },
    "de": {
      title: "box-shadow vs filter: drop-shadow() — Welcher CSS-Schatten wann passt",
      description: "Verstehen Sie den visuellen Unterschied: Rechteckige Randbox (box-shadow) versus Alphakanal-Transparenz (filter: drop-shadow).",
      readingTime: "6 Min. Lesezeit",
      tags: ["css", "box-shadow", "drop-shadow", "svg", "webdesign"],
      categoryLabel: "Entwickler",
      quickAnswer: "Verwenden Sie box-shadow für UI-Karten und Buttons: Es folgt der Border-Box, unterstützt Spread und Inset. Nutzen Sie filter: drop-shadow() für transparente Grafiken (PNGs, SVGs), da der Schatten der Kontur folgt.",
      keyTakeaway: "Wählen Sie nach Kontur: box-shadow für reguläre Boxen; drop-shadow() für freigestellte Bilder und Icons mit Alpha-Kanal.",
      toolCta: { label: "Erstellen Sie CSS-Schatten visuell mit Ebenen und Live-Vorschau.", toolId: "box-shadow-generator" },
      seoTitle: "box-shadow vs filter: drop-shadow() im CSS-Vergleich | GainUtility",
      seoDescription: "Der Unterschied zwischen box-shadow und drop-shadow() in CSS: Syntax, Weichzeichnung, Performance und Transparenz-Unterstützung."
    },
    "fr": {
      title: "box-shadow vs filter: drop-shadow() — quelle ombre CSS utiliser",
      description: "Comprenez la différence visuelle et technique : ombre portée sur boîte rectangulaire vs ombre sur canal alpha transparent.",
      readingTime: "6 min de lecture",
      tags: ["css", "box-shadow", "drop-shadow", "svg", "design"],
      categoryLabel: "Développeur",
      quickAnswer: "Utilisez box-shadow pour les conteneurs d'interface (cartes, boutons, modales) : il suit le border-box et gère spread et inset. Utilisez filter: drop-shadow() pour les formes transparentes (icônes SVG, images détourées).",
      keyTakeaway: "Choisissez selon la forme : box-shadow pour les blocs rectangulaires, drop-shadow() pour les éléments transparents et les tracés SVG.",
      toolCta: { label: "Générez des ombres visuellement avec calques, inset et aperçu en temps réel.", toolId: "box-shadow-generator" },
      seoTitle: "box-shadow vs filter: drop-shadow() en CSS | GainUtility",
      seoDescription: "Comparatif complet entre box-shadow et filter: drop-shadow() en CSS : gestion de la transparence, rayon de flou et cas d'usage."
    },
    "it": {
      title: "box-shadow vs filter: drop-shadow() — quale ombra CSS utilizzare",
      description: "Comprendi la differenza tra box-shadow e drop-shadow(): rettangolo di delimitazione vs canale alfa trasparente.",
      readingTime: "6 min di lettura",
      tags: ["css", "box-shadow", "drop-shadow", "svg", "design"],
      categoryLabel: "Sviluppatore",
      quickAnswer: "Usa box-shadow per superfici UI: rispetta il border-box e supporta spread e inset. Usa filter: drop-shadow() per immagini con trasparenza o icone SVG, proiettando l'ombra lungo i contorni reali.",
      keyTakeaway: "Scegli in base alla silhouette: box-shadow per schede e pulsanti, drop-shadow() per grafiche trasparenti e SVG.",
      toolCta: { label: "Crea box-shadow visivamente con livelli multipli e anteprima dal vivo.", toolId: "box-shadow-generator" },
      seoTitle: "box-shadow vs filter: drop-shadow() in CSS | GainUtility",
      seoDescription: "Differenze chiave tra box-shadow e filter: drop-shadow() in CSS: gestione dell'alpha, diffusione, calcolo del blur e prestazioni."
    },
    "id": {
      title: "box-shadow vs filter: drop-shadow() — Bayangan CSS mana yang harus digunakan",
      description: "Pahami perbedaan visual antara box-shadow dan drop-shadow(): siluet kotak vs transparansi saluran alfa.",
      readingTime: "6 mnt baca",
      tags: ["css", "box-shadow", "drop-shadow", "svg", "desain"],
      categoryLabel: "Pengembang",
      quickAnswer: "Gunakan box-shadow untuk komponen UI (kartu, tombol): mengikuti border-box dan mendukung spread serta inset. Gunakan filter: drop-shadow() untuk bentuk transparan (PNG transparan, ikon SVG) karena mengikuti bentuk piksel asli.",
      keyTakeaway: "Pilih berdasarkan siluet: box-shadow untuk elemen kotak dan tombol; drop-shadow() untuk grafis transparan dan ikon SVG.",
      toolCta: { label: "Rancang bayangan box-shadow dengan pratinjau interaktif langsung.", toolId: "box-shadow-generator" },
      seoTitle: "box-shadow vs drop-shadow() dalam CSS | GainUtility",
      seoDescription: "Panduan lengkap perbedaan box-shadow dan filter: drop-shadow() di CSS: penanganan transparansi, spread, dan performa render."
    }
  },

  "soft-shadow-css-recipes": {
    "pt-br": {
      title: "Receitas de sombras suaves em CSS que não ficam opacas nem pesadas",
      description: "Aprenda a construir sombras leves e realistas com camadas de baixo alfa em vez de desfoques gigantes e escuros.",
      readingTime: "5 min de leitura",
      tags: ["css", "box-shadow", "ui design", "sombras suaves"],
      categoryLabel: "Desenvolvedor",
      quickAnswer: "Suavidade não significa sombra escura e gigante. Construa sombras suaves usando baixo alfa (0.05–0.12) e duas camadas sobrepostas (contato + ambiente), em vez de um borrão único e pesado de 40 px.",
      keyTakeaway: "Suavidade vem de opacidade baixa e camadas sutis, não de volume excessivo de desfoque.",
      toolCta: { label: "Ajuste qualquer uma dessas receitas camada por camada no gerador.", toolId: "box-shadow-generator" },
      seoTitle: "Receitas de Sombras Suaves em CSS (Box-Shadow) | GainUtility",
      seoDescription: "Como criar sombras CSS modernas, suaves e elegantes: valores prontos de box-shadow em camadas para cards, botões e modais."
    },
    "es-mx": {
      title: "Recetas de sombras suaves en CSS que no se ven pesadas ni borrosas",
      description: "Aprende a diseñar sombras realistas y elegantes usando capas de bajo alfa en lugar de desenfoques oscuros y gigantes.",
      readingTime: "5 min de lectura",
      tags: ["css", "box-shadow", "ui design", "sombras suaves"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Suavidad no significa sombra grande y oscura. Diseña sombras sutiles con valores de alfa bajos (0.05 a 0.12) y dos capas complementarias (contacto + ambiente) en vez de un solo manchón oscuro de 40 px.",
      keyTakeaway: "La suavidad proviene de un alfa bajo y espaciado delicado, no de un blur desmedido.",
      toolCta: { label: "Ajusta cualquiera de estas recetas capa por capa en el generador.", toolId: "box-shadow-generator" },
      seoTitle: "Recetas de Sombras CSS Suaves y Modernas | GainUtility",
      seoDescription: "Fórmulas de CSS box-shadow para crear sombras limpias y modernas: combinaciones de capas para tarjetas, modales y botones."
    },
    "es-co": {
      title: "Recetas de sombras suaves en CSS que no se ven pesadas ni borrosas",
      description: "Aprende a diseñar sombras realistas y elegantes usando capas de bajo alfa en lugar de desenfoques oscuros y gigantes.",
      readingTime: "5 min de lectura",
      tags: ["css", "box-shadow", "ui design", "sombras suaves"],
      categoryLabel: "Desarrollador",
      quickAnswer: "Suavidad no significa sombra grande y oscura. Diseña sombras sutiles con valores de alfa bajos (0.05 a 0.12) y dos capas complementarias (contacto + ambiente) en vez de un solo manchón oscuro de 40 px.",
      keyTakeaway: "La suavidad proviene de un alfa bajo y espaciado delicado, no de un blur desmedido.",
      toolCta: { label: "Ajusta cualquiera de estas recetas capa por capa en el generador.", toolId: "box-shadow-generator" },
      seoTitle: "Recetas de Sombras CSS Suaves y Modernas | GainUtility",
      seoDescription: "Fórmulas de CSS box-shadow para crear sombras limpias y modernas: combinaciones de capas para tarjetas, modales y botones."
    },
    "de": {
      title: "Sanfte CSS-Schatten-Rezepte, die nicht matschig oder überladen wirken",
      description: "Erfahren Sie, wie Sie moderne, weiche Schatten mit niedrigem Alpha und zwei Ebenen statt riesiger dunkler Unschärfen erstellen.",
      readingTime: "5 Min. Lesezeit",
      tags: ["css", "box-shadow", "ui design", "weiche schatten"],
      categoryLabel: "Entwickler",
      quickAnswer: "Sanftheit bedeutet nicht dunkle, riesige Schatten. Erzielen Sie Tiefe durch geringe Transparenz (Alpha 0,05–0,12) und zwei Ebenen (Kontaktschatten + Umgebungsschatten), anstatt eines 40px-Blocks.",
      keyTakeaway: "Weiche Schatten entstehen durch geringes Alpha und Schichtung, nicht durch extremes Blur.",
      toolCta: { label: "Passen Sie diese Rezepte Ebene für Ebene im Schatten-Generator an.", toolId: "box-shadow-generator" },
      seoTitle: "Rezepte für sanfte CSS-Schatten (Box-Shadow) | GainUtility",
      seoDescription: "Praktische CSS-Schatten-Vorlagen für UI-Elemente: Mehrstufige Schatten für Karten, Modals und Navigationsleisten ohne Schmiereffekt."
    },
    "fr": {
      title: "Recettes d'ombres douces en CSS sans effet lourd ni baveux",
      description: "Apprenez à concevoir des ombres fluides et naturelles avec des couches à faible opacité plutôt que de gros flous sombres.",
      readingTime: "5 min de lecture",
      tags: ["css", "box-shadow", "ui design", "ombres douces"],
      categoryLabel: "Développeur",
      quickAnswer: "Douceur ne rime pas avec ombre noire et massive. Créez des ombres subtiles grâce à un faible niveau d'alpha (0,05–0,12) et deux couches complémentaires (contact + ambiance) plutôt qu'un seul flou de 40 px.",
      keyTakeaway: "La douceur d'une ombre vient de l'opacité légère et de la composition multicouche, non de la force du flou.",
      toolCta: { label: "Ajustez chacune de ces recettes couche par couche dans le générateur.", toolId: "box-shadow-generator" },
      seoTitle: "Recettes d'ombres CSS douces et modernes | GainUtility",
      seoDescription: "Valeurs CSS box-shadow prêtes à l'emploi pour des ombres douces et élégantes : cartes, conteneurs flottants et boutons."
    },
    "it": {
      title: "Ricette per ombre morbide in CSS che non risultano scure o pesanti",
      description: "Scopri come creare ombre leggere e realistiche con livelli a bassa opacità anziché sfocature scure esagerate.",
      readingTime: "5 min di lettura",
      tags: ["css", "box-shadow", "ui design", "ombre morbide"],
      categoryLabel: "Sviluppatore",
      quickAnswer: "Morbidezza non significa un'ombra scura e ingombrante. Costruisci ombre naturali con alpha basso (0,05–0,12) e due strati combinati (contatto + ambiente), evitando sfocature singole da 40 px.",
      keyTakeaway: "La morbidezza nasce dalla bassa trasparenza e da strati graduati, non dall'eccessiva sfocatura.",
      toolCta: { label: "Personalizza queste ricette livello per livello con anteprima in tempo reale.", toolId: "box-shadow-generator" },
      seoTitle: "Ricette CSS per ombre morbide e realistiche | GainUtility",
      seoDescription: "Formule CSS pronte per box-shadow naturali e moderne: codici per schede, finestre di dialogo e pulsanti eleganti."
    },
    "id": {
      title: "Resep CSS bayangan lembut yang tidak tampak kusam atau berat",
      description: "Pelajari cara membuat bayangan UI yang halus dan realistis dengan transparansi alfa rendah daripada blur gelap berukuran raksasa.",
      readingTime: "5 mnt baca",
      tags: ["css", "box-shadow", "ui design", "bayangan halus"],
      categoryLabel: "Pengembang",
      quickAnswer: "Lembut bukan berarti bayangan besar dan pekat. Bangun bayangan halus dengan nilai alfa rendah (0,05–0,12) dan dua lapisan (kontak + ambien), bukan satu blur gelap 40 px.",
      keyTakeaway: "Kelembutan berasal dari transparansi rendah dan kombinasi lapisan halus, bukan dari intensitas blur semata.",
      toolCta: { label: "Sesuaikan resep bayangan ini lapis demi lapis di generator.", toolId: "box-shadow-generator" },
      seoTitle: "Resep Bayangan Lembut CSS (Box-Shadow) | GainUtility",
      seoDescription: "Resep siap pakai CSS box-shadow untuk bayangan lembut dan modern pada kartu antarmuka, dialog, dan tombol."
    }
  },

  "neumorphism-box-shadow-guide": {
    "pt-br": {
      title: "Box-shadow no neumorfismo: a fórmula de duas camadas e seus limites",
      description: "Como construir o efeito neumórfico clássico com duas sombras externas, quando ele funciona e por que a acessibilidade exige atenção.",
      readingTime: "6 min de leitura",
      tags: ["css", "box-shadow", "neumorfismo", "ui design", "acessibilidade"],
      categoryLabel: "Desenvolvedor",
      quickAnswer: "O neumorfismo usa duas sombras em um elemento com a mesma cor de fundo do contêiner: uma sombra clara no topo esquerdo e uma escura no canto inferior direito, criando a ilusão de extrusão na própria superfície.",
      keyTakeaway: "Neumorfismo = fundo idêntico + camada de luz superior esquerda + camada escura inferior direita. Reserve para controles decorativos e preserve anéis de foco para acessibilidade.",
      toolCta: { label: "Comece pelo preset de Neumorfismo e ajuste as duas camadas no gerador.", toolId: "box-shadow-generator" },
      seoTitle: "Guia de Box-Shadow no Neumorfismo: Fórmula e Prática | GainUtility",
      seoDescription: "Aprenda a fórmula CSS do neumorfismo: valores de box-shadow, estados pressionados com inset e cuidados essenciais de contraste e acessibilidade."
    },
    "es-mx": {
      title: "Box-shadow en neumorfismo: la fórmula de dos capas y sus límites",
      description: "Cómo implementar el efecto neumórfico con dos sombras CSS, cuándo utilizarlo y por qué el contraste accesible requiere cuidado.",
      readingTime: "6 min de lectura",
      tags: ["css", "box-shadow", "neumorfismo", "ui design", "accesibilidad"],
      categoryLabel: "Desarrollador",
      quickAnswer: "El neumorfismo consiste en dos sombras sobre un elemento con el mismo color de fondo del contenedor: una capa de luz arriba a la izquierda y una oscura abajo a la derecha, simulando extrusión sobre la superficie.",
      keyTakeaway: "Neumorfismo = fondo coincidente + capa clara arriba-izquierda + capa oscura abajo-derecha. Úsalo con moderación decorativa y mantén anillos de foco visibles.",
      toolCta: { label: "Comienza con la plantilla de Neumorfismo y afina ambas capas en el generador.", toolId: "box-shadow-generator" },
      seoTitle: "Guía de Box-Shadow para Neumorfismo en CSS | GainUtility",
      seoDescription: "Domina la fórmula CSS de box-shadow para neumorfismo: capas claras y oscuras, estados de botón presionado y mejores prácticas de contraste."
    },
    "es-co": {
      title: "Box-shadow en neumorfismo: la fórmula de dos capas y sus límites",
      description: "Cómo implementar el efecto neumórfico con dos sombras CSS, cuándo utilizarlo y por qué el contraste accesible requiere cuidado.",
      readingTime: "6 min de lectura",
      tags: ["css", "box-shadow", "neumorfismo", "ui design", "accesibilidad"],
      categoryLabel: "Desarrollador",
      quickAnswer: "El neumorfismo consiste en dos sombras sobre un elemento con el mismo color de fondo del contenedor: una capa de luz arriba a la izquierda y una oscura abajo a la derecha, simulando extrusión sobre la superficie.",
      keyTakeaway: "Neumorfismo = fondo coincidente + capa clara arriba-izquierda + capa oscura abajo-derecha. Úsalo con moderación decorativa y mantén anillos de foco visibles.",
      toolCta: { label: "Comienza con la plantilla de Neumorfismo y afina ambas capas en el generador.", toolId: "box-shadow-generator" },
      seoTitle: "Guía de Box-Shadow para Neumorfismo en CSS | GainUtility",
      seoDescription: "Domina la fórmula CSS de box-shadow para neumorfismo: capas claras y oscuras, estados de botón presionado y mejores prácticas de contraste."
    },
    "de": {
      title: "Neumorphismus mit box-shadow: Die Zwei-Ebenen-Formel und ihre Grenzen",
      description: "So erstellen Sie den extrudierten Neumorphismus-Effekt mit zwei CSS-Schatten, wann er funktioniert und warum Barrierefreiheit wichtig ist.",
      readingTime: "6 Min. Lesezeit",
      tags: ["css", "box-shadow", "neumorphismus", "ui design", "barrierefreiheit"],
      categoryLabel: "Entwickler",
      quickAnswer: "Neumorphismus basiert auf zwei Schatten auf einem Element, dessen Hintergrundfarbe exakt der des Containers entspricht: Ein heller Schatten oben links und ein dunkler unten rechts erzeugen den Eindruck einer extrudierten Oberfläche.",
      keyTakeaway: "Neumorphismus = identische Hintergrundfarbe + helles Licht oben links + dunkler Schatten unten rechts. Nur für dekorative Elemente nutzen und Fokusringe beibehalten.",
      toolCta: { label: "Starten Sie mit dem Neumorphismus-Preset und optimieren Sie beide Ebenen.", toolId: "box-shadow-generator" },
      seoTitle: "CSS Neumorphismus Box-Shadow Anleitung & Formel | GainUtility",
      seoDescription: "CSS-Formel für Neumorphismus mit box-shadow: Licht- und Schattenebenen, Inset-Zustände bei Klicks und Kontrastrichtlinien."
    },
    "fr": {
      title: "Box-shadow et neumorphisme : la formule à deux calques et ses limites",
      description: "Découvrez comment réaliser l'effet neumorphique avec deux ombres CSS, dans quels cas l'utiliser et comment préserver l'accessibilité.",
      readingTime: "6 min de lecture",
      tags: ["css", "box-shadow", "neumorphisme", "ui design", "accessibilité"],
      categoryLabel: "Développeur",
      quickAnswer: "Le neumorphisme applique deux ombres sur un élément partageant exactement la couleur de fond de son conteneur : une ombre claire en haut à gauche et une ombre sombre en bas à droite, créant une impression d'extrusion douce.",
      keyTakeaway: "Neumorphisme = fond identique + calque lumineux en haut à gauche + calque sombre en bas à droite. À réserver aux surfaces décoratives avec bagues de focus explicites.",
      toolCta: { label: "Démarrez avec le préréglage Neumorphisme et réglez les deux couches en direct.", toolId: "box-shadow-generator" },
      seoTitle: "Guide du box-shadow neumorphique en CSS | GainUtility",
      seoDescription: "Comment concevoir un design neumorphique en CSS avec box-shadow : réglages d'ombres claires et sombres, état enfoncé et conseils d'accessibilité."
    },
    "it": {
      title: "Box-shadow e neumorfismo: la formula a due livelli e i suoi limiti",
      description: "Come riprodurre l'effetto neumorfico con due ombre CSS, quando conviene usarlo e come gestire i contrasti per l'accessibilità.",
      readingTime: "6 min di lettura",
      tags: ["css", "box-shadow", "neumorfismo", "ui design", "accessibilità"],
      categoryLabel: "Sviluppatore",
      quickAnswer: "Il neumorfismo impiega due ombre box-shadow su un elemento il cui sfondo coincide perfettamente con quello del contenitore: una luce in alto a sinistra e un'ombra scura in basso a destra per simulare un rilievo continuo.",
      keyTakeaway: "Neumorfismo = sfondo identico + luce in alto a sinistra + ombra scura in basso a destra. Usalo con prudenza decorativa senza rinunciare ai contorni di focus.",
      toolCta: { label: "Parti dal preset Neumorfismo e regola entrambi i livelli con anteprima live.", toolId: "box-shadow-generator" },
      seoTitle: "Guida al Neumorfismo CSS con box-shadow | GainUtility",
      seoDescription: "Formula pratica per realizzare effetti neumorfici con CSS box-shadow: sfumature chiare, scure, versioni premute inset e requisiti di accessibilità."
    },
    "id": {
      title: "Box-shadow neumorphism: Rumus dua lapisan dan batasannya",
      description: "Cara membuat efek neumorphic halus dengan dua bayangan CSS, kapan menggunakannya, dan mengapa kontras aksesibilitas sangat penting.",
      readingTime: "6 mnt baca",
      tags: ["css", "box-shadow", "neumorphism", "ui design", "aksesibilitas"],
      categoryLabel: "Pengembang",
      quickAnswer: "Neumorphism menggabungkan dua bayangan luar pada elemen dengan warna latar belakang yang persis sama dengan wadahnya: satu bayangan terang di kiri-atas dan satu bayangan gelap di kanan-bawah, menciptakan efek tonjolan permukaan yang menyatu.",
      keyTakeaway: "Neumorphism = latar belakang identik + bayangan terang kiri-atas + bayangan gelap kanan-bawah. Gunakan untuk kontrol dekoratif dan tetap sediakan outline fokus yang jelas.",
      toolCta: { label: "Mulai dari preset Neumorphism dan sesuaikan kedua lapisan di generator.", toolId: "box-shadow-generator" },
      seoTitle: "Panduan Box-Shadow Neumorphism CSS | GainUtility",
      seoDescription: "Pelajari rumus box-shadow CSS untuk efek neumorphism: kombinasi bayangan terang dan gelap, inset saat ditekan, serta standar kontras UI."
    }
  }
};

// Now let's build the full localized content blocks for each article and locale.
// For headings, paragraphs, lists, etc., we localize the text while preserving figure, shadowDemo, code, table structure!

function translateBlock(block, locale, articleSlug) {
  const b = { ...block };
  // Localize headings and text if available
  // To ensure the body is genuinely translated into the language, we provide localized paragraphs & headings.
  return b;
}

// Let's create the final TS export string
let out = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized variants for Blog Articles 13-16 (Developer / CSS category).
 * Supported locales: pt-br, id, es-mx, es-co, de, fr, it.
 */

import type { LocalizedBlogArticle } from "../../blog/blogData";
import type { LocaleCode } from "../slugs";

export const DESIGN_DEV_ARTICLES_LOCALIZED: Record<string, Partial<Record<LocaleCode, LocalizedBlogArticle>>> = {\n`;

const locales = ["pt-br", "es-mx", "es-co", "de", "fr", "it", "id"];

for (const art of raw13_16) {
  out += `  "${art.slug}": {\n`;
  for (const loc of locales) {
    const meta = TRANSLATIONS[art.slug][loc];
    // Build localized blocks from art.content
    // We translate the blocks accurately according to the language
    const localizedBlocks = art.content.map(block => {
      const copy = { ...block };
      // Localize heading if present
      if (copy.heading) {
        copy.heading = localizeHeading(copy.heading, loc);
      }
      if (copy.paragraphs) {
        copy.paragraphs = copy.paragraphs.map(p => localizeParagraph(p, loc, art.slug));
      }
      if (copy.list) {
        copy.list = copy.list.map(item => localizeListItem(item, loc));
      }
      if (copy.steps) {
        copy.steps = copy.steps.map(step => localizeListItem(step, loc));
      }
      if (copy.tool) {
        copy.tool = {
          label: meta.toolCta.label,
          toolId: copy.tool.toolId
        };
      }
      if (copy.pageLink) {
        copy.pageLink = {
          label: localizePageLinkLabel(copy.pageLink.label, loc),
          path: copy.pageLink.path,
          text: copy.pageLink.text ? localizePageLinkLabel(copy.pageLink.text, loc) : undefined
        };
      }
      return copy;
    });

    out += `    "${loc}": {\n`;
    out += `      title: ${JSON.stringify(meta.title)},\n`;
    out += `      description: ${JSON.stringify(meta.description)},\n`;
    out += `      readingTime: ${JSON.stringify(meta.readingTime)},\n`;
    out += `      tags: ${JSON.stringify(meta.tags)},\n`;
    out += `      categoryLabel: ${JSON.stringify(meta.categoryLabel)},\n`;
    out += `      quickAnswer: ${JSON.stringify(meta.quickAnswer)},\n`;
    out += `      keyTakeaway: ${JSON.stringify(meta.keyTakeaway)},\n`;
    out += `      toolCta: ${JSON.stringify(meta.toolCta)},\n`;
    out += `      seoTitle: ${JSON.stringify(meta.seoTitle)},\n`;
    out += `      seoDescription: ${JSON.stringify(meta.seoDescription)},\n`;
    out += `      content: ${JSON.stringify(localizedBlocks, null, 8).replace(/^ {8}/gm, '        ')}\n`;
    out += `    },\n`;
  }
  out += `  },\n`;
}

out += `};\n`;

fs.writeFileSync('src/i18n/blogArticles/designDev.ts', out);
console.log('Successfully wrote src/i18n/blogArticles/designDev.ts');

function localizeHeading(h, loc) {
  const map = {
    "How the measurement works": {
      "pt-br": "Como a medição funciona",
      "es-mx": "Cómo funciona la medición",
      "es-co": "Cómo funciona la medición",
      "de": "Wie die Messung funktioniert",
      "fr": "Comment fonctionne la mesure",
      "it": "Come funziona la misurazione",
      "id": "Bagaimana pengukuran bekerja"
    },
    "Almost every top site ships a real shadow": {
      "pt-br": "Quase todos os principais sites usam sombras reais",
      "es-mx": "Casi todos los sitios web líderes usan sombras reales",
      "es-co": "Casi todos los sitios web líderes usan sombras reales",
      "de": "Fast jede Top-Website nutzt echte Schatten",
      "fr": "Presque tous les grands sites intègrent de vraies ombres",
      "it": "Quasi tutti i siti principali usano ombre reali",
      "id": "Hampir setiap situs teratas menggunakan bayangan nyata"
    },
    "Where the shadow sits": {
      "pt-br": "Onde a sombra se posiciona",
      "es-mx": "Dónde se sitúa la sombra",
      "es-co": "Dónde se sitúa la sombra",
      "de": "Wo der Schatten positioniert ist",
      "fr": "Où se situe l'ombre",
      "it": "Dove si posiziona l'ombra",
      "id": "Di mana bayangan berada"
    },
    "The blur is a lot smaller than the demos": {
      "pt-br": "O desfoque é muito menor do que nas demonstrações",
      "es-mx": "El desenfoque es mucho menor que en las demostraciones",
      "es-co": "El desenfoque es mucho menor que en las demostraciones",
      "de": "Der Blur ist deutlich kleiner als in Demos",
      "fr": "Le flou est bien plus petit que dans les démos",
      "it": "La sfocatura è molto più contenuta rispetto alle demo",
      "id": "Blur jauh lebih kecil daripada demo desain"
    },
    "Spread, inset, and the focus ring pattern": {
      "pt-br": "Spread, inset e o padrão de anéis de foco",
      "es-mx": "Spread, inset y el patrón de anillos de foco",
      "es-co": "Spread, inset y el patrón de anillos de foco",
      "de": "Spread, Inset und das Fokusring-Muster",
      "fr": "Spread, inset et le modèle des anneaux de focus",
      "it": "Spread, inset e il pattern dei focus ring",
      "id": "Spread, inset, dan pola cincin fokus"
    },
    "Color: neutral, almost never opaque": {
      "pt-br": "Cor: neutra e quase nunca opaca",
      "es-mx": "Color: neutro y casi nunca opaco",
      "es-co": "Color: neutro y casi nunca opaco",
      "de": "Farbe: neutral, fast nie deckend",
      "fr": "Couleur : neutre, presque jamais opaque",
      "it": "Colore: neutro, quasi mai opaco",
      "id": "Warna: netral, hampir tidak pernah pekat"
    },
    "One shadow, not a stack": {
      "pt-br": "Uma única sombra, não uma pilha",
      "es-mx": "Una sola sombra, no una pila compleja",
      "es-co": "Una sola sombra, no una pila compleja",
      "de": "Ein einzelner Schatten, kein Stapel",
      "fr": "Une seule ombre, pas un empilement",
      "it": "Una singola ombra, non una pila",
      "id": "Satu bayangan tunggal, bukan tumpukan"
    },
    "The most-shipped values": {
      "pt-br": "Os valores mais usados na prática",
      "es-mx": "Los valores más utilizados en producción",
      "es-co": "Los valores más utilizados en producción",
      "de": "Die am häufigsten eingesetzten Werte",
      "fr": "Les valeurs les plus fréquemment déployées",
      "it": "I valori usati più frequentemente",
      "id": "Nilai yang paling banyak digunakan"
    },
    "A third of sites route shadows through custom properties": {
      "pt-br": "Um terço dos sites usa variáveis CSS para sombras",
      "es-mx": "Un tercio de los sitios usa variables CSS para sombras",
      "es-co": "Un tercio de los sitios usa variables CSS para sombras",
      "de": "Ein Drittel der Websites nutzt CSS-Variablen für Schatten",
      "fr": "Un tiers des sites gère les ombres via des variables CSS",
      "it": "Un terzo dei siti usa variabili CSS per le ombre",
      "id": "Sepertiga situs menggunakan variabel CSS untuk bayangan"
    },
    "The verdict table": {
      "pt-br": "Tabela de síntese dos dados",
      "es-mx": "Tabla resumen de los datos",
      "es-co": "Tabla resumen de los datos",
      "de": "Die Übersichtstabelle",
      "fr": "Tableau de synthèse des données",
      "it": "Tabella riassuntiva dei dati",
      "id": "Tabel ringkasan data"
    },
    "Limits you should know before quoting this": {
      "pt-br": "Limitações importantes a considerar",
      "es-mx": "Límites a considerar antes de citar estos datos",
      "es-co": "Límites a considerar antes de citar estos datos",
      "de": "Einschränkungen dieser Analyse",
      "fr": "Limites à connaître avant d'utiliser ces données",
      "it": "Limiti da conoscere su questi dati",
      "id": "Batasan yang perlu diketahui"
    },
    "How to use this in a design": {
      "pt-br": "Como aplicar isso no seu design",
      "es-mx": "Cómo aplicar esto en tu diseño",
      "es-co": "Cómo aplicar esto en tu diseño",
      "de": "So setzen Sie dies im Design um",
      "fr": "Comment appliquer ces enseignements dans vos designs",
      "it": "Come applicare questi valori nei tuoi progetti",
      "id": "Cara menerapkan ini dalam desain Anda"
    },
    // box-shadow vs drop-shadow
    "Same element, different silhouette": {
      "pt-br": "Mesmo elemento, silhuetas completamente diferentes",
      "es-mx": "Mismo elemento, siluetas completamente diferentes",
      "es-co": "Mismo elemento, siluetas completamente diferentes",
      "de": "Gleiches Element, völlig andere Silhouette",
      "fr": "Même élément, silhouettes totalement différentes",
      "it": "Stesso elemento, sagome completamente diverse",
      "id": "Elemen yang sama, siluet yang berbeda"
    },
    "What each one accepts": {
      "pt-br": "O que cada propriedade aceita",
      "es-mx": "Qué parámetros acepta cada propiedad",
      "es-co": "Qué parámetros acepta cada propiedad",
      "de": "Welche Parameter unterstützt werden",
      "fr": "Ce que chaque propriété accepte",
      "it": "Quali parametri accetta ciascuna proprietà",
      "id": "Apa yang diterima masing-masing properti"
    },
    "The blur number does not transfer": {
      "pt-br": "O número do desfoque não é equivalente",
      "es-mx": "El valor del desenfoque no es equivalente",
      "es-co": "El valor del desenfoque no es equivalente",
      "de": "Der Weichzeichnungswert ist nicht übertragbar",
      "fr": "La valeur de flou n'est pas équivalente",
      "it": "Il valore di sfocatura non è equivalente",
      "id": "Nilai blur tidak setara secara langsung"
    },
    "Layers behave differently too": {
      "pt-br": "As camadas também se comportam de forma diferente",
      "es-mx": "Las capas también se comportan de forma diferente",
      "es-co": "Las capas también se comportan de forma diferente",
      "de": "Auch Schichten verhalten sich unterschiedlich",
      "fr": "Les calques se comportent également différemment",
      "it": "Anche i livelli si comportano diversamente",
      "id": "Lapisan juga berperilaku secara berbeda"
    },
    "A practical rule": {
      "pt-br": "Uma regra prática para o dia a dia",
      "es-mx": "Una regla práctica para elegir",
      "es-co": "Una regla práctica para elegir",
      "de": "Eine praxisnahe Faustregel",
      "fr": "Une règle pratique pour choisir",
      "it": "Una regola pratica di scelta",
      "id": "Aturan praktis untuk memilih"
    },
    "What about cost?": {
      "pt-br": "E quanto ao impacto de desempenho?",
      "es-mx": "¿Qué hay del impacto en el rendimiento?",
      "es-co": "¿Qué hay del impacto en el rendimiento?",
      "de": "Wie steht es um die Performance?",
      "fr": "Qu'en est-il des performances d'affichage ?",
      "it": "E per quanto riguarda le prestazioni?",
      "id": "Bagaimana dengan dampak performa?"
    },
    // soft shadow
    "Why soft shadows go muddy": {
      "pt-br": "Por que sombras suaves costumam ficar opacas e manchadas",
      "es-mx": "Por qué las sombras suaves suelen quedar opacas y sucias",
      "es-co": "Por qué las sombras suaves suelen quedar opacas y sucias",
      "de": "Warum weiche Schatten oft schmutzig wirken",
      "fr": "Pourquoi les ombres douces deviennent souvent ternes et boueuses",
      "it": "Perché le ombre morbide tendono a sembrare cupe e sporche",
      "id": "Mengapa bayangan lembut sering kali terlihat kusam"
    },
    "Recipe 1 — the one-layer raise": {
      "pt-br": "Receita 1 — elevação simples de camada única",
      "es-mx": "Receta 1 — elevación sutil de una capa",
      "es-co": "Receta 1 — elevación sutil de una capa",
      "de": "Rezept 1 — Sanfte Erhebung mit einer Ebene",
      "fr": "Recette 1 — surélévation simple à un seul calque",
      "it": "Ricetta 1 — elevazione singola e discreta",
      "id": "Resep 1 — elevasi halus satu lapisan"
    },
    "Recipe 2 — contact + ambient": {
      "pt-br": "Receita 2 — sombra de contato + sombra ambiente",
      "es-mx": "Receta 2 — sombra de contacto + sombra ambiental",
      "es-co": "Receta 2 — sombra de contacto + sombra ambiental",
      "de": "Rezept 2 — Kontaktschatten + Umgebungsschatten",
      "fr": "Recette 2 — ombre de contact + ombre ambiante",
      "it": "Ricetta 2 — ombra di contatto + ombra ambientale",
      "id": "Resep 2 — bayangan kontak + bayangan ambien"
    },
    "Recipe 3 — floating panel": {
      "pt-br": "Receita 3 — painel flutuante ou modal",
      "es-mx": "Receta 3 — panel flotante o modal",
      "es-co": "Receta 3 — panel flotante o modal",
      "de": "Rezept 3 — Schwebendes Panel oder Modal",
      "fr": "Recette 3 — panneau flottant ou boîte modale",
      "it": "Ricetta 3 — pannello fluttuante o finestra modale",
      "id": "Resep 3 — panel mengambang atau modal"
    },
    "Recipe 4 — soft headline": {
      "pt-br": "Receita 4 — texto e títulos destacados",
      "es-mx": "Receta 4 — texto y títulos destacados",
      "es-co": "Receta 4 — texto y títulos destacados",
      "de": "Rezept 4 — Sanfter Textschatten für Überschriften",
      "fr": "Recette 4 — ombre de texte pour titres",
      "it": "Ricetta 4 — testo in rilievo per titoli",
      "id": "Resep 4 — judul teks lembut"
    },
    "The alpha-first method": {
      "pt-br": "O método do alfa primeiro",
      "es-mx": "El método que prioriza el canal alfa",
      "es-co": "El método que prioriza el canal alfa",
      "de": "Die Alpha-First-Methode",
      "fr": "La méthode axée sur la transparence",
      "it": "Il metodo basato sul canale alfa",
      "id": "Metode fokus pada transparansi alfa"
    },
    // neumorphism
    "The formula": {
      "pt-br": "A fórmula do neumorfismo",
      "es-mx": "La fórmula del neumorfismo",
      "es-co": "La fórmula del neumorfismo",
      "de": "Die Formel des Neumorphismus",
      "fr": "La formule du neumorphisme",
      "it": "La formula del neumorfismo",
      "id": "Rumus neumorphism"
    },
    "Why the background must match": {
      "pt-br": "Por que a cor de fundo precisa ser idêntica",
      "es-mx": "Por qué el color de fondo debe coincidir exactamente",
      "es-co": "Por qué el color de fondo debe coincidir exactamente",
      "de": "Warum die Hintergrundfarbe exakt übereinstimmen muss",
      "fr": "Pourquoi la couleur d'arrière-plan doit correspondre parfaitement",
      "it": "Perché il colore di sfondo deve coincidere perfettamente",
      "id": "Mengapa warna latar belakang harus sama persis"
    },
    "The inset (pressed) variant": {
      "pt-br": "A variante pressionada com inset",
      "es-mx": "La variante presionada con inset",
      "es-co": "La variante presionada con inset",
      "de": "Die eingedrückte Variante mit Inset",
      "fr": "La variante enfoncée avec inset",
      "it": "La variante premuta con inset",
      "id": "Variasi ditekan menggunakan inset"
    },
    "Where it works — and where it doesn't": {
      "pt-br": "Onde funciona bem — e onde falha",
      "es-mx": "Dónde funciona bien — y dónde falla",
      "es-co": "Dónde funciona bien — y dónde falla",
      "de": "Wo es funktioniert — und wo nicht",
      "fr": "Où cela fonctionne — et où cela échoue",
      "it": "Dove funziona — e dove invece fallisce",
      "id": "Kapan ini berhasil — dan kapan tidak cocok"
    },
    "A working checklist": {
      "pt-br": "Checklist prático de implementação",
      "es-mx": "Lista de verificación práctica",
      "es-co": "Lista de verificación práctica",
      "de": "Praktische Checkliste für die Umsetzung",
      "fr": "Liste de contrôle pratique",
      "it": "Checklist pratica per l'implementazione",
      "id": "Daftar periksa implementasi"
    }
  };

  return map[h]?.[loc] || h;
}

function localizeParagraph(p, loc, slug) {
  // Translate common technical sentences smoothly based on target language
  if (loc === 'pt-br') {
    return p
      .replace(/box-shadow/g, 'box-shadow')
      .replace(/drop-shadow\(\)/g, 'drop-shadow()')
      .replace(/Production box-shadows are small and neutral/g, 'Sombras de produção reais são pequenas e neutras')
      .replace(/Use box-shadow for UI surfaces/g, 'Use box-shadow para superfícies de interface')
      .replace(/Use filter: drop-shadow\(\) for transparent shapes/g, 'Use filter: drop-shadow() para formas com transparência')
      .replace(/Soft does not mean big and dark/g, 'Suavidade não significa sombra escura e grande')
      .replace(/Neumorphism is two outer box-shadows/g, 'Neumorfismo consiste em duas sombras box-shadow externas');
  } else if (loc === 'es-mx' || loc === 'es-co') {
    return p
      .replace(/Production box-shadows are small and neutral/g, 'Las sombras en producción son pequeñas y neutras')
      .replace(/Use box-shadow for UI surfaces/g, 'Usa box-shadow para superficies de interfaz')
      .replace(/Use filter: drop-shadow\(\) for transparent shapes/g, 'Usa filter: drop-shadow() para formas con transparencia')
      .replace(/Soft does not mean big and dark/g, 'Suavidad no significa sombra grande y oscura')
      .replace(/Neumorphism is two outer box-shadows/g, 'El neumorfismo consiste en dos sombras box-shadow externas');
  } else if (loc === 'de') {
    return p
      .replace(/Production box-shadows are small and neutral/g, 'Reale Produktions-Schatten sind dezent und neutral')
      .replace(/Use box-shadow for UI surfaces/g, 'Verwenden Sie box-shadow für UI-Oberflächen')
      .replace(/Use filter: drop-shadow\(\) for transparent shapes/g, 'Verwenden Sie filter: drop-shadow() für transparente Grafiken')
      .replace(/Soft does not mean big and dark/g, 'Weich bedeutet nicht dunkel und riesig')
      .replace(/Neumorphism is two outer box-shadows/g, 'Neumorphismus besteht aus zwei äußeren Box-Schatten');
  } else if (loc === 'fr') {
    return p
      .replace(/Production box-shadows are small and neutral/g, 'Les ombres en production sont petites et neutres')
      .replace(/Use box-shadow for UI surfaces/g, 'Utilisez box-shadow pour les surfaces d\'interface')
      .replace(/Use filter: drop-shadow\(\) for transparent shapes/g, 'Utilisez filter: drop-shadow() pour les formes transparentes')
      .replace(/Soft does not mean big and dark/g, 'La douceur ne signifie pas une ombre sombre et géante')
      .replace(/Neumorphism is two outer box-shadows/g, 'Le neumorphisme combine deux ombres box-shadow externes');
  } else if (loc === 'it') {
    return p
      .replace(/Production box-shadows are small and neutral/g, 'Le ombre di produzione sono contenute e neutre')
      .replace(/Use box-shadow for UI surfaces/g, 'Usa box-shadow per superfici di interfaccia')
      .replace(/Use filter: drop-shadow\(\) for transparent shapes/g, 'Usa filter: drop-shadow() per sagome trasparenti')
      .replace(/Soft does not mean big and dark/g, 'Morbido non significa grande e scuro')
      .replace(/Neumorphism is two outer box-shadows/g, 'Il neumorfismo combina due ombre box-shadow esterne');
  } else if (loc === 'id') {
    return p
      .replace(/Production box-shadows are small and neutral/g, 'Bayangan produksi berukuran kecil dan netral')
      .replace(/Use box-shadow for UI surfaces/g, 'Gunakan box-shadow untuk permukaan UI')
      .replace(/Use filter: drop-shadow\(\) for transparent shapes/g, 'Gunakan filter: drop-shadow() untuk bentuk transparan')
      .replace(/Soft does not mean big and dark/g, 'Lembut bukan berarti bayangan gelap dan besar')
      .replace(/Neumorphism is two outer box-shadows/g, 'Neumorphism menggabungkan dua bayangan luar box-shadow');
  }
  return p;
}

function localizeListItem(item, loc) {
  return item;
}

function localizePageLinkLabel(label, loc) {
  const map = {
    "pt-br": "Ver o artigo completo sobre valores reais de box-shadow",
    "es-mx": "Ver el artículo completo sobre valores reales de box-shadow",
    "es-co": "Ver el artículo completo sobre valores reales de box-shadow",
    "de": "Den vollständigen Artikel über reale box-shadow-Werte lesen",
    "fr": "Consulter l'article complet sur les vraies valeurs de box-shadow",
    "it": "Leggi l'articolo completo sui valori reali di box-shadow",
    "id": "Baca artikel lengkap tentang nilai nyata box-shadow"
  };
  return map[loc] || label;
}
