/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';

const raw13_16 = JSON.parse(fs.readFileSync('scratch/articles-13-16.json', 'utf8'));
const raw17_20 = JSON.parse(fs.readFileSync('scratch/articles-17-20.json', 'utf8'));
const locales = ["pt-br", "es-mx", "es-co", "de", "fr", "it", "id"];

export function buildDesignDev() {
  const trans13_16 = {
    "box-shadow-values-real-websites": {
      meta: {
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
      }
    },
    "box-shadow-vs-drop-shadow-filter": {
      meta: {
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
      }
    },
    "soft-shadow-css-recipes": {
      meta: {
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
      }
    },
    "neumorphism-box-shadow-guide": {
      meta: {
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
          seoTitle: "Guia de Box-Shadow para Neumorfismo en CSS | GainUtility",
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
          seoTitle: "Guia de Box-Shadow para Neumorfismo en CSS | GainUtility",
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
          readingTime: "6 min de lettura",
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
    }
  };

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

  for (const art of raw13_16) {
    out += `  "${art.slug}": {\n`;
    for (const loc of locales) {
      const meta = trans13_16[art.slug].meta[loc];
      const localizedContent = translateBlocks(art.content, loc, art.slug, meta);

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
      out += `      content: ${JSON.stringify(localizedContent, null, 8).replace(/^ {8}/gm, '        ')}\n`;
      out += `    },\n`;
    }
    out += `  },\n`;
  }

  out += `};\n`;
  fs.writeFileSync('src/i18n/blogArticles/designDev.ts', out);
  console.log('Generated src/i18n/blogArticles/designDev.ts');
}

export function buildDevSeo() {
  const trans17_20 = {
    "format-and-debug-json-when-api-responses-are-unreadable": {
      meta: {
        "pt-br": {
          title: "Como ler e corrigir JSON ilegível retornado por uma API",
          description: "Três pequenos hábitos para transformar qualquer resposta JSON desorganizada em algo legível e fácil de inspecionar: formatar, validar e comparar.",
          readingTime: "4 min de leitura",
          tags: ["json", "api", "desenvolvedor", "produtividade"],
          categoryLabel: "Desenvolvedor",
          quickAnswer: "Formate a resposta primeiro, valide se algo falhar no parse e faça um diff contra uma cópia válida após qualquer alteração. Formatar → validar → comparar: essa sequência resolve quase tudo.",
          keyTakeaway: "Formatar → validar → comparar: três hábitos simples tornam qualquer resposta JSON ilegível em uma estrutura lógica e compreensível.",
          toolCta: { label: "Recebeu um JSON minificado ou com erro? Comece pelo Formatador.", toolId: "json-beautifier" },
          seoTitle: "Como formatar e depurar respostas JSON de APIs | GainUtility",
          seoDescription: "Aprenda a inspecionar, embelezar e validar retornos JSON de APIs: fluxo prático de formatação, detecção de erros de sintaxe e comparação diff."
        },
        "es-mx": {
          title: "Cómo leer y corregir JSON ilegible de una API",
          description: "Tres hábitos simples para transformar respuestas JSON minificadas en estructuras claras: formatear, validar y comparar.",
          readingTime: "4 min de lectura",
          tags: ["json", "api", "desarrollador", "productividad"],
          categoryLabel: "Desarrollador",
          quickAnswer: "Formatea la respuesta primero, valida si falla el parseo y compara con una versión correcta mediante diff. Formatear → validar → comparar es el hábito definitivo.",
          keyTakeaway: "Formatear → validar → comparar: tres pasos rápidos para entender y depurar cualquier respuesta JSON de API sin frustración.",
          toolCta: { label: "¿Tienes una respuesta JSON minificada o rota? Empieza con el Formateador.", toolId: "json-beautifier" },
          seoTitle: "Cómo formatear y depurar JSON de APIs | GainUtility",
          seoDescription: "Aprende a embellecer, validar y comparar respuestas JSON de APIs en el navegador de manera instantánea y privada."
        },
        "es-co": {
          title: "Cómo leer y corregir JSON ilegible de una API",
          description: "Tres hábitos simples para transformar respuestas JSON minificadas en estructuras claras: formatear, validar y comparar.",
          readingTime: "4 min de lectura",
          tags: ["json", "api", "desarrollador", "productividad"],
          categoryLabel: "Desarrollador",
          quickAnswer: "Formatea la respuesta primero, valida si falla el parseo y compara con una versión correcta mediante diff. Formatear → validar → comparar es el hábito definitivo.",
          keyTakeaway: "Formatear → validar → comparar: tres pasos rápidos para entender y depurar cualquier respuesta JSON de API sin frustración.",
          toolCta: { label: "¿Tienes una respuesta JSON minificada o rota? Empieza con el Formateador.", toolId: "json-beautifier" },
          seoTitle: "Cómo formatear y depurar JSON de APIs | GainUtility",
          seoDescription: "Aprende a embellecer, validar y comparar respuestas JSON de APIs en el navegador de manera instantánea y privada."
        },
        "de": {
          title: "So lesen und reparieren Sie unlesbares JSON aus einer API",
          description: "Drei einfache Routinen, um komprimierte API-Antworten lesbar zu machen: Formatieren, Validieren und Vergleichen.",
          readingTime: "4 Min. Lesezeit",
          tags: ["json", "api", "entwickler", "produktivität"],
          categoryLabel: "Entwickler",
          quickAnswer: "Zuerst formatieren, dann validieren bei Parsing-Fehlern und per Diff mit einer funktionierenden Kopie vergleichen. Formatieren → Validieren → Diffen ist die goldene Regel.",
          keyTakeaway: "Formatieren → Validieren → Diffen: Drei Schritte verwandeln unübersichtliches JSON in eine klare, prüfbare Datenstruktur.",
          toolCta: { label: "Haben Sie eine unlesbare oder fehlerhafte JSON-Antwort? Starten Sie mit dem Beautifier.", toolId: "json-beautifier" },
          seoTitle: "API JSON formatieren und debuggen | GainUtility",
          seoDescription: "Leitfaden für Entwickler: Minifiziertes JSON formatieren, Syntaxfehler aufspüren und Unterschiede im Browser analysieren."
        },
        "fr": {
          title: "Comment lire et corriger un JSON illisible issu d'une API",
          description: "Trois réflexes simples pour transformer une réponse JSON brute et compressée en structure claire : formater, valider et comparer.",
          readingTime: "4 min de lecture",
          tags: ["json", "api", "développeur", "productivité"],
          categoryLabel: "Développeur",
          quickAnswer: "Formatez la réponse en premier, validez si une erreur d'analyse survient, et comparez via un diff après vos modifications. Formater → Valider → Diff : la routine indispensable.",
          keyTakeaway: "Formater → Valider → Comparer : trois étapes simples pour comprendre et corriger rapidement n'importe quelle réponse JSON.",
          toolCta: { label: "Une réponse JSON minifiée ou cassée ? Commencez avec le Formateur.", toolId: "json-beautifier" },
          seoTitle: "Formater et déboguer le JSON d'une API | GainUtility",
          seoDescription: "Comment formater, valider la syntaxe et comparer les réponses JSON d'API dans votre navigateur sans envoyer vos données."
        },
        "it": {
          title: "Come leggere e correggere JSON illeggibili restituiti da un'API",
          description: "Tre semplici abitudini per trasformare qualsiasi risposta JSON confusa in una struttura chiara: formattare, validare e confrontare.",
          readingTime: "4 min di lettura",
          tags: ["json", "api", "sviluppatore", "produttività"],
          categoryLabel: "Sviluppatore",
          quickAnswer: "Formatta prima la risposta, convalida in caso di errori di parsing ed esegui un diff rispetto a una versione corretta. Formattare → Validare → Confrontare è la sequenza ottimale.",
          keyTakeaway: "Formattare → Validare → Confrontare: tre piccoli passaggi trasformano risposte JSON complesse in dati chiari su cui lavorare.",
          toolCta: { label: "Hai un JSON minificato o non funzionante? Inizia con il Beautifier.", toolId: "json-beautifier" },
          seoTitle: "Come formattare e correggere JSON da API | GainUtility",
          seoDescription: "Guida per sviluppatori su come formattare, verificare la sintassi e confrontare dati JSON direttamente nel browser."
        },
        "id": {
          title: "Cara membaca dan memperbaiki respons JSON yang sulit dibaca dari API",
          description: "Tiga kebiasaan praktis untuk mengubah respons JSON yang rapat menjadi struktur rapi: format, validasi, dan bandingkan.",
          readingTime: "4 mnt baca",
          tags: ["json", "api", "pengembang", "produktivitas"],
          categoryLabel: "Pengembang",
          quickAnswer: "Format respons terlebih dahulu, validasi jika terjadi galat penguraian, dan bandingkan perbedaannya dengan diff setelah perubahan. Format → validasi → bandingkan adalah urutan terbaik.",
          keyTakeaway: "Format → validasi → diff: tiga langkah sederhana mengubah respons JSON rumit menjadi struktur data yang mudah dianalisis.",
          toolCta: { label: "Mendapat respons JSON yang rapat atau rusak? Mulai dengan Beautifier.", toolId: "json-beautifier" },
          seoTitle: "Cara Memformat dan Debug JSON dari API | GainUtility",
          seoDescription: "Pelajari cara merapikan, memvalidasi sintaks, dan membandingkan data JSON API secara instan di browser Anda."
        }
      }
    },
    "how-to-make-a-qr-code": {
      meta: {
        "pt-br": {
          title: "Como criar um QR Code que realmente funciona e é escaneado",
          description: "Defina o destino correto, use URLs curtas e definitivas, escolha a correção de erro adequada e teste com seu próprio celular antes de imprimir.",
          readingTime: "4 min de leitura",
          tags: ["qr code", "ferramentas", "design", "impressão"],
          categoryLabel: "Desenvolvedor",
          quickAnswer: "Decida o conteúdo do código, use uma URL curta e final, escolha um nível maior de correção de erros e sempre faça um teste de leitura com o celular antes de imprimir.",
          keyTakeaway: "URLs curtas e correção de erros adequada superam designs mirabolantes — e um teste prático de leitura garante o resultado.",
          toolCta: { label: "Gere um QR Code que funciona na primeira tentativa.", toolId: "qr-code-generator" },
          seoTitle: "Como criar um QR Code legível e eficiente | GainUtility",
          seoDescription: "Guia para gerar QR Codes confiáveis: correção de erros, URLs encurtadas, densidade de módulos e testes antes da impressão."
        },
        "es-mx": {
          title: "Cómo crear un código QR que realmente se escanee sin problemas",
          description: "Define el destino correcto, usa URLs cortas y definitivas, selecciona la corrección de errores adecuada y pruébalo en el móvil antes de imprimir.",
          readingTime: "4 min de lectura",
          tags: ["qr code", "herramientas", "diseño", "impresión"],
          categoryLabel: "Desarrollador",
          quickAnswer: "Define qué debe contener el código, usa un enlace corto y definitivo, selecciona un nivel de corrección de error alto y escanéalo con tu móvil antes de imprimir.",
          keyTakeaway: "Enlaces cortos y niveles altos de corrección de error garantizan un escaneo fluido en cualquier condición física.",
          toolCta: { label: "Genera un código QR que se escanea a la primera.", toolId: "qr-code-generator" },
          seoTitle: "Cómo crear un código QR funcional y legible | GainUtility",
          seoDescription: "Aprende a generar códigos QR profesionales: corrección de errores, densidad visual y comprobaciones para impresiones físicas."
        },
        "es-co": {
          title: "Cómo crear un código QR que realmente se escanee sin problemas",
          description: "Define el destino correcto, usa URLs cortas y definitivas, selecciona la corrección de errores adecuada y pruébalo en el móvil antes de imprimir.",
          readingTime: "4 min de lectura",
          tags: ["qr code", "herramientas", "diseño", "impresión"],
          categoryLabel: "Desarrollador",
          quickAnswer: "Define qué debe contener el código, usa un enlace corto y definitivo, selecciona un nivel de corrección de error alto y escanéalo con tu móvil antes de imprimir.",
          keyTakeaway: "Enlaces cortos y niveles altos de corrección de error garantizan un escaneo fluido en cualquier condición física.",
          toolCta: { label: "Genera un código QR que se escanea a la primera.", toolId: "qr-code-generator" },
          seoTitle: "Cómo crear un código QR funcional y legible | GainUtility",
          seoDescription: "Aprende a generar códigos QR profesionales: corrección de errores, densidad visual y comprobaciones para impresiones físicas."
        },
        "de": {
          title: "So erstellen Sie einen QR-Code, der zuverlässig scannt",
          description: "Legen Sie das Ziel fest, nutzen Sie kurze finale URLs, wählen Sie die richtige Fehlerkorrektur und testen Sie vor dem Druck per Smartphone.",
          readingTime: "4 Min. Lesezeit",
          tags: ["qr code", "tools", "design", "druck"],
          categoryLabel: "Entwickler",
          quickAnswer: "Bestimmen Sie den Inhalt, halten Sie URLs kurz und endgültig, wählen Sie ein höheres Fehlerkorrekturniveau und scannen Sie den Code vor dem Druck selbst ab.",
          keyTakeaway: "Kurze finale URLs und robuste Fehlerkorrektur schlagen verspielte Designs — und ein manueller Testscan sichert den Erfolg ab.",
          toolCta: { label: "Erstellen Sie einen QR-Code, der beim ersten Mal zuverlässig scannt.", toolId: "qr-code-generator" },
          seoTitle: "Zuverlässige QR-Codes erstellen: Anleitung & Best Practices | GainUtility",
          seoDescription: "Tipps für fehlerfreie QR-Codes: Optimale URL-Länge, Fehlerkorrekturstufen für den Druck und Vermeidung dichter Muster."
        },
        "fr": {
          title: "Comment créer un QR Code qui se scanne facilement à chaque fois",
          description: "Définissez un contenu clair, privilégiez des URL courtes et finales, choisissez un bon niveau de correction d'erreur et testez avec votre smartphone.",
          readingTime: "4 min de lecture",
          tags: ["qr code", "outils", "design", "impression"],
          categoryLabel: "Développeur",
          quickAnswer: "Déterminez le contenu, utilisez une URL courte et définitive, choisissez une correction d'erreur élevée et scannez le résultat avec votre téléphone avant toute impression.",
          keyTakeaway: "Une URL courte et un bon niveau de correction d'erreur surpassent les designs complexes — un test de scan préalable évite toute mauvaise surprise.",
          toolCta: { label: "Générez un code QR qui fonctionne du premier coup.", toolId: "qr-code-generator" },
          seoTitle: "Créer un QR code fiable et lisible | GainUtility",
          seoDescription: "Guide complet pour concevoir des QR codes professionnels : gestion de la densité, correction d'erreur et tests d'impression."
        },
        "it": {
          title: "Come creare un codice QR che si scansiona al primo tentativo",
          description: "Stabilisci il contenuto, usa URL brevi e definitive, seleziona una correzione degli errori adeguata e verifica con il tuo smartphone prima di stampare.",
          readingTime: "4 min di lettura",
          tags: ["qr code", "strumenti", "design", "stampa"],
          categoryLabel: "Sviluppatore",
          quickAnswer: "Decidi il contenuto, usa un URL breve e definitivo, scegli un livello elevato di correzione d'errore ed esegui un test di scansione prima della stampa finale.",
          keyTakeaway: "URL brevi e correzione degli errori avanzata battono grafiche complesse — e un controllo pratico evita costosi errori di stampa.",
          toolCta: { label: "Genera un codice QR pronto alla scansione istantanea.", toolId: "qr-code-generator" },
          seoTitle: "Come creare codici QR leggibili ed efficaci | GainUtility",
          seoDescription: "Istruzioni pratiche per generare QR code ottimali: scelta del livello di recupero errore, densità dei moduli e test su mobile."
        },
        "id": {
          title: "Cara membuat kode QR yang mudah dipindai tanpa kendala",
          description: "Tentukan konten yang tepat, gunakan URL pendek yang permanen, pilih tingkat koreksi kesalahan yang sesuai, dan uji langsung dengan ponsel sebelum dicetak.",
          readingTime: "4 mnt baca",
          tags: ["qr code", "alat", "desain", "cetak"],
          categoryLabel: "Pengembang",
          quickAnswer: "Tentukan isi kode, gunakan URL pendek dan final, pilih koreksi kesalahan lebih tinggi, lalu unduh dan pindai sekali dengan ponsel Anda sebelum dicetak massal.",
          keyTakeaway: "URL pendek dan tingkat koreksi kesalahan yang tepat memastikan pemindaian lancar di segala kondisi pencetakan.",
          toolCta: { label: "Buat kode QR yang langsung terbaca pada pemindaian pertama.", toolId: "qr-code-generator" },
          seoTitle: "Cara Membuat Kode QR yang Akurat dan Mudah Dipindai | GainUtility",
          seoDescription: "Panduan membuat kode QR andal: optimasi panjang URL, level koreksi galat cetak, dan langkah pengujian mandiri."
        }
      }
    },
    "clean-up-css-gradients-and-borders-in-design-work": {
      meta: {
        "pt-br": {
          title: "Como ajustar gradientes CSS, sombras e contraste sem tentativa e erro",
          description: "Ajuste gradientes, sombras e arredondamentos em um preview visual em tempo real e copie o CSS pronto. Verifique o contraste WCAG antes de publicar.",
          readingTime: "4 min de leitura",
          tags: ["css", "gradientes", "design", "contraste", "acessibilidade"],
          categoryLabel: "Desenvolvedor",
          quickAnswer: "Ajuste paradas de cor, sombras e raios de borda em uma ferramenta com visualização ao vivo e copie o código final. Teste o contraste texto/fundo segundo a WCAG antes do deploy.",
          keyTakeaway: "Visualizar ao vivo substitui a adivinhação: gradientes, sombras e taxas de contraste deixam de consumir tempo quando você enxerga o resultado em tempo real.",
          toolCta: { label: "Ajustando um gradiente manualmente? Veja o resultado ao vivo.", toolId: "gradient-generator" },
          seoTitle: "Como ajustar gradientes, sombras e contraste em CSS | GainUtility",
          seoDescription: "Dicas de CSS para design de interface: ajuste gradientes com paradas de cor, controle sombras naturais e garanta contraste acessível WCAG."
        },
        "es-mx": {
          title: "Cómo ajustar degradados CSS, sombras y contraste sin adivinar",
          description: "Modifica degradados, sombras y radios de borde con vista previa en vivo y copia el CSS final. Valida el contraste WCAG antes de lanzar.",
          readingTime: "4 min de lectura",
          tags: ["css", "degradados", "diseño", "contraste", "accesibilidad"],
          categoryLabel: "Desarrollador",
          quickAnswer: "Ajusta degradados, sombras y esquinas redondeadas con previsualización en vivo y copia el código generado. Verifica el contraste según WCAG antes de publicar.",
          keyTakeaway: "Previsualizar en tiempo real ahorra horas de prueba y error en degradados, sombras y contrastes de interfaz.",
          toolCta: { label: "¿Ajustando un degradado a mano? Pruébalo con vista previa.", toolId: "gradient-generator" },
          seoTitle: "Ajustar degradados CSS, sombras y contraste de forma visual | GainUtility",
          seoDescription: "Aprende a afinar gradientes CSS, sombras limpias y contrastes accesibles sin perder tiempo editando código a ciegas."
        },
        "es-co": {
          title: "Cómo ajustar degradados CSS, sombras y contraste sin adivinar",
          description: "Modifica degradados, sombras y radios de borde con vista previa en vivo y copia el CSS final. Valida el contraste WCAG antes de lanzar.",
          readingTime: "4 min de lectura",
          tags: ["css", "degradados", "diseño", "contraste", "accesibilidad"],
          categoryLabel: "Desarrollador",
          quickAnswer: "Ajusta degradados, sombras y esquinas redondeadas con previsualización en vivo y copia el código generado. Verifica el contraste según WCAG antes de publicar.",
          keyTakeaway: "Previsualizar en tiempo real ahorra horas de prueba y error en degradados, sombras y contrastes de interfaz.",
          toolCta: { label: "¿Ajustando un degradado a mano? Pruébalo con vista previa.", toolId: "gradient-generator" },
          seoTitle: "Ajustar degradados CSS, sombras y contraste de forma visual | GainUtility",
          seoDescription: "Aprende a afinar gradientes CSS, sombras limpias y contrastes accesibles sin perder tiempo editando código a ciegas."
        },
        "de": {
          title: "CSS-Verläufe, Schatten und Kontraste gezielt abstimmen statt raten",
          description: "Stimmen Sie Farbverläufe, Schatten und Radien per Live-Vorschau ab und kopieren Sie sauberes CSS. Prüfen Sie den WCAG-Kontrast vor dem Release.",
          readingTime: "4 Min. Lesezeit",
          tags: ["css", "verläufe", "design", "kontrast", "barrierefreiheit"],
          categoryLabel: "Entwickler",
          quickAnswer: "Passen Sie Verläufe, Schatten und Eckenradien in einem visuellen Vorschautool an und kopieren Sie fertiges CSS. Prüfen Sie Farbkontraste nach WCAG-Standards.",
          keyTakeaway: "Vorschau schlägt Raten: Verläufe, Schatten und Farbkontraste gelingen sofort, wenn man das visuelle Ergebnis direkt vor Augen hat.",
          toolCta: { label: "Passen Sie Verläufe visuell an, statt Werte im Code zu tippen.", toolId: "gradient-generator" },
          seoTitle: "CSS-Verläufe, Schatten und Kontrast visuell abstimmen | GainUtility",
          seoDescription: "So optimieren Sie moderne CSS-Farbverläufe, realistische Schatten und WCAG-konforme Kontrastverhältnisse für Web-Interfaces."
        },
        "fr": {
          title: "Ajuster dégradés CSS, ombres et contrastes sans tâtonner",
          description: "Réglez vos dégradés, ombres et arrondis dans un aperçu en temps réel et copiez le CSS propre. Validez le contraste WCAG avant de publier.",
          readingTime: "4 min de lecture",
          tags: ["css", "dégradés", "design", "contraste", "accessibilité"],
          categoryLabel: "Développeur",
          quickAnswer: "Réglez vos dégradés, ombres et rayons de bordure dans un outil avec prévisualisation directe et copiez le CSS. Validez le contraste texte/fond selon les normes WCAG.",
          keyTakeaway: "Prévisualiser évite de deviner : les réglages visuels de dégradés et d'ombres cessent d'être laborieux dès que le résultat s'affiche en direct.",
          toolCta: { label: "Vous ajustez un dégradé à la main ? Prévisualisez-le en direct.", toolId: "gradient-generator" },
          seoTitle: "Maîtriser les dégradés CSS, ombres et contrastes | GainUtility",
          seoDescription: "Techniques pour concevoir des dégradés CSS fluides, des ombres soignées et des contrastes conformes aux critères d'accessibilité WCAG."
        },
        "it": {
          title: "Come regolare gradienti CSS, ombre e contrasto senza andare a tentativi",
          description: "Modifica sfumature, ombre e bordi arrotondati con anteprima visiva in tempo reale e copia il CSS finale. Verifica il contrasto WCAG prima del rilascio.",
          readingTime: "4 min di lettura",
          tags: ["css", "gradienti", "design", "contrasto", "accessibilità"],
          categoryLabel: "Sviluppatore",
          quickAnswer: "Regola stop colore, ombreggiature e raggi di curvatura in uno strumento con anteprima live e copia il CSS generato. Verifica il rapporto di contrasto WCAG prima del rilascio.",
          keyTakeaway: "L'anteprima dal vivo elimina le incertezze: gradienti, ombre e contrasti si rifiniscono in pochi secondi vedendo subito l'effetto reale.",
          toolCta: { label: "Stai regolando un gradiente a mano? Provalo in anteprima.", toolId: "gradient-generator" },
          seoTitle: "Ottimizzare gradienti CSS, ombre e contrasti | GainUtility",
          seoDescription: "Impara a comporre sfumature CSS naturali, ombre bilanciate e rapporti di contrasto accessibili secondo gli standard WCAG."
        },
        "id": {
          title: "Cara mengatur gradien CSS, bayangan, dan kontras tanpa menebak-nebak",
          description: "Sesuaikan gradien, bayangan, dan radius sudut dengan pratinjau langsung dan salin CSS siap pakai. Periksa kontras WCAG sebelum diterbitkan.",
          readingTime: "4 mnt baca",
          tags: ["css", "gradien", "desain", "kontras", "aksesibilitas"],
          categoryLabel: "Pengembang",
          quickAnswer: "Sesuaikan gradien, bayangan, dan radius sudut pada alat pratinjau interaktif lalu salin CSS akhirnya. Uji rasio kontras teks terhadap latar belakang sesuai standar WCAG.",
          keyTakeaway: "Pratinjau langsung menghentikan tebak-tebakan: gradien warna, bayangan, dan rasio kontras dapat disempurnakan dengan seketika.",
          toolCta: { label: "Mengatur gradien secara manual? Gunakan pratinjau langsung.", toolId: "gradient-generator" },
          seoTitle: "Panduan Menata Gradien CSS, Bayangan & Kontras | GainUtility",
          seoDescription: "Cara menyempurnakan gradien CSS, bayangan elemen antarmuka, dan kontras warna yang memenuhi standar aksesibilitas WCAG."
        }
      }
    },
    "write-seo-title-and-meta-description-in-twenty-minutes": {
      meta: {
        "pt-br": {
          title: "Como escrever o título e a meta descrição de uma página em 20 minutos",
          description: "Responda o que a página faz em uma frase objetiva. Transforme isso no título, respeite o limite de caracteres e visualize o snippet no buscador.",
          readingTime: "4 min de leitura",
          tags: ["seo", "metadados", "títulos", "conteúdo", "mecanismos de busca"],
          categoryLabel: "SEO",
          quickAnswer: "Responda o que a página faz em uma frase clara. Use essa resposta como título, mantenha o comprimento dentro do limite dos buscadores, coloque as palavras principais no início e pré-visualize o snippet antes de publicar.",
          keyTakeaway: "Propósito claro → título legível → descrição honesta → visualização do snippet: uma rotina rápida que gera cliques qualificados.",
          toolCta: { label: "Veja como seu título e descrição aparecerão nos resultados de busca.", toolId: "seo-meta-generator" },
          seoTitle: "Como escrever títulos e meta descrições para SEO | GainUtility",
          seoDescription: "Passo a passo rápido para criar títulos de página e meta descriptions eficazes: tamanho ideal, palavras-chave naturais e pré-visualização no Google."
        },
        "es-mx": {
          title: "Cómo escribir el título y la meta descripción de una página en 20 minutos",
          description: "Explica qué hace la página en una sola frase honesta. Conviértela en título, controla la longitud de caracteres y visualiza la vista previa del buscador.",
          readingTime: "4 min de lectura",
          tags: ["seo", "metadatos", "títulos", "contenido", "motores de búsqueda"],
          categoryLabel: "SEO",
          quickAnswer: "Define en una frase qué permite hacer la página. Haz de eso el título respetando el límite visible, pon las palabras clave al principio y previsualiza el resultado.",
          keyTakeaway: "Propósito → título legible → descripción honesta → previsualización: la rutina práctica para snippets que realmente atraen clics.",
          toolCta: { label: "Mira cómo aparecerán tu título y descripción en los resultados de búsqueda.", toolId: "seo-meta-generator" },
          seoTitle: "Cómo redactar títulos y meta descripciones para SEO | GainUtility",
          seoDescription: "Guía práctica para escribir etiquetas title y meta description atractivas: límites de píxeles, intención de búsqueda y previsualización en SERPs."
        },
        "es-co": {
          title: "Cómo escribir el título y la meta descripción de una página en 20 minutos",
          description: "Explica qué hace la página en una sola frase honesta. Conviértela en título, controla la longitud de caracteres y visualiza la vista previa del buscador.",
          readingTime: "4 min de lectura",
          tags: ["seo", "metadatos", "títulos", "contenido", "motores de búsqueda"],
          categoryLabel: "SEO",
          quickAnswer: "Define en una frase qué permite hacer la página. Haz de eso el título respetando el límite visible, pon las palabras clave al principio y previsualiza el resultado.",
          keyTakeaway: "Propósito → título legible → descripción honesta → previsualización: la rutina práctica para snippets que realmente atraen clics.",
          toolCta: { label: "Mira cómo aparecerán tu título y descripción en los resultados de búsqueda.", toolId: "seo-meta-generator" },
          seoTitle: "Cómo redactar títulos y meta descripciones para SEO | GainUtility",
          seoDescription: "Guía práctica para escribir etiquetas title y meta description atractivas: límites de píxeles, intención de búsqueda y previsualización en SERPs."
        },
        "de": {
          title: "So schreiben Sie Seitentitel und Meta-Beschreibung in zwanzig Minuten",
          description: "Beantworten Sie den Nutzen der Seite in einem klaren Satz. Machen Sie daraus den Titel, achten Sie auf die Anzeigelänge und prüfen Sie das Such-Snippet.",
          readingTime: "4 Min. Lesezeit",
          tags: ["seo", "metadaten", "titel", "content", "suchmaschinen"],
          categoryLabel: "SEO",
          quickAnswer: "Fassen Sie die Funktion der Seite in einem Satz zusammen. Nutzen Sie diesen als Titel, halten Sie ihn innerhalb der Zeichenbegrenzung und prüfen Sie das Snippet in der Vorschau.",
          keyTakeaway: "Nutzen erfassen → lesbarer Titel → ehrliche Beschreibung → Vorschau prüfen: Der 20-Minuten-Workflow für erfolgreiche Suchergebnisse.",
          toolCta: { label: "Sehen Sie, wie Titel und Beschreibung in den Suchergebnissen dargestellt werden.", toolId: "seo-meta-generator" },
          seoTitle: "SEO Seitentitel & Meta Description verfassen: Anleitung | GainUtility",
          seoDescription: "Praxis-Leitfaden für klickstarke Titles und Meta Descriptions: Zeichenlimits, Keyword-Positionierung und SERP-Snippet-Vorschau."
        },
        "fr": {
          title: "Rédiger le titre et la méta description d'une page en vingt minutes",
          description: "Résumez l'objectif de la page en une phrase simple. Transformez-la en titre, respectez la longueur d'affichage et prévisualisez le résultat Google.",
          readingTime: "4 min de lecture",
          tags: ["seo", "métadonnées", "titres", "contenu", "moteurs de recherche"],
          categoryLabel: "SEO",
          quickAnswer: "Expliquez l'utilité de la page en une seule phrase. Faites-en le titre principal, placez les mots-clés importants au début et vérifiez l'aperçu du résultat de recherche.",
          keyTakeaway: "Utilité claire → titre lisible → description honnête → aperçu SERP : une méthode simple et efficace pour maximiser le taux de clics.",
          toolCta: { label: "Découvrez comment votre titre et votre description s'afficheront dans les recherches.", toolId: "seo-meta-generator" },
          seoTitle: "Rédiger de bons titres et méta descriptions SEO | GainUtility",
          seoDescription: "Conseils pratiques pour rédiger des balises title et meta description percutantes : limites de pixels, pertinence et simulateur SERP."
        },
        "it": {
          title: "Come scrivere titolo e meta description di una pagina in venti minuti",
          description: "Rispondi a cosa serve la pagina in una frase diretta. Trasformala nel titolo, rispetta i limiti di visualizzazione e controlla l'anteprima SERP.",
          readingTime: "4 min di lettura",
          tags: ["seo", "metadati", "titoli", "contenuti", "motori di ricerca"],
          categoryLabel: "SEO",
          quickAnswer: "Definisci cosa consente di fare la pagina in una sola frase. Usala come titolo, mantieni la lunghezza entro i limiti dei motori di ricerca e verifica l'anteprima.",
          keyTakeaway: "Obiettivo chiaro → titolo leggibile → descrizione fedele → anteprima SERP: la routine veloce per snippet di ricerca che convincono al clic.",
          toolCta: { label: "Guarda come appariranno il tuo titolo e la tua descrizione nei risultati di ricerca.", toolId: "seo-meta-generator" },
          seoTitle: "Come scrivere Title e Meta Description efficaci per la SEO | GainUtility",
          seoDescription: "Guida per ottimizzare titoli di pagina e meta descrizioni: lunghezza consigliata, leggibilità naturale e anteprima dei risultati Google."
        },
        "id": {
          title: "Cara menulis judul halaman dan deskripsi meta dalam dua puluh menit",
          description: "Jelaskan fungsi halaman dalam satu kalimat lugas. Jadikan itu judul, perhatikan batas panjang tampilan, dan lihat pratinjau di hasil pencarian.",
          readingTime: "4 mnt baca",
          tags: ["seo", "metadata", "judul", "konten", "mesin pencari"],
          categoryLabel: "SEO",
          quickAnswer: "Jawab manfaat halaman dalam satu kalimat lugas. Jadikan itu judul, pertahankan panjangnya agar tidak terpotong, dan periksa pratinjau hasil pencarian sebelum selesai.",
          keyTakeaway: "Tujuan jelas → judul terbaca → deskripsi jujur → pratinjau pencarian: rutinitas singkat untuk cuplikan hasil pencarian yang efektif.",
          toolCta: { label: "Lihat tampilan judul dan deskripsi Anda di hasil mesin pencari.", toolId: "seo-meta-generator" },
          seoTitle: "Cara Menulis Judul dan Meta Description untuk SEO | GainUtility",
          seoDescription: "Panduan praktis menyusun tag judul dan meta deskripsi yang memikat: batas karakter, kata kunci alami, dan pratinjau cuplikan SERP."
        }
      }
    }
  };

  let out = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized variants for Blog Articles 17-20 (Developer & SEO category).
 * Supported locales: pt-br, id, es-mx, es-co, de, fr, it.
 */

import type { LocalizedBlogArticle } from "../../blog/blogData";
import type { LocaleCode } from "../slugs";

export const DEV_SEO_ARTICLES_LOCALIZED: Record<string, Partial<Record<LocaleCode, LocalizedBlogArticle>>> = {\n`;

  for (const art of raw17_20) {
    out += `  "${art.slug}": {\n`;
    for (const loc of locales) {
      const meta = trans17_20[art.slug].meta[loc];
      const localizedContent = translateBlocks(art.content, loc, art.slug, meta);

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
      out += `      content: ${JSON.stringify(localizedContent, null, 8).replace(/^ {8}/gm, '        ')}\n`;
      out += `    },\n`;
    }
    out += `  },\n`;
  }

  out += `};\n`;
  fs.writeFileSync('src/i18n/blogArticles/devSeo.ts', out);
  console.log('Generated src/i18n/blogArticles/devSeo.ts');
}

function translateBlocks(blocks, loc, slug, meta) {
  return blocks.map(b => {
    const copy = { ...b };
    if (copy.heading) {
      copy.heading = getHeadingTranslation(copy.heading, loc);
    }
    if (copy.paragraphs) {
      copy.paragraphs = copy.paragraphs.map(p => getParagraphTranslation(p, loc, slug));
    }
    if (copy.list) {
      copy.list = copy.list.map(item => getListItemTranslation(item, loc));
    }
    if (copy.steps) {
      copy.steps = copy.steps.map(step => getListItemTranslation(step, loc));
    }
    if (copy.tool) {
      copy.tool = {
        label: meta.toolCta.label,
        toolId: copy.tool.toolId
      };
    }
    if (copy.pageLink) {
      copy.pageLink = {
        label: getPageLinkLabel(copy.pageLink.label, loc),
        path: copy.pageLink.path,
        text: copy.pageLink.text ? getPageLinkLabel(copy.pageLink.text, loc) : undefined
      };
    }
    return copy;
  });
}

// Complete heading dictionary
const HEADINGS = {
  "Why it looks like that": {
    "pt-br": "Por que o retorno tem essa aparência",
    "es-mx": "Por qué tiene esa apariencia",
    "es-co": "Por qué tiene esa apariencia",
    "de": "Warum das JSON so aussieht",
    "fr": "Pourquoi la réponse ressemble à cela",
    "it": "Perché ha questo aspetto",
    "id": "Mengapa tampilannya seperti itu"
  },
  "Format first": {
    "pt-br": "Formate primeiro",
    "es-mx": "Formatea primero",
    "es-co": "Formatea primero",
    "de": "Zuerst formatieren",
    "fr": "Formatez en premier",
    "it": "Formatta prima",
    "id": "Format terlebih dahulu"
  },
  "Validate before you trust": {
    "pt-br": "Valide antes de confiar",
    "es-mx": "Valida antes de confiar",
    "es-co": "Valida antes de confiar",
    "de": "Validieren, bevor Sie den Daten vertrauen",
    "fr": "Validez avant de faire confiance",
    "it": "Valida prima di fidarti",
    "id": "Validasi sebelum mempercayai data"
  },
  "Diff after you change things": {
    "pt-br": "Compare após fazer alterações",
    "es-mx": "Compara después de hacer cambios",
    "es-co": "Compara después de hacer cambios",
    "de": "Vergleichen Sie nach Änderungen",
    "fr": "Comparez après avoir modifié",
    "it": "Fai un diff dopo le modifiche",
    "id": "Bandingkan perbedaan setelah perubahan"
  },
  "Decide what the code contains": {
    "pt-br": "Decida o conteúdo do código",
    "es-mx": "Decide qué contendrá el código",
    "es-co": "Decide qué contendrá el código",
    "de": "Legen Sie den Inhalt fest",
    "fr": "Définissez le contenu du code",
    "it": "Decidi cosa conterrà il codice",
    "id": "Tentukan isi kode QR"
  },
  "Error correction is a real setting": {
    "pt-br": "A correção de erros é uma configuração crucial",
    "es-mx": "La corrección de errores es un ajuste real",
    "es-co": "La corrección de errores es un ajuste real",
    "de": "Fehlerkorrektur ist eine entscheidende Einstellung",
    "fr": "La correction d'erreur est un paramètre essentiel",
    "it": "La correzione degli errori è un'impostazione fondamentale",
    "id": "Koreksi kesalahan adalah pengaturan penting"
  },
  "The step most people skip: test it": {
    "pt-br": "O passo que a maioria pula: teste na prática",
    "es-mx": "El paso que la mayoría salta: pruébalo",
    "es-co": "El paso que la mayoría salta: pruébalo",
    "de": "Der Schritt, den viele überspringen: Testen",
    "fr": "L'étape que presque tout le monde ignore : tester",
    "it": "Il passaggio che molti saltano: provalo",
    "id": "Langkah yang sering dilewati: uji langsung"
  },
  "Step by step": {
    "pt-br": "Passo a passo",
    "es-mx": "Paso a paso",
    "es-co": "Paso a paso",
    "de": "Schritt für Schritt",
    "fr": "Étape par étape",
    "it": "Passo dopo passo",
    "id": "Langkah demi langkah"
  },
  "Gradients are forgiving until they aren't": {
    "pt-br": "Gradientes parecem fáceis até ficarem complexos",
    "es-mx": "Los degradados perdonan hasta que dejan de hacerlo",
    "es-co": "Los degradados perdonan hasta que dejan de hacerlo",
    "de": "Farbverläufe sind gutmütig – bis sie es nicht mehr sind",
    "fr": "Les dégradés sont tolérants jusqu'au moment où ils ne le sont plus",
    "it": "I gradienti sembrano semplici finché non complicano tutto",
    "id": "Gradien terlihat mudah sampai menjadi rumit"
  },
  "Shadows rarely work first try": {
    "pt-br": "Sombras raramente acertam de primeira",
    "es-mx": "Las sombras rara vez quedan bien al primer intento",
    "es-co": "Las sombras rara vez quedan bien al primer intento",
    "de": "Schatten gelingen selten beim ersten Versuch",
    "fr": "Les ombres fonctionnent rarement du premier coup",
    "it": "Le ombre raramente funzionano al primo tentativo",
    "id": "Bayangan jarang sempurna pada percobaan pertama"
  },
  "Contrast is a number, not a feeling": {
    "pt-br": "Contraste é um número, não uma impressão subjetiva",
    "es-mx": "El contraste es un número, no una sensación",
    "es-co": "El contraste es un número, no una sensación",
    "de": "Kontrast ist ein messbarer Wert, kein Gefühl",
    "fr": "Le contraste est un chiffre, pas une intuition",
    "it": "Il contrasto è un numero preciso, non un'opinione",
    "id": "Kontras adalah angka objektif, bukan perasaan"
  },
  "Copy-paste beats retyping": {
    "pt-br": "Copiar e colar supera digitar do zero",
    "es-mx": "Copiar y pegar supera reescribir de memoria",
    "es-co": "Copiar y pegar supera reescribir de memoria",
    "de": "Kopieren und Einfügen schlägt Abtippen",
    "fr": "Copier-coller est bien plus sûr que retaper de mémoire",
    "it": "Copiare e incollare batte la riscrittura a memoria",
    "id": "Salin-tempel lebih cepat daripada mengetik ulang"
  },
  "Start with what the page is for": {
    "pt-br": "Comece definindo o propósito real da página",
    "es-mx": "Comienza por el propósito concreto de la página",
    "es-co": "Comienza por el propósito concreto de la página",
    "de": "Beginnen Sie mit dem eigentlichen Zweck der Seite",
    "fr": "Commencez par la véritable raison d'être de la page",
    "it": "Inizia chiedendoti a cosa serve davvero la pagina",
    "id": "Mulai dari tujuan sebenarnya dari halaman"
  },
  "Write the title for reading, not ranking": {
    "pt-br": "Escreva o título para pessoas lerem, não apenas para ranquear",
    "es-mx": "Escribe el título para lectura humana, no solo para clasificar",
    "es-co": "Escribe el título para lectura humana, no solo para clasificar",
    "de": "Schreiben Sie den Titel für Leser, nicht für Algorithmen",
    "fr": "Rédigez un titre pour les lecteurs, pas pour les robots",
    "it": "Scrivi il titolo per chi legge, non per i motori",
    "id": "Tulis judul agar enak dibaca, bukan sekadar mengejar peringkat"
  },
  "Describe, don't hype": {
    "pt-br": "Descreva com clareza, sem exageros publicitários",
    "es-mx": "Describe con claridad, sin exageraciones",
    "es-co": "Describe con claridad, sin exageraciones",
    "de": "Beschreiben statt übertreiben",
    "fr": "Décrivez concrètement sans sensationnalisme",
    "it": "Descrivi i fatti, evita slogan vuoti",
    "id": "Jelaskan dengan jujur, hindari promosi berlebihan"
  },
  "Check the preview before you finish": {
    "pt-br": "Confira a pré-visualização antes de finalizar",
    "es-mx": "Verifica la previsualización antes de terminar",
    "es-co": "Verifica la previsualización antes de terminar",
    "de": "Prüfen Sie die Vorschau vor der Fertigstellung",
    "fr": "Vérifiez l'aperçu avant de conclure",
    "it": "Controlla l'anteprima prima di pubblicare",
    "id": "Periksa pratinjau sebelum menyelesaikan"
  },
  "Repeat the routine": {
    "pt-br": "Transforme em rotina consistente",
    "es-mx": "Convierte el proceso en una rutina",
    "es-co": "Convierte el proceso en una rutina",
    "de": "Machen Sie daraus eine Routine",
    "fr": "Adoptez cette routine à chaque publication",
    "it": "Rendi il processo una routine costante",
    "id": "Ulangi rutinitas ini secara konsisten"
  }
};

function getHeadingTranslation(h, loc) {
  return HEADINGS[h]?.[loc] || h;
}

function getParagraphTranslation(p, loc, slug) {
  // Return natural native translation for each sentence
  // Let's implement full localized strings
  const dict = {
    "Open a raw API response and you'll often see one long line of JSON with no spaces. It's technically correct and completely unreadable — and the fix is a habit, not a skill.": {
      "pt-br": "Abra uma resposta bruta de API e você verá com frequência uma linha interminável de JSON sem espaços. Tecnicamente está correta, mas é quase impossível de ler — e a solução é um hábito, não uma habilidade complexa.",
      "es-mx": "Abre una respuesta directa de API y a menudo verás una sola línea interminable de JSON sin espacios. Es técnicamente correcta pero completamente ilegible; solucionarlo es un hábito, no una destreza compleja.",
      "es-co": "Abre una respuesta directa de API y a menudo verás una sola línea interminable de JSON sin espacios. Es técnicamente correcta pero completamente ilegible; solucionarlo es un hábito, no una destreza compleja.",
      "de": "Wenn Sie eine rohe API-Antwort öffnen, sehen Sie oft eine endlose JSON-Zeile ohne Leerzeichen. Das ist technisch einwandfrei, aber unlesbar – die Lösung ist eine einfache Gewohnheit.",
      "fr": "Ouvrez une réponse brute d'API et vous obtiendrez souvent une longue ligne de JSON sans espaces. Elle est techniquement valide mais totalement illisible — la solution relève d'une habitude, pas d'un savoir complexe.",
      "it": "Apri una risposta API non formattata e spesso vedrai un'unica lunga riga di JSON priva di spazi. È tecnicamente corretta ma illeggibile: la soluzione è un'abitudine metodica.",
      "id": "Buka respons mentah API dan Anda akan sering melihat satu baris panjang JSON tanpa spasi. Ini valid secara teknis tetapi tidak dapat dibaca — solusinya adalah kebiasaan kerja yang konsisten."
    },
    "APIs usually return minified JSON to save bandwidth. Whitespace and line breaks are stripped because they add bytes. Great for the server, terrible for the person trying to read it.": {
      "pt-br": "APIs costumam retornar JSON minificado para economizar largura de banda. Espaços e quebras de linha são removidos porque ocupam bytes extras. Excelente para os servidores, péssimo para quem precisa ler.",
      "es-mx": "Las APIs devuelven JSON minificado para ahorrar ancho de banda. Espacios y saltos de línea se eliminan para reducir bytes. Excelente para el servidor, frustrante para quien debe inspeccionarlo.",
      "es-co": "Las APIs devuelven JSON minificado para ahorrar ancho de banda. Espacios y saltos de línea se eliminan para reducir bytes. Excelente para el servidor, frustrante para quien debe inspeccionarlo.",
      "de": "APIs liefern meist minifiziertes JSON aus, um Bandbreite zu sparen. Leerzeichen und Umbrüche werden entfernt. Gut für den Server, anstrengend für den Entwickler beim Lesen.",
      "fr": "Les API renvoient généralement du JSON minifié pour économiser la bande passante. Les espaces et retours à la ligne sont supprimés pour gagner des octets. Parfait pour le serveur, pénible pour le développeur.",
      "it": "Le API restituiscono solitamente JSON minificato per risparmiare banda. Spazi e a capo vengono rimossi perché occupano byte. Ottimo per il server, ingestibile per chi deve leggerlo.",
      "id": "API biasanya mengembalikan JSON yang diminifikasi untuk menghemat bandwidth. Spasi dan jeda baris dipotong untuk memangkas byte. Bagus untuk server, tetapi menyulitkan pengembang."
    },
    "Before you try to parse a response in your head, format it. A formatter rebuilds the indentation and line breaks, turning one dense line into a structure you can scan. One line becomes a small tree:": {
      "pt-br": "Antes de tentar decifrar a resposta mentalmente, formate-a. O formatador reconstrói a indentação e as quebras de linha, transformando uma massa compacta em uma árvore visual clara:",
      "es-mx": "Antes de intentar descifrar la respuesta mentalmente, dale formato. Un formateador reconstruye sangrías y saltos de línea, convirtiendo un bloque denso en un árbol fácil de recorrer:",
      "es-co": "Antes de intentar descifrar la respuesta mentalmente, dale formato. Un formateador reconstruye sangrías y saltos de línea, convirtiendo un bloque denso en un árbol fácil de recorrer:",
      "de": "Bevor Sie eine Antwort im Kopf entwirren, formatieren Sie sie. Ein Formatter stellt Einrückungen und Zeilenumbrüche wieder her und verwandelt dichte Textzeilen in einen lesbaren Baum:",
      "fr": "Avant d'essayer de décrypter la réponse de tête, formatez-la. Un outil dédié recrée l'indentation et les sauts de ligne, transformant une ligne brute en arborescence facile à parcourir :",
      "it": "Prima di cercare di interpretare la risposta a mente, formattala. Un formattatore ripristina indentazione e ritorni a capo, trasformando un blocco informe in un albero facilmente navigabile:",
      "id": "Sebelum mencoba menguraikan respons secara manual, format terlebih dahulu. Alat format menyusun indentasi dan jeda baris, mengubah satu baris padat menjadi pohon hierarki yang rapi:"
    },
    "If something isn't parsing, check whether the JSON is even valid before hunting for logic bugs. A trailing comma or an unescaped quote breaks an entire object — faster to confirm that than to debug a phantom.": {
      "pt-br": "Se algo falhar no processamento, confira se o JSON é válido antes de procurar erros na lógica do seu código. Uma vírgula sobrando ou aspas sem escape quebram o objeto inteiro — confirme isso primeiro.",
      "es-mx": "Si algo falla al procesar, comprueba si el JSON es válido antes de buscar errores lógicos. Una coma final sobrante o una comilla sin escapar rompen el objeto completo: es más rápido validar que perseguir fantasmas.",
      "es-co": "Si algo falla al procesar, comprueba si el JSON es válido antes de buscar errores lógicos. Una coma final sobrante o una comilla sin escapar rompen el objeto completo: es más rápido validar que perseguir fantasmas.",
      "de": "Wenn das Parsen scheitert, prüfen Sie zuerst die Validität des JSON, bevor Sie Logikfehler suchen. Ein überflüssiges Komma oder ein nicht maskiertes Anführungszeichen bricht das gesamte Objekt ab.",
      "fr": "Si l'analyse échoue, assurez-vous que le JSON est valide avant de chercher des bugs de logique. Une virgule finale en trop ou un guillemet mal échappé invalident tout l'objet — valider d'abord fait gagner un temps précieux.",
      "it": "Se qualcosa non si analizza, controlla che il JSON sia valido prima di cercare bug logici. Una virgola di troppo o virgolette non schermate bloccano l'intero parsing: meglio verificare subito.",
      "id": "Jika penguraian gagal, periksa apakah sintaks JSON valid sebelum mencari bug logika kode Anda. Koma berlebih di akhir atau tanda kutip tanpa escape dapat merusak seluruh objek data."
    },
    "When you're checking whether a fix worked, a side-by-side diff beats eyeballing two long strings. See exactly which keys moved — and which you didn't mean to touch.": {
      "pt-br": "Ao verificar se uma correção funcionou, uma comparação lado a lado (diff) supera inspecionar textos longos a olho nu. Você vê exatamente quais chaves mudaram — e quais não deveria ter alterado.",
      "es-mx": "Al comprobar si una corrección funcionó, una comparación visual lado a lado supera examinar cadenas largas a simple vista. Descubre con precisión qué claves cambiaron y cuáles no debías tocar.",
      "es-co": "Al comprobar si una corrección funcionó, una comparación visual lado a lado supera examinar cadenas largas a simple vista. Descubre con precisión qué claves cambiaron y cuáles no debías tocar.",
      "de": "Wenn Sie prüfen, ob ein Fix gewirkt hat, schlägt ein visueller Diff den manuellen Vergleich meilenweit. Erkennen Sie sofort, welche Keys geändert wurden – und welche unberührt blieben.",
      "fr": "Pour vérifier si un correctif a fonctionné, un diff côte à côte est infiniment supérieur à une comparaison visuelle à l'œil nu. Repérez exactement les clés modifiées et celles qui sont restées intactes.",
      "it": "Per verificare l'esito di una correzione, un confronto diff fianco a fianco supera qualsiasi controllo a vista. Scopri con precisione quali chiavi sono cambiate e quali sono rimaste intatte.",
      "id": "Saat memastikan apakah perbaikan berhasil, perbandingan diff berdampingan jauh lebih efektif daripada memeriksa teks panjang secara manual. Lihat persis kunci mana yang berubah."
    },
    // QR code
    "A QR code fails in two ways: nobody scans it because it's buried or too small, or somebody scans it and it points somewhere wrong. The second one is the expensive failure — it's on you, not the scanner.": {
      "pt-br": "Um QR code falha de duas formas: ninguém escaneia porque está escondido ou muito pequeno, ou alguém escaneia e cai no lugar errado. A segunda falha é a mais custosa — e a responsabilidade é de quem gerou o código.",
      "es-mx": "Un código QR falla de dos formas: nadie lo escanea porque está escondido o es diminuto, o alguien lo escanea y apunta al destino equivocado. Este segundo fallo es el más costoso de subsanar.",
      "es-co": "Un código QR falla de dos formas: nadie lo escanea porque está escondido o es diminuto, o alguien lo escanea y apunta al destino equivocado. Este segundo fallo es el más costoso de subsanar.",
      "de": "Ein QR-Code scheitert meist an zwei Dingen: Niemand scannt ihn, weil er zu klein ist – oder jemand scannt ihn und landet auf einem falschen Ziel. Letzteres ist der teure Fehler.",
      "fr": "Un QR code échoue généralement pour deux raisons : personne ne le scanne car il est trop petit, ou quelqu'un le scanne et il mène au mauvais endroit. La seconde erreur est la plus préjudiciable.",
      "it": "Un codice QR fallisce principalmente per due motivi: nessuno lo scansiona perché è minuscolo, o qualcuno lo inquadra e punta all'indirizzo sbagliato. Questo secondo errore è il più costoso.",
      "id": "Kode QR gagal dalam dua cara: tidak ada yang memindai karena terlalu kecil, atau seseorang memindai dan diarahkan ke tautan yang salah. Kesalahan kedua adalah yang paling merugikan."
    },
    "Most codes hold a URL, which is the right default. Text or contact info have their uses, but a short URL gives you full control later — point it at a page that resolves, and the code can outlive the campaign.": {
      "pt-br": "A maioria dos códigos armazena uma URL, o que é a escolha ideal. Textos fixos têm seus usos, mas uma URL curta permite redirecionamentos futuros — o código dura muito mais tempo que uma campanha pontual.",
      "es-mx": "La mayoría de códigos contienen una URL, que es la mejor opción predeterminada. Una URL corta te da control a futuro: apunta a una página activa y el código superará la duración de la campaña.",
      "es-co": "La mayoría de códigos contienen una URL, que es la mejor opción predeterminada. Una URL corta te da control a futuro: apunta a una página activa y el código superará la duración de la campaña.",
      "de": "Die meisten Codes enthalten eine URL – das ist der beste Standard. Eine kurze URL gibt Ihnen Kontrolle: Sie können die Zielseite aktualisieren, ohne den gedruckten Code wegwerfen zu müssen.",
      "fr": "La majorité des codes contiennent une URL, ce qui est le choix par excellence. Une URL courte vous donne le contrôle dans le temps : le code imprimé peut ainsi survivre à une campagne temporaire.",
      "it": "La maggior parte dei codici contiene un URL, la scelta predefinita più sensata. Un URL breve garantisce flessibilità futura: permette al codice di durare ben oltre la singola campagna.",
      "id": "Sebagian besar kode memuat URL, yang merupakan pilihan default terbaik. URL pendek memberi Anda kendali penuh nanti — arahkan ke halaman aktif sehingga kode bertahan melampaui masa kampanye."
    },
    "Make the URL the final destination and keep it short. Long URLs inflate the code's density, and dense codes are harder to scan from a poster or a bumper.": {
      "pt-br": "Use a URL de destino final e mantenha-a curta. URLs longas aumentam a densidade de módulos do código, tornando o escaneamento muito mais difícil em cartazes ou banners.",
      "es-mx": "Haz que la URL sea el destino final y mantenla corta. Enlaces largos inflan la densidad de los módulos, dificultando la lectura desde carteles o vehículos.",
      "es-co": "Haz que la URL sea el destino final y mantenla corta. Enlaces largos inflan la densidad de los módulos, dificultando la lectura desde carteles o vehículos.",
      "de": "Machen Sie die URL zum finalen Ziel und halten Sie sie kurz. Lange Links erhöhen die Moduldichte, wodurch der Code auf Plakaten oder Bannern deutlich schwerer zu erfassen ist.",
      "fr": "Utilisez une URL finale et concise. Les URL trop longues augmentent la densité des modules, rendant le scan difficile sur une affiche ou un panneau extérieur.",
      "it": "Usa l'URL finale e mantienilo breve. Indirizzi lunghi aumentano la densità dei moduli, rendendo la scansione difficoltosa su cartelloni o superfici distanti.",
      "id": "Jadikan URL tujuan akhir dan buat sesingkat mungkin. URL panjang memperbesar kepadatan modul kode, dan kode yang padat lebih sulit dipindai dari poster atau kendaraan."
    },
    "QR codes carry a redundancy level — low, medium, high. Higher redundancy means the code still scans when part of it is printed poorly, creased, or covered by a logo. For anything printed, choose a higher level: a few extra modules of pattern are a fair trade for a code that always works.": {
      "pt-br": "QR codes possuem níveis de redundância — baixo, médio, alto. Maior redundância significa que o código continua legível mesmo se impresso com falhas, amassado ou parcialmente coberto por um logo. Para impressos, escolha um nível alto.",
      "es-mx": "Los códigos QR incluyen redundancia: baja, media o alta. Una redundancia mayor permite escanear aunque esté arrugado, mal impreso o con un logo superpuesto. Para material físico, elige siempre un nivel superior.",
      "es-co": "Los códigos QR incluyen redundancia: baja, media o alta. Una redundancia mayor permite escanear aunque esté arrugado, mal impreso o con un logo superpuesto. Para material físico, elige siempre un nivel superior.",
      "de": "QR-Codes besitzen eine Fehlerkorrekturstufe (Low, Medium, High). Ein höheres Niveau stellt sicher, dass der Code auch bei schlechtem Druck, Falten oder Logos lesbar bleibt. Für Drucksachen empfiehlt sich stets ein höheres Level.",
      "fr": "Les QR codes intègrent un niveau de correction d'erreur (faible, moyen, élevé). Un niveau plus haut garantit la lecture même en cas d'impression imparfaite, de pli ou de logo superposé. Choisissez un niveau élevé pour l'impression.",
      "it": "I QR code integrano un livello di correzione errore (basso, medio, alto). Livelli più alti garantiscono la scansione anche con stampe rovinate o loghi sovrapposti. Per materiali cartacei, scegli un livello elevato.",
      "id": "Kode QR memiliki tingkat redundansi koreksi kesalahan — rendah, sedang, tinggi. Redundansi yang lebih tinggi berarti kode tetap dapat dipindai saat terlipat, rusak, atau tertutup logo."
    },
    "Generate, download, then scan the file with your own phone before you print or ship it. That one scan catches the dead URL, the wrong URL, and the code that's too small to read from the distance people will actually be at.": {
      "pt-br": "Gere, baixe e faça um teste de leitura com o seu próprio celular antes de enviar para impressão. Esse teste simples revela links quebrados, destinos errados e códigos pequenos demais para a distância real de visualização.",
      "es-mx": "Genera, descarga y escanea con tu propio teléfono antes de imprimir en masa. Ese único escaneo detecta enlaces rotos, destinos equivocados y códigos demasiado pequeños para su distancia de lectura real.",
      "es-co": "Genera, descarga y escanea con tu propio teléfono antes de imprimir en masa. Ese único escaneo detecta enlaces rotos, destinos equivocados y códigos demasiado pequeños para su distancia de lectura real.",
      "de": "Generieren, herunterladen und vor dem Drucken mit dem eigenen Smartphone scannen. Dieser eine Testscan deckt tote Links, falsche Ziele und zu klein geratene Codes sofort auf.",
      "fr": "Générez, téléchargez puis scannez le fichier avec votre propre smartphone avant toute impression. Ce simple test évite les liens morts, les erreurs d'adresse et les formats trop petits pour la distance de lecture.",
      "it": "Genera, scarica e scansiona il codice con il tuo smartphone prima di mandarlo in stampa. Questa prova immediata rivela link interrotti, indirizzi errati e dimensioni non leggibili alla distanza prevista.",
      "id": "Buat, unduh, lalu pindai langsung dengan ponsel Anda sendiri sebelum mencetak atau mendistribusikannya. Satu pengujian ini menangkap tautan mati, URL salah, atau ukuran yang terlalu kecil."
    },
    "The whole job, in order:": {
      "pt-br": "O processo completo, em ordem:",
      "es-mx": "Todo el proceso, en orden:",
      "es-co": "Todo el proceso, en orden:",
      "de": "Der gesamte Ablauf in der Übersicht:",
      "fr": "Le déroulement complet, étape par étape :",
      "it": "L'intera procedura, in ordine:",
      "id": "Seluruh langkah kerja secara berurutan:"
    },
    // Gradients and design
    "The last ten percent of a UI is often the fiddliest. Getting a gradient to feel right, a shadow to sit naturally, or a border radius to look intentional takes almost as long as the whole design before it. The pattern that ends the guessing is simple: preview, don't type.": {
      "pt-br": "Os últimos dez por cento de uma interface são frequentemente os mais trabalhosos. Fazer um gradiente parecer harmonioso, uma sombra assentar naturalmente ou um raio de borda parecer intencional leva quase tanto tempo quanto todo o resto do projeto. A regra que elimina a incerteza é simples: pré-visualize antes de digitar.",
      "es-mx": "El último diez por ciento de una interfaz suele ser el más minucioso. Lograr que un degradado luzca natural, que una sombra encaje o que un radio de esquina sea armonioso toma mucho tiempo. La solución es sencilla: previsualiza, no adivines en código.",
      "es-co": "El último diez por ciento de una interfaz suele ser el más minucioso. Lograr que un degradado luzca natural, que una sombra encaje o que un radio de esquina sea armonioso toma mucho tiempo. La solución es sencilla: previsualiza, no adivines en código.",
      "de": "Die letzten zehn Prozent einer Benutzeroberfläche kosten oft die meiste Zeit. Farbverläufe harmonisch abzustimmen, Schatten natürlich wirken zu lassen oder Radien präzise zu setzen gelingt schneller mit Live-Vorschau statt blindem Coden.",
      "fr": "Les derniers dix pour cent d'une interface sont souvent les plus minutieux. Obtenir un dégradé harmonieux, une ombre naturelle ou des arrondis parfaits prend du temps. La règle pour en finir avec le tâtonnement est simple : visualisez en direct avant de coder.",
      "it": "L'ultimo dieci percento di un'interfaccia è spesso il più delicato. Dare a un gradiente la giusta morbidezza, calibrare un'ombra o rifinire gli angoli richiede tempo. Il metodo che elimina ogni dubbio è immediato: visualizza l'anteprima, non tirare a indovinare.",
      "id": "Sepuluh persen terakhir dari desain antarmuka sering kali adalah yang paling menyita waktu. Menyesuaikan gradien, bayangan, atau radius sudut membutuhkan ketelitian. Solusinya sederhana: gunakan pratinjau langsung daripada menebak angka."
    },
    "A simple two-colour gradient is easy by hand. Add more stops, change the angle, or match a brand colour and the CSS gets harder to reason about. A visual preview shows the result while you adjust the stops.": {
      "pt-br": "Um gradiente simples de duas cores é fácil de escrever manualmente. Mas adicione mais paradas, altere o ângulo ou combine com cores de marca, e o CSS fica difícil de calcular. Uma pré-visualização visual mostra o efeito em tempo real.",
      "es-mx": "Un degradado de dos colores es fácil de hacer a mano. Pero añade más puntos, cambia el ángulo o sincroniza con la paleta de marca y el CSS se vuelve complejo. La vista previa visual te muestra el cambio exacto al instante.",
      "es-co": "Un degradado de dos colores es fácil de hacer a mano. Pero añade más puntos, cambia el ángulo o sincroniza con la paleta de marca y el CSS se vuelve complejo. La vista previa visual te muestra el cambio exacto al instante.",
      "de": "Ein einfacher Farbverlauf aus zwei Farben lässt sich leicht tippen. Doch sobald Sie Farbstopps hinzufügen oder Winkel ändern, wird CSS unübersichtlich. Eine visuelle Vorschau spart Zeit und Nerven.",
      "fr": "Un dégradé basique à deux couleurs s'écrit facilement à la main. Ajoutez des étapes intermédiaires, modifiez l'angle ou respectez une charte graphique, et le code devient complexe. L'aperçu dynamique affiche le résultat immédiatement.",
      "it": "Un gradiente semplice a due colori è facile da scrivere a mano. Aggiungi più interruzioni di colore o cambia l'inclinazione e il CSS diventa difficile da prevedere. L'anteprima visiva mostra subito ogni minima variazione.",
      "id": "Gradien dua warna sederhana mudah dibuat secara manual. Namun saat menambahkan titik henti warna atau sudut rotasi, CSS menjadi rumit. Pratinjau visual menunjukkan hasil langsung saat Anda menggeser titik kontrol."
    },
    "A natural shadow needs the right offset, blur, spread, and a colour that isn't pure black. Nudging numbers in code to find that combination is slow — a live preview halves it.": {
      "pt-br": "Uma sombra realista precisa do offset certo, desfoque calibrado, dispersão e uma cor que não seja preto puro. Ajustar números no código às cegas é demorado — a pré-visualização ao vivo resolve na metade do tempo.",
      "es-mx": "Una sombra creíble requiere el desplazamiento correcto, desenfoque calibrado y un color que no sea negro 100% opaco. Probar valores numéricos a ciegas en el editor es lento; una herramienta interactiva lo acelera al instante.",
      "es-co": "Una sombra creíble requiere el desplazamiento correcto, desenfoque calibrado y un color que no sea negro 100% opaco. Probar valores numéricos a ciegas en el editor es lento; una herramienta interactiva lo acelera al instante.",
      "de": "Ein natürlicher Schatten braucht den passenden Versatz, Blur, Spread und ein neutrales Schwarz mit geringer Deckkraft. Zahlen blind im CSS-Editor anzupassen ist mühsam – ein Live-Tool halbiert die Zeit.",
      "fr": "Une ombre réaliste exige le bon décalage, un flou mesuré et une teinte qui n'est pas un noir pur et dur. Modifier les chiffres à tâtons dans le code prend du temps ; un aperçu en temps réel divise cet effort par deux.",
      "it": "Un'ombra credibile necessita del corretto offset, della giusta sfocatura e di una tonalità che non sia nero puro. Cambiare numeri a tentativi nel codice è lento: un generatore visivo risolve il compito all'istante.",
      "id": "Bayangan alami membutuhkan offset yang tepat, blur terukur, dan warna yang bukan hitam pekat. Mencoba angka satu per satu di editor kode memakan waktu lama — pratinjau langsung memangkas separuh waktu Anda."
    },
    "A colour that looks fine can still fail WCAG contrast, which matters if anyone with a visual impairment reads that text. It's cheaper to check the pair early than to redo a button style late.": {
      "pt-br": "Uma combinação de cores que parece bonita na tela ainda pode ser reprovada no contraste da WCAG, afetando pessoas com baixa visão. É muito mais rápido validar o par de cores no início do que refazer estilos depois de lançado.",
      "es-mx": "Un color que parece adecuado puede incumplir los estándares de contraste de WCAG, afectando la accesibilidad visual. Es mucho más rápido comprobar la combinación al inicio que rehacer botones más adelante.",
      "es-co": "Un color que parece adecuado puede incumplir los estándares de contraste de WCAG, afectando la accesibilidad visual. Es mucho más rápido comprobar la combinación al inicio que rehacer botones más adelante.",
      "de": "Farben, die gut aussehen, können dennoch die WCAG-Kontrastkriterien verfehlen. Es ist deutlich effizienter, das Farbpaar frühzeitig zu testen, als später ganze Button-Komponenten umzubauen.",
      "fr": "Une couleur agréable à l'œil peut échouer aux tests de contraste WCAG, gênant les utilisateurs malvoyants. Il est bien plus économique de tester le contraste au départ que de corriger un bouton plus tard.",
      "it": "Un accostamento di colori apparentemente gradevole può non rispettare gli standard WCAG di contrasto. Conviene verificare la combinazione fin dall'inizio piuttosto che dover riprogettare pulsanti in seguito.",
      "id": "Warna yang terlihat bagus di layar bisa saja gagal memenuhi standar kontras WCAG bagi pengguna dengan gangguan penglihatan. Lebih murah memeriksa pasangan warna sejak awal daripada mendesain ulang tombol nanti."
    },
    "The point of these tools is that you adjust visually and copy finished CSS instead of re-typing it from memory. That's the entire advantage — the fiddly part becomes a preview and a paste.": {
      "pt-br": "O objetivo desses utilitários é permitir ajustes visuais e cópia direta do CSS pronto, sem precisar redigitar tudo de cabeça. Essa é a grande vantagem — a parte trabalhosa vira apenas visualizar e colar.",
      "es-mx": "El propósito de estas herramientas es ajustar visualmente y copiar el CSS listo, sin reescribir de memoria. La tarea tediosa se reduce a previsualizar y pegar.",
      "es-co": "El propósito de estas herramientas es ajustar visualmente y copiar el CSS listo, sin reescribir de memoria. La tarea tediosa se reduce a previsualizar y pegar.",
      "de": "Der Sinn dieser Tools liegt darin, visuell abzustimmen und fertiges CSS zu kopieren, anstatt Syntax aus dem Kopf abzutippen. Der lästige Feinschliff wird so zum einfachen Kopieren und Einfügen.",
      "fr": "L'intérêt de ces outils est d'ajuster visuellement puis de copier le code CSS final sans avoir à le retaper de mémoire. La partie la plus fastidieuse devient un simple aperçu suivi d'un copier-coller.",
      "it": "L'obiettivo di questi strumenti è consentirti di rifinire visivamente e copiare il CSS finale senza doverlo riscrivere a memoria. Tutto il lavoro certosino si trasforma in un'anteprima e un semplice incolla.",
      "id": "Tujuan dari alat-alat ini adalah menyesuaikan secara visual dan langsung menyalin kode CSS jadi. Bagian yang rumit berubah menjadi pratinjau interaktif dan salin-tempel yang praktis."
    },
    // SEO Title & Description
    "A page's title and meta description are what a search engine shows — and what a person actually reads before deciding to click. They don't require an SEO course. They require an honest answer to one question.": {
      "pt-br": "O título e a meta descrição de uma página são o que os motores de busca exibem — e o que as pessoas realmente leem antes de clicar. Não exigem um curso avançado de SEO, apenas uma resposta sincera a uma pergunta básica.",
      "es-mx": "El título y la meta descripción de una página son lo que muestran los buscadores y lo que lee el usuario antes de hacer clic. No requieren un curso complejo de SEO, sino responder con sinceridad a una sola pregunta.",
      "es-co": "El título y la meta descripción de una página son lo que muestran los buscadores y lo que lee el usuario antes de hacer clic. No requieren un curso complejo de SEO, sino responder con sinceridad a una sola pregunta.",
      "de": "Seitentitel und Meta-Beschreibung sind das, was Suchmaschinen anzeigen – und was ein Mensch liest, bevor er klickt. Sie brauchen dafür keinen SEO-Lehrgang, sondern eine ehrliche Antwort auf eine Frage.",
      "fr": "Le titre et la méta description d'une page sont les éléments affichés par les moteurs de recherche — et ce qu'un internaute lit avant de cliquer. Nul besoin d'une formation complexe : il suffit de répondre honnêtement à une question.",
      "it": "Il titolo e la meta description di una pagina sono ciò che appare nei motori di ricerca e ciò che l'utente legge prima di decidere se cliccare. Non serve un corso avanzato di SEO, ma una risposta sincera a una domanda diretta.",
      "id": "Judul halaman dan deskripsi meta adalah apa yang ditampilkan mesin pencari — dan apa yang dibaca seseorang sebelum memutuskan untuk mengeklik. Anda tidak memerlukan kursus SEO yang rumit, hanya jawaban jujur atas satu pertanyaan."
    },
    "Before writing anything, answer in a sentence: what does this page let someone do? Your title and description should reflect that answer, not a stacked list of keywords.": {
      "pt-br": "Antes de escrever qualquer coisa, responda em uma frase: o que esta página permite que alguém faça? Seu título e descrição devem refletir essa utilidade direta, não um amontoado de palavras-chave.",
      "es-mx": "Antes de redactar, responde en una frase: ¿qué le permite hacer esta página al usuario? Tu título y descripción deben reflejar esa respuesta en lugar de acumular palabras clave vacías.",
      "es-co": "Antes de redactar, responde en una frase: ¿qué le permite hacer esta página al usuario? Tu título y descripción deben reflejar esa respuesta en lugar de acumular palabras clave vacías.",
      "de": "Bevor Sie tippen, formulieren Sie in einem Satz: Was kann der Nutzer auf dieser Seite tun? Titel und Beschreibung sollten genau diese Antwort abbilden, statt Keyword-Listen aneinanderzureihen.",
      "fr": "Avant d'écrire quoi que ce soit, formulez en une phrase : que permet concrètement cette page à l'utilisateur ? Votre titre et votre description doivent exprimer cette réponse, et non aligner des mots-clés.",
      "it": "Prima di scrivere, rispondi con una frase: cosa permette di fare questa pagina a chi la visita? Titolo e descrizione devono riflettere questa utilità reale, non un mero elenco di parole chiave.",
      "id": "Sebelum menulis apa pun, jawablah dalam satu kalimat: apa yang dapat dilakukan seseorang di halaman ini? Judul dan deskripsi Anda harus mencerminkan jawaban itu, bukan deretan kata kunci yang dipaksakan."
    },
    "A title should read like a clear headline. Keep it close to the length search engines display, put the most important words early, and accept that cramming more in makes it cut off or confusing.": {
      "pt-br": "O título deve soar como uma manchete clara. Mantenha o comprimento compatível com o que os buscadores exibem, coloque os termos principais no início e evite entupir o texto com palavras extras que serão cortadas.",
      "es-mx": "El título debe sonar como un encabezado claro. Ajusta su longitud a lo que muestran los buscadores, coloca las palabras clave al principio y evita saturarlo para que no se trunque.",
      "es-co": "El título debe sonar como un encabezado claro. Ajusta su longitud a lo que muestran los buscadores, coloca las palabras clave al principio y evita saturarlo para que no se trunque.",
      "de": "Ein Titel sollte wie eine verständliche Schlagzeile klingen. Halten Sie sich an die typische Anzeigelänge, platzieren Sie die wichtigsten Begriffe vorn und vermeiden Sie überladene Formulierungen.",
      "fr": "Un titre doit se lire comme un gros titre percutant. Respectez la longueur affichée dans les résultats, placez les termes essentiels au début et évitez de le surcharger au risque qu'il soit tronqué.",
      "it": "Il titolo deve suonare come un titolo di giornale chiaro e diretto. Mantienilo entro la lunghezza visualizzata nei motori, posiziona le parole determinanti all'inizio ed evita inutili sovraccarichi.",
      "id": "Judul harus terdengar seperti tajuk berita yang lugas. Jaga panjangnya agar sesuai dengan batas tampilan mesin pencari, letakkan kata penting di awal, dan hindari menumpuk kata yang akan terpotong."
    },
    "The description tells what the page offers, in a sentence someone would want to read. It's the thing that shows in search results, so make it useful rather than promotional.": {
      "pt-br": "A descrição explica o que a página oferece, em uma frase convidativa e agradável de ler. É o resumo que aparece nas buscas, por isso priorize a utilidade em vez de apelos publicitários forçados.",
      "es-mx": "La descripción explica qué ofrece la página en una frase agradable de leer. Aparece directamente en los resultados, por lo que debe ser informativa y de valor, no un anuncio publicitario.",
      "es-co": "La descripción explica qué ofrece la página en una frase agradable de leer. Aparece directamente en los resultados, por lo que debe ser informativa y de valor, no un anuncio publicitario.",
      "de": "Die Beschreibung erklärt das Angebot der Seite in einem Satz, den man gerne liest. Sie erscheint im Snippet – gestalten Sie sie nützlich und sachlich statt rein werblich.",
      "fr": "La description résume ce que la page propose en une phrase facile à lire. C'est l'extrait visible dans les résultats de recherche : soyez utile et informatif plutôt que racoleur.",
      "it": "La descrizione spiega cosa offre la pagina in una frase piacevole da leggere. Appare direttamente nei risultati di ricerca, quindi deve essere utile e concreta, non una réclame generica.",
      "id": "Deskripsi menjelaskan apa yang ditawarkan halaman dalam kalimat yang menarik untuk dibaca. Ini adalah teks cuplikan di hasil pencarian, jadi buatlah informatif dan bermanfaat daripada bersifat iklan promosi."
    },
    "The surest way to know if a title or description gets cut off is to render it. A search-results preview catches the truncation, the duplicate, and the bland phrasing in one look.": {
      "pt-br": "A forma mais segura de saber se um título ou descrição será truncado é visualizá-lo em uma prévia real. A visualização de resultados de busca revela cortes indesejados, repetições e frases sem impacto.",
      "es-mx": "La manera más certera de saber si un título o descripción se cortará es previsualizarlo. Una vista previa de resultados de búsqueda detecta textos truncados, duplicidades y frases débiles en un vistazo.",
      "es-co": "La manera más certera de saber si un título o descripción se cortará es previsualizarlo. Una vista previa de resultados de búsqueda detecta textos truncados, duplicidades y frases débiles en un vistazo.",
      "de": "Der sicherste Weg, um abgeschnittene Texte zu vermeiden, ist ein realistischer Snippet-Simulator. Die Vorschau zeigt Textkürzungen, Doppelungen und unklare Formulierungen auf einen Blick.",
      "fr": "Le moyen le plus fiable de savoir si un titre ou une description sera coupé est de le simuler. Un aperçu SERP permet d'identifier immédiatement les troncatures, doublons et phrases maladroites.",
      "it": "Il modo migliore per accertarsi che un titolo o una descrizione non vengano tagliati è verificarne l'anteprima. Il simulatore di snippet mostra subito troncamenti, ripetizioni e frasi spente.",
      "id": "Cara paling pasti untuk mengetahui apakah judul atau deskripsi Anda terpotong adalah dengan melihat simulasi visualnya. Pratinjau hasil pencarian menunjukkan teks yang terpotong, pengulangan kata, dan susunan kalimat yang kurang menarik."
    },
    "Twenty minutes per page, done as a routine when you publish, is more effective than an occasional all-day cleanup. Consistency beats intensity when the goal is pages that stay honest and useful.": {
      "pt-br": "Vinte minutos por página, feitos como parte da rotina de publicação, são muito mais eficazes do que mutirões esporádicos de limpeza. Consistência supera intensidade quando a meta é manter páginas úteis e atrativas.",
      "es-mx": "Veinte minutos por página, incorporados a tu rutina de publicación, son mucho más eficaces que limpiezas masivas ocasionales. La constancia supera a la intensidad para mantener contenidos claros y útiles.",
      "es-co": "Veinte minutos por página, incorporados a tu rutina de publicación, son mucho más eficaces que limpiezas masivas ocasionales. La constancia supera a la intensidad para mantener contenidos claros y útiles.",
      "de": "Zwanzig Minuten pro Seite bei jeder Veröffentlichung bringen mehr als gelegentliche Aufräumtage. Regelmäßigkeit schlägt Hauruck-Aktionen, damit Ihre Seiten dauerhaft nützlich und verständlich bleiben.",
      "fr": "Vingt minutes par page, appliquées comme routine à chaque publication, sont bien plus efficaces qu'un grand nettoyage occasionnel. La régularité prime sur l'effort ponctuel pour garantir des pages utiles et bien référencées.",
      "it": "Venti minuti per pagina, svolti con costanza a ogni pubblicazione, sono molto più efficaci di faticose revisioni periodiche. La regolarità batte l'improvvisazione quando l'obiettivo sono pagine utili e performanti.",
      "id": "Dua puluh menit per halaman, dilakukan sebagai kebiasaan rutin setiap kali Anda menerbitkan konten, jauh lebih efektif daripada pembersihan seharian yang jarang dilakukan. Konsistensi mengalahkan intensitas dadakan."
    }
  };

  return dict[p]?.[loc] || p;
}

function getListItemTranslation(item, loc) {
  const map = {
    "Decide on the destination URL before generating the code": {
      "pt-br": "Defina a URL de destino final antes de gerar o código",
      "es-mx": "Define la URL de destino final antes de generar el código",
      "es-co": "Define la URL de destino final antes de generar el código",
      "de": "Legen Sie die finale Ziel-URL fest, bevor Sie den Code generieren",
      "fr": "Définissez l'URL finale de destination avant de générer le code",
      "it": "Stabilisci l'URL di destinazione finale prima di generare il codice",
      "id": "Tentukan URL tujuan akhir sebelum membuat kode"
    },
    "Choose High or Quartile error correction for printed materials": {
      "pt-br": "Escolha correção de erro Alta (H) ou Quartil (Q) para materiais impressos",
      "es-mx": "Elige corrección de error Alta (H) o Cuartil (Q) para materiales impresos",
      "es-co": "Elige corrección de error Alta (H) o Cuartil (Q) para materiales impresos",
      "de": "Wählen Sie für Druckmaterialien das Fehlerkorrekturniveau High (H) oder Quartile (Q)",
      "fr": "Sélectionnez le niveau de correction Haute (H) ou Quartile (Q) pour les supports imprimés",
      "it": "Seleziona la correzione dell'errore Alta (H) o Quartile (Q) per supporti stampati",
      "id": "Pilih koreksi kesalahan Tinggi (H) atau Quartil (Q) untuk materi cetak"
    },
    "Generate and download the QR code image at high resolution": {
      "pt-br": "Gere e baixe a imagem do QR Code em alta resolução",
      "es-mx": "Genera y descarga la imagen del código QR en alta resolución",
      "es-co": "Genera y descarga la imagen del código QR en alta resolución",
      "de": "Generieren und laden Sie die QR-Code-Grafik in hoher Auflösung herunter",
      "fr": "Générez et téléchargez le QR code en haute définition",
      "it": "Genera e scarica l'immagine del codice QR ad alta risoluzione",
      "id": "Buat dan unduh gambar kode QR dalam resolusi tinggi"
    },
    "Scan it once with your phone from the expected physical distance": {
      "pt-br": "Faça um teste de escaneamento com seu celular na distância real de uso",
      "es-mx": "Escanéalo una vez con tu teléfono desde la distancia prevista de uso",
      "es-co": "Escanéalo una vez con tu teléfono desde la distancia prevista de uso",
      "de": "Scannen Sie den Code einmal zur Probe aus der vorgesehenen Distanz mit dem Smartphone",
      "fr": "Scannez-le une fois avec votre téléphone à la distance physique normale d'utilisation",
      "it": "Scansionalo con il tuo telefono alla distanza d'uso prevista",
      "id": "Pindai sekali dengan ponsel Anda dari jarak fisik pemindaian yang diperkirakan"
    }
  };
  return map[item]?.[loc] || item;
}

function getPageLinkLabel(label, loc) {
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
