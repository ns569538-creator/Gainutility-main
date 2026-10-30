/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlay for contrast-checker (6 locales, 6 FAQs —
 * base entry only, no EXTRA_FAQS boost). Source: src/data.ts "contrast-checker".
 */

import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";

export const overlay: Partial<Record<LocaleCode, ToolBodyOverlay>> = {
  "pt-br": {
    desc: "Meça cores de texto e fundo nas proporções WCAG AA e AAA, com prévias de simulação de daltonismo.",
    whatText:
      "Um verificador visual de acessibilidade que avalia combinações de cores, calcula proporções de contraste em tempo real sob padrões sRGB, exibe tamanhos de texto simulados e oferece visões de simulação dos tipos de daltonismo.",
    whyText:
      "A inclusão digital é essencial. Esta ferramenta avalia seus pares de estilo completamente offline, garantindo velocidade total, zero rastreamento de análise e conformidade com os padrões digitais.",
    features: [
      "Ferramentas interativas de HEX, RGB e seletor de espectro de cores",
      "Calculadoras de proporção em tempo real seguindo o padrão de Luminância Relativa do W3C",
      "Simulações de daltonismo (Protanopia, Deuteranopia, Tritanopia e escala de cinza)",
      "Geradores algorítmicos de cores alternativas que encontram a alternativa acessível mais próxima",
      "Combinações de contraste pré-carregadas para iterações de teste rápidas",
    ],
    steps: [
      "Digite ou selecione a cor do texto/primeiro plano no campo indicado.",
      "Digite ou selecione a cor de fundo da tela.",
      "Consulte a matriz de conformidade WCAG para ver a reprovação ou aprovação imediata.",
      "Ative os filtros de Simulação de Cores para ver as representações das deficiências visuais.",
      "Clique em Aplicar Correção para calcular e aplicar o tom de contraste aprovado mais próximo.",
    ],
    examples: [
      {
        title: "Combinação acessível",
        desc: "Verde-floresta escuro sobre fundo creme.",
        code: "Text: #283618 | Background: #FEFAE0\nRatio: 11.23 : 1\nWCAG AA: PASS\nWCAG AAA: PASS",
      },
      {
        title: "Combinação reprovada",
        desc: "Texto laranja claro sobre fundo branco.",
        code: "Text: #DDA15E | Background: #FFFFFF\nRatio: 1.84 : 1\nWCAG AA: FAIL\nWCAG AAA: FAIL",
      },
    ],
    mistakes: [
      "Projetar priorizando a estética e ignorando deficiências visuais (mantenha sempre uma proporção de pelo menos 4,5:1 no corpo de texto normal).",
      "Ignorar elementos de interface como bordas, seletores e estados desativados (que exigem contraste de 3,0:1).",
    ],
    privacyExplanation:
      "Todo o processamento, a conversão e a renderização acontecem na memória local do seu navegador. Esta ferramenta não envia seus arquivos para os servidores da GainUtility; qualquer processamento externo é informado na própria ferramenta.",
    faqs: [
      {
        question: "Quais são os limiares de proporção de contraste WCAG AA e AAA?",
        answer:
          "Para texto normal, o AA exige uma proporção mínima de 4,5:1 e o AAA exige 7:1. Para texto grande (18pt+ ou 14pt+ em negrito), o AA exige 3:1 e o AAA exige 4,5:1.",
      },
      {
        question: "Como funciona a correção automática de contraste?",
        answer:
          "Nosso motor analisa a luminância relativa das duas cores e aplica um sombreamento ou realce incremental e matemático à cor do texto até que ela ultrapasse o limiar seguro de 4,5:1.",
      },
      {
        question: "Por que devo me preocupar com a proporção de contraste em textos grandes?",
        answer:
          "Texto grande é mais fácil de ler, então o limiar do WCAG é relaxado para 3:1 no AA e 4,5:1 no AAA, mas manter um contraste mais alto é sempre recomendado para uma leitura absolutamente clara.",
      },
      {
        question: "Elementos de interface ativos, como campos de entrada e bordas, estão sujeitos aos requisitos de contraste?",
        answer:
          "Sim. Componentes interativos, ícones, bordas e anéis de foco exigem pelo menos 3,0:1 de contraste para que usuários desativados ou com baixa visão naveguem com segurança.",
      },
      {
        question: "Posso simular daltonismo neste verificador?",
        answer:
          "Sim, a ferramenta tem filtros em tempo real que simulam Protanopia, Deuteranopia, Tritanopia e escala de cinza completa, mostrando exatamente como usuários com deficiência de cor percebem suas combinações.",
      },
      {
        question: "Como a luminância relativa é calculada?",
        answer:
          "A luminância é calculada com uma fórmula ponderada baseada nos espaços de cor sRGB, representando o quão brilhante cada cor parece ao olho humano.",
      },
    ],
  },
  id: {
    desc: "Ukur warna teks dan latar terhadap rasio WCAG AA dan AAA, dengan pratinjau buta warna.",
    whatText:
      "Pemeriksa aksesibilitas visual yang mengevaluasi kombinasi warna, menghitung rasio kontras waktu nyata di bawah standar sRGB, menampilkan ukuran teks simulasi, dan menyediakan tampilan simulasi berbagai jenis buta warna.",
    whyText:
      "Inklusi digital itu penting. Utilitas ini mengevaluasi pasangan gaya Anda sepenuhnya offline, menjamin kecepatan penuh, nol pelacakan analitik, dan kepatuhan terhadap standar digital.",
    features: [
      "Alat interaktif HEX, RGB, dan pemilih spektrum warna",
      "Kalkulator rasio waktu nyata mengikuti standar Relative Luminance W3C",
      "Simulasi buta warna (Protanopia, Deuteranopia, Tritanopia, dan Grayscale)",
      "Generator warna alternatif algoritmik yang menemukan padanan aksesibel terdekat",
      "Kombinasi kontras pra-unggah untuk iterasi pengujian cepat",
    ],
    steps: [
      "Ketik atau pilih warna teks/latar depan di kolom yang tersedia.",
      "Ketik atau pilih warna latar kanvas Anda.",
      "Periksa matriks kepatuhan WCAG untuk status lulus/gagal seketika.",
      "Alihkan filter Simulasi Warna untuk melihat representasi gangguan penglihatan warna.",
      "Klik Terapkan Perbaikan untuk menghitung dan menerapkan nuansa kontras yang lulus terdekat.",
    ],
    examples: [
      {
        title: "Kombinasi aksesibel",
        desc: "Hutan gelap di atas latar krem.",
        code: "Text: #283618 | Background: #FEFAE0\nRatio: 11.23 : 1\nWCAG AA: PASS\nWCAG AAA: PASS",
      },
      {
        title: "Kombinasi gagal",
        desc: "Teks oranye terang di atas latar putih.",
        code: "Text: #DDA15E | Background: #FFFFFF\nRatio: 1.84 : 1\nWCAG AA: FAIL\nWCAG AAA: FAIL",
      },
    ],
    mistakes: [
      "Merancang demi estetika sambil mengabaikan gangguan penglihatan (selalu pertahankan rasio minimal 4,5:1 untuk teks isi normal).",
      "Mengabaikan elemen UI seperti batas, pemilih sakelar, dan status nonaktif (memerlukan kontras 3,0:1).",
    ],
    privacyExplanation:
      "Semua parsing, konversi, dan rendering berjalan di memori lokal browser Anda. Alat ini tidak mengirimkan file Anda ke server GainUtility; pemrosesan eksternal apa pun diungkapkan di dalam alat itu sendiri.",
    faqs: [
      {
        question: "Berapa ambang rasio kontras WCAG AA dan AAA?",
        answer:
          "Untuk teks biasa, AA mensyaratkan rasio minimum 4,5:1 dan AAA mensyaratkan 7:1. Untuk teks besar (18pt+ atau 14pt+ tebal), AA mensyaratkan 3:1 dan AAA mensyaratkan 4,5:1.",
      },
      {
        question: "Bagaimana cara kerja saran perbaikan kontras otomatis?",
        answer:
          "Mesin kami menganalisis luminansi relatif kedua warna dan melakukan penskalaan atau pencerahan matematis bertahap pada warna teks Anda hingga melewati ambang aman 4,5:1.",
      },
      {
        question: "Mengapa saya perlu peduli pada rasio kontras untuk teks besar?",
        answer:
          "Teks besar lebih mudah dibaca, jadi ambang WCAG dilonggarkan menjadi 3:1 untuk AA dan 4,5:1 untuk AAA, tetapi menjaga kontras lebih tinggi tetap disarankan demi keterbacaan yang sempurna.",
      },
      {
        question: "Apakah elemen UI aktif seperti input dan batas tunduk pada persyaratan kontras?",
        answer:
          "Ya. Komponen interaktif, ikon, batas, dan cincin fokus memerlukan rasio kontras minimal 3,0:1 agar pengguna nonaktif dan pengguna dengan gangguan penglihatan dapat bernavigasi dengan aman.",
      },
      {
        question: "Bisakah saya mensimulasikan buta warna di pemeriksa ini?",
        answer:
          "Ya, alat ini menyediakan filter waktu nyata yang mensimulasikan Protanopia, Deuteranopia, Tritanopia, dan Grayscale penuh, menunjukkan persis bagaimana pengguna dengan gangguan warna mempersepsikan kombinasi Anda.",
      },
      {
        question: "Bagaimana luminansi relatif dihitung?",
        answer:
          "Luminansi dihitung dengan formula berbobot berdasarkan ruang warna sRGB, mewakili seberapa terang setiap warna tampak bagi mata manusia.",
      },
    ],
  },
  "es-mx": {
    desc: "Mide colores de texto y fondo contra las proporciones WCAG AA y AAA, con vistas previas de daltonismo.",
    whatText:
      "Un verificador visual de accesibilidad que evalúa combinaciones de colores, calcula proporciones de contraste en tiempo real bajo estándares sRGB, muestra tamaños de texto simulados y ofrece vistas de simulación de los tipos de daltonismo.",
    whyText:
      "La inclusión digital es esencial. Esta utilidad evalúa tus pares de estilos completamente sin conexión, garantizando velocidad total, cero rastreo de analíticas y cumplimiento con los estándares digitales.",
    features: [
      "Herramientas interactivas de HEX, RGB y selector de espectro de colores",
      "Calculadoras de proporción en tiempo real que siguen el estándar de Luminancia Relativa del W3C",
      "Simulaciones de daltonismo (Protanopia, Deuteranopia, Tritanopia y escala de grises)",
      "Generadores algorítmicos de colores alternativos que encuentran la alternativa accesible más cercana",
      "Proporciones de contraste precargadas para iteraciones de prueba rápidas",
    ],
    steps: [
      "Escribe o selecciona el color de tu texto/primer plano en el campo indicado.",
      "Escribe o selecciona el color de fondo de tu lienzo.",
      "Revisa la matriz de cumplimiento de WCAG para ver el estado de aprobado/reprobado al instante.",
      "Activa los filtros de Simulación de color para ver las representaciones de las deficiencias visuales.",
      "Haz clic en Aplicar corrección para calcular y aplicar el tono de contraste aprobado más cercano.",
    ],
    examples: [
      {
        title: "Combinación accesible",
        desc: "Verde bosque oscuro sobre fondo crema.",
        code: "Text: #283618 | Background: #FEFAE0\nRatio: 11.23 : 1\nWCAG AA: PASS\nWCAG AAA: PASS",
      },
      {
        title: "Combinación reprobada",
        desc: "Texto naranja claro sobre fondo blanco.",
        code: "Text: #DDA15E | Background: #FFFFFF\nRatio: 1.84 : 1\nWCAG AA: FAIL\nWCAG AAA: FAIL",
      },
    ],
    mistakes: [
      "Diseñar por estética ignorando las discapacidades visuales (mantén siempre una proporción de al menos 4.5:1 en el texto normal).",
      "Ignorar elementos de UI como bordes, selectores de interruptor y estados desactivados (requieren contraste de 3.0:1).",
    ],
    privacyExplanation:
      "Todo el procesamiento, las conversiones y el renderizado ocurren en la memoria local de tu navegador. Esta herramienta no envía tus archivos a los servidores de GainUtility; cualquier procesamiento externo se indica en la propia herramienta.",
    faqs: [
      {
        question: "¿Cuáles son los umbrales de proporción de contraste de WCAG AA y AAA?",
        answer:
          "Para texto normal, AA requiere una proporción mínima de 4.5:1 y AAA requiere 7:1. Para texto grande (18pt+ o 14pt+ en negrita), AA requiere 3:1 y AAA requiere 4.5:1.",
      },
      {
        question: "¿Cómo funciona la corrección automática de contraste?",
        answer:
          "Nuestro motor analiza la luminancia relativa de ambos colores y aplica un sombreado o realce incremental y matemático a tu color de texto hasta que cruce el umbral seguro de 4.5:1.",
      },
      {
        question: "¿Por qué debería importarme la proporción de contraste en textos grandes?",
        answer:
          "El texto grande es más fácil de leer, así que el umbral de WCAG se relaja a 3:1 para AA y 4.5:1 para AAA, pero mantener un contraste más alto siempre es recomendable para una lectura absolutamente clara.",
      },
      {
        question: "¿Los elementos de UI activos como inputs y bordes están sujetos a los requisitos de contraste?",
        answer:
          "Sí. Los componentes interactivos, los iconos, los bordes y los anillos de foco requieren al menos 3.0:1 de contraste para que los usuarios desactivados o con baja visión naveguen con seguridad.",
      },
      {
        question: "¿Puedo simular daltonismo en este verificador?",
        answer:
          "Sí, la herramienta incluye filtros en tiempo real que simulan Protanopia, Deuteranopia, Tritanopia y escala de grises completa, mostrando exactamente cómo los usuarios con deficiencia de color perciben tus combinaciones.",
      },
      {
        question: "¿Cómo se calcula la luminancia relativa?",
        answer:
          "La luminancia se calcula con una fórmula ponderada basada en los espacios de color sRGB, que representa qué tan brillante percibe el ojo humano cada color.",
      },
    ],
  },
  de: {
    desc: "Miss Text- und Hintergrundfarben gegen WCAG-AA- und AAA-Verhältnisse, mit Farbenblindheits-Vorschau.",
    whatText:
      "Ein visueller Barrierefreiheits-Prüfer, der Farbkombinationen bewertet, Kontrastverhältnisse in Echtzeit nach sRGB-Standards berechnet, simulierte Textgrößen anzeigt und Simulationsansichten für die gängigen Formen der Farbenblindheit bietet.",
    whyText:
      "Digitale Teilhabe ist entscheidend. Dieses Tool bewertet Ihre Farbpaare vollständig offline und sorgt so für maximale Geschwindigkeit, null Tracking und Einhaltung digitaler Standards.",
    features: [
      "Interaktive HEX-, RGB- und Farbwähler-Werkzeuge",
      "Echtzeit-Rechner für Verhältnisse nach dem W3C-Standard für relative Luminanz",
      "Farbenblindheits-Simulationen (Protanopie, Deuteranopie, Tritanopie, Graustufen)",
      "Algorithmische Generatoren für Alternativfarben mit dem nächsten zugänglichen Treffer",
      "Vordefinierte Kontrastkombinationen für schnelle Testiterationen",
    ],
    steps: [
      "Geben Sie Ihre Text-/Vordergrundfarbe im dafür vorgesehenen Feld ein oder wählen Sie sie aus.",
      "Geben Sie Ihre Hintergrund-/Canvas-Farbe ein oder wählen Sie sie aus.",
      "Prüfen Sie die WCAG-Konformitätsmatrix für sofortige Bestanden/Nicht-bestanden-Werte.",
      "Schalten Sie die Farbsimulationsfilter ein, um die Darstellungen von Sehschwächen zu sehen.",
      "Klicken Sie auf „Korrektur anwenden“, um den nächstgelegenen bestandenen Kontrastton zu berechnen und anzuwenden.",
    ],
    examples: [
      {
        title: "Zugängliche Kombination",
        desc: "Dunkles Waldgrün auf cremefarbenem Hintergrund.",
        code: "Text: #283618 | Background: #FEFAE0\nRatio: 11.23 : 1\nWCAG AA: PASS\nWCAG AAA: PASS",
      },
      {
        title: "Nicht bestandene Kombination",
        desc: "Hellorangefarbener Text auf weißem Hintergrund.",
        code: "Text: #DDA15E | Background: #FFFFFF\nRatio: 1.84 : 1\nWCAG AA: FAIL\nWCAG AAA: FAIL",
      },
    ],
    mistakes: [
      "Gestaltung nur nach Ästhetik, ohne Sehbehinderungen zu berücksichtigen (für normalen Fließtext mindestens 4,5:1 halten).",
      "UI-Elemente wie Ränder, Schalter und Deaktivierungszustände ignorieren (erfordern 3,0:1 Kontrast).",
    ],
    privacyExplanation:
      "Sämtliches Parsen, Konvertieren und Rendern läuft im lokalen Arbeitsspeicher Ihres Browsers. Dieses Tool sendet Ihre Dateien nicht an die Server von GainUtility; externe Verarbeitung wird im Tool selbst offengelegt.",
    faqs: [
      {
        question: "Welche Schwellenwerte gelten für die WCAG-AA- und AAA-Kontrastverhältnisse?",
        answer:
          "Für normalen Text verlangt AA mindestens 4,5:1 und AAA 7:1. Für großen Text (18pt+ oder 14pt+ fett) verlangt AA 3:1 und AAA 4,5:1.",
      },
      {
        question: "Wie funktioniert der automatische Kontrastkorrekturvorschlag?",
        answer:
          "Unsere Engine analysiert die relative Luminanz beider Farben und verändert Ihre Textfarbe schrittweise mathematisch abgedunkelt oder aufgehellt, bis der sichere Schwellenwert von 4,5:1 erreicht ist.",
      },
      {
        question: "Warum sind Kontrastverhältnisse bei großem Text wichtig?",
        answer:
          "Großer Text ist leichter zu lesen, daher lockert WCAG den Schwellenwert auf 3:1 für AA und 4,5:1 für AAA — ein höherer Kontrast wird aus Gründen maximaler Lesbarkeit dennoch empfohlen.",
      },
      {
        question: "Unterliegen aktive UI-Elemente wie Eingabefelder und Ränder den Kontrastanforderungen?",
        answer:
          "Ja. Interaktive Komponenten, Symbole, Ränder und Fokusringe benötigen mindestens 3,0:1 Kontrast, damit behinderte und sehbehinderte Nutzer sicher navigieren können.",
      },
      {
        question: "Kann ich in diesem Prüfer Farbenblindheit simulieren?",
        answer:
          "Ja, das Tool bietet Echtzeitfilter für Protanopie, Deuteranopie, Tritanopie und volle Graustufen und zeigt exakt, wie Nutzer mit Farbfehlsichtigkeit Ihre Kombinationen wahrnehmen.",
      },
      {
        question: "Wie wird die relative Luminanz berechnet?",
        answer:
          "Die Luminanz wird mit einer gewichteten Formel auf Basis der sRGB-Farbräume berechnet und bildet ab, wie hell das menschliche Auge jede Farbe wahrnimmt.",
      },
    ],
  },
  fr: {
    desc: "Mesurez les couleurs de texte et de fond selon les ratios WCAG AA et AAA, avec aperçus de daltonisme.",
    whatText:
      "Un vérificateur d'accessibilité visuel qui évalue les combinaisons de couleurs, calcule les ratios de contraste en temps réel selon les standards sRGB, affiche des tailles de texte simulées et propose des vues de simulation des types de daltonisme.",
    whyText:
      "L'inclusion numérique est essentielle. Cet outil évalue vos paires de styles entièrement hors ligne, garantissant une vitesse maximale, aucun suivi d'analytics et la conformité aux standards numériques.",
    features: [
      "Outils interactifs HEX, RGB et sélecteur de spectre colorimétrique",
      "Calculateurs de ratio en temps réel selon le standard de luminance relative du W3C",
      "Simulations de daltonisme (protanopie, deutéranopie, tritanopie et nuances de gris)",
      "Générateurs algorithmiques de couleurs alternatives trouvant l'alternative accessible la plus proche",
      "Combinaisons de contraste préchargées pour des itérations de test rapides",
    ],
    steps: [
      "Saisissez ou sélectionnez la couleur de votre texte/premier plan dans le champ prévu.",
      "Saisissez ou sélectionnez la couleur de fond de votre toile.",
      "Consultez la matrice de conformité WCAG pour un statut réussi/échoué immédiat.",
      "Activez les filtres de simulation des couleurs pour voir les représentations des déficiences visuelles.",
      "Cliquez sur « Appliquer la correction » pour calculer et appliquer la teinte de contraste réussie la plus proche.",
    ],
    examples: [
      {
        title: "Combinaison accessible",
        desc: "Vert forêt foncé sur fond crème.",
        code: "Text: #283618 | Background: #FEFAE0\nRatio: 11.23 : 1\nWCAG AA: PASS\nWCAG AAA: PASS",
      },
      {
        title: "Combinaison échouée",
        desc: "Texte orange clair sur fond blanc.",
        code: "Text: #DDA15E | Background: #FFFFFF\nRatio: 1.84 : 1\nWCAG AA: FAIL\nWCAG AAA: FAIL",
      },
    ],
    mistakes: [
      "Concevoir pour l'esthétique en ignorant les handicaps visuels (maintenez toujours un ratio d'au moins 4,5:1 pour le texte courant).",
      "Ignorer les éléments d'UI comme les bordures, les sélecteurs et les états désactivés (exigent un contraste de 3,0:1).",
    ],
    privacyExplanation:
      "Toutes les analyses, conversions et rendus s'exécutent dans la mémoire locale de votre navigateur. Cet outil n'envoie jamais vos fichiers vers les serveurs de GainUtility ; tout traitement externe est indiqué dans l'outil lui-même.",
    faqs: [
      {
        question: "Quels sont les seuils de ratio de contraste WCAG AA et AAA ?",
        answer:
          "Pour le texte courant, AA exige un ratio minimum de 4,5:1 et AAA 7:1. Pour le texte large (18pt+ ou 14pt+ en gras), AA exige 3:1 et AAA 4,5:1.",
      },
      {
        question: "Comment fonctionne la suggestion de correction automatique du contraste ?",
        answer:
          "Notre moteur analyse la luminance relative des deux couleurs et assombrit ou éclaircit mathématiquement votre couleur de texte par paliers jusqu'à franchir le seuil sûr de 4,5:1.",
      },
      {
        question: "Pourquoi se soucier du ratio de contraste pour le texte large ?",
        answer:
          "Le texte large se lit plus facilement, le seuil WCAG est donc assoupli à 3:1 pour AA et 4,5:1 pour AAA, mais un contraste plus élevé reste recommandé pour une lisibilité absolue.",
      },
      {
        question: "Les éléments d'UI actifs comme les champs et les bordures sont-ils soumis aux exigences de contraste ?",
        answer:
          "Oui. Les composants interactifs, les icônes, les bordures et les anneaux de focus exigent au moins 3,0:1 de contraste pour que les utilisateurs en situation de handicap ou malvoyants naviguent en sécurité.",
      },
      {
        question: "Puis-je simuler le daltonisme dans ce vérificateur ?",
        answer:
          "Oui, l'outil dispose de filtres en temps réel simulant la protanopie, la deutéranopie, la tritanopie et les nuances de gris complètes, montrant exactement comment les utilisateurs atteints de déficience chromatique perçoivent vos combinaisons.",
      },
      {
        question: "Comment la luminance relative est-elle calculée ?",
        answer:
          "La luminance est calculée via une formule pondérée fondée sur les espaces colorimétriques sRGB, représentant la brillance perçue par l'œil humain pour chaque couleur.",
      },
    ],
  },
  it: {
    desc: "Misura i colori di testo e sfondo secondo i rapporti WCAG AA e AAA, con anteprime di daltonismo.",
    whatText:
      "Un verificatore visivo di accessibilità che valuta le combinazioni di colori, calcola i rapporti di contrasto in tempo reale secondo gli standard sRGB, mostra dimensioni di testo simulate e offre viste di simulazione dei tipi di daltonismo.",
    whyText:
      "L'inclusione digitale è cruciale. Questa utility valuta le t coppie di stili completamente offline, garantendo velocità totale, zero tracciamenti analytics e conformità agli standard digitali.",
    features: [
      "Strumenti interattivi HEX, RGB e selettore di spettro colore",
      "Calcolatrici di rapporto in tempo reale secondo lo standard W3C di luminanza relativa",
      "Simulazioni di daltonismo (protanopia, deuteranopia, tritanopia e scala di grigi)",
      "Generatori algoritmici di colori alternativi che trovano l'alternativa accessibile più vicina",
      "Combinazioni di contrasto precaricate per iterazioni di test rapide",
    ],
    steps: [
      "Inserisci o seleziona il colore del testo/primo piano nel campo dedicato.",
      "Inserisci o seleziona il colore di sfondo della tua tela.",
      "Controlla la matrice di conformità WCAG per lo stato superato/non superato immediato.",
      "Attiva i filtri di simulazione colore per vedere le rappresentazioni dei deficit visivi.",
      "Clicca su Applica correzione per calcolare e applicare la tinta di contrasto superata più vicina.",
    ],
    examples: [
      {
        title: "Combinazione accessibile",
        desc: "Verde bosco scuro su sfondo crema.",
        code: "Text: #283618 | Background: #FEFAE0\nRatio: 11.23 : 1\nWCAG AA: PASS\nWCAG AAA: PASS",
      },
      {
        title: "Combinazione non superata",
        desc: "Testo arancione chiaro su sfondo bianco.",
        code: "Text: #DDA15E | Background: #FFFFFF\nRatio: 1.84 : 1\nWCAG AA: FAIL\nWCAG AAA: FAIL",
      },
    ],
    mistakes: [
      "Progettare per l'estetica ignorando le disabilità visive (mantieni sempre un rapporto di almeno 4,5:1 per il testo normale).",
      "Ignorare elementi di UI come bordi, selettori e stati disattivati (richiedono contrasto 3,0:1).",
    ],
    privacyExplanation:
      "Tutte le analisi, le conversioni e il rendering avvengono nella memoria locale del tuo browser. Questo strumento non invia i tuoi file ai server di GainUtility; qualsiasi elaborazione esterna è indicata nello strumento stesso.",
    faqs: [
      {
        question: "Quali sono le soglie di rapporto di contrasto WCAG AA e AAA?",
        answer:
          "Per il testo normale, AA richiede un rapporto minimo di 4,5:1 e AAA 7:1. Per il testo grande (18pt+ o 14pt+ in grassetto), AA richiede 3:1 e AAA 4,5:1.",
      },
      {
        question: "Come funziona la correzione automatica del contrasto?",
        answer:
          "Il nostro motore analizza la luminanza relativa dei due colori e applica un'ombreggiatura o una rischiaratura incrementale e matematica al colore del testo fino a superare la soglia sicura di 4,5:1.",
      },
      {
        question: "Perché dovrei preoccuparmi del rapporto di contrasto per il testo grande?",
        answer:
          "Il testo grande si legge più facilmente, quindi la soglia WCAG viene adattata a 3:1 per AA e 4,5:1 per AAA, ma mantenere un contrasto più alto è sempre consigliato per una lettura assolutamente nitida.",
      },
      {
        question: "Gli elementi di UI attivi come input e bordi sono soggetti ai requisiti di contrasto?",
        answer:
          "Sì. Componenti interattivi, icone, bordi e anelli di focus richiedono almeno 3,0:1 di contrasto perché gli utenti disabilitati o con bassa vista navigino in sicurezza.",
      },
      {
        question: "Posso simulare il daltonismo in questo verificatore?",
        answer:
          "Sì, lo strumento dispone di filtri in tempo reale che simulano protanopia, deuteranopia, tritanopia e scala di grigi completa, mostrando esattamente come gli utenti con deficit cromatico percepiscono le tue combinazioni.",
      },
      {
        question: "Come viene calcolata la luminanza relativa?",
        answer:
          "La luminanza viene calcolata con una formula ponderata basata sugli spazi colore sRGB e rappresenta quanto ogni colore appare luminoso all'occhio umano.",
      },
    ],
  },
};
