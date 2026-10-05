/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Page-level localized content (the "how we localize static pages" model).
 *
 * Every public content page gets ONE canonical English source here, plus a
 * per-locale translation for each supported language. Components consume it
 * through `pageText(key, locale)` / `homeFaqs(locale)` — there is never a
 * duplicated React component per language. Content that is already localized
 * elsewhere (header/footer chrome in ui.ts, tool pages in seo.ts/slugs.ts,
 * tool UIs in toolUi.ts) is NOT restated here.
 *
 * Keys follow an <area>.<name> convention so a single flat record stays
 * grep-friendly:
 *   home.*            — homepage SEO + FAQ + hero card strings
 *   about.*           — /about page
 *   services.*        — /services page
 *   blog.*            — /blog listing
 *   blogArticle.*     — shared strings on the article reading page
 */

import type { ToolId, ViewState } from "../types";
import type { BlogCategory } from "../blog/blogData";
import { DEFAULT_LOCALE } from "./locales";
import { LocaleCode, TOOL_LOCALE_NAMES } from "./slugs";
import { toolUiLocaleWired } from "./toolUi";
import "./tools";
import { SITE_PAGES_COPY } from "./sitePagesData";

/** A key that always has English and may have other locales. */
export type LocalizedText = Partial<Record<LocaleCode, string>> & { en: string };

export interface FaqEntry {
  question: string;
  answer: string;
}

export const PAGE: Record<string, LocalizedText> = {
  ...SITE_PAGES_COPY,
  /* ------------------------------------------------------------------ */
  /* Homepage                                                           */
  /* ------------------------------------------------------------------ */
  "home.seoTitle": {
    en: "GainUtility — Free Browser Tools for Developers & Creators",
    "pt-br": "GainUtility — Ferramentas gratuitas no navegador para desenvolvedores e criadores",
    id: "GainUtility — Alat gratis berbasis browser untuk pengembang & kreator",
    "es-mx": "GainUtility — Herramientas gratuitas en el navegador para desarrolladores y creadores",
    "es-co": "GainUtility — Herramientas gratuitas en el navegador para desarrolladores y creadores",
    de: "GainUtility — Kostenlose Browser-Tools für Entwickler & Kreative",
    fr: "GainUtility — Outils gratuits dans le navigateur pour développeurs et créateurs",
    it: "GainUtility — Strumenti gratuiti nel browser per sviluppatori e creatori",
  },
  "home.seoDescription": {
    en: "Free browser-based tools for developers, designers, marketers, and creators: JSON, images, PDFs, SEO generators, and more. Processing happens locally in your browser, and any tool that calls an external service says so on its page.",
    "pt-br": "Ferramentas gratuitas no navegador para desenvolvedores, designers, profissionais de marketing e criadores: JSON, imagens, PDFs, geradores de SEO e muito mais. O processamento acontece localmente no seu navegador, e qualquer ferramenta que use um serviço externo informa isso na própria página.",
    id: "Alat gratis berbasis browser untuk pengembang, desainer, pemasar, dan kreator: JSON, gambar, PDF, generator SEO, dan lainnya. Semua pemrosesan berjalan lokal di browser Anda, dan alat apa pun yang memanggil layanan eksternal menyatakannya di halamannya.",
    "es-mx": "Herramientas gratuitas en el navegador para desarrolladores, diseñadores, especialistas en marketing y creadores: JSON, imágenes, PDF, generadores de SEO y más. El procesamiento ocurre localmente en tu navegador, y toda herramienta que use un servicio externo lo indica en su página.",
    "es-co": "Herramientas gratuitas en el navegador para desarrolladores, diseñadores, especialistas en marketing y creadores: JSON, imágenes, PDF, generadores de SEO y más. El procesamiento ocurre localmente en tu navegador, y toda herramienta que use un servicio externo lo indica en su página.",
    de: "Kostenlose Browser-Tools für Entwickler, Designer, Marketer und Kreative: JSON, Bilder, PDFs, SEO-Generatoren und mehr. Die Verarbeitung erfolgt lokal in Ihrem Browser; jedes Tool, das einen externen Dienst aufruft, weist darauf auf seiner Seite hin.",
    fr: "Outils gratuits dans le navigateur pour développeurs, designers, spécialistes du marketing et créateurs : JSON, images, PDF, générateurs SEO et plus encore. Le traitement a lieu localement dans votre navigateur, et tout outil qui fait appel à un service externe le signale sur sa page.",
    it: "Strumenti gratuiti nel browser per sviluppatori, designer, esperti di marketing e creatori: JSON, immagini, PDF, generatori SEO e altro. L'elaborazione avviene localmente nel tuo browser e qualsiasi strumento che usa un servizio esterno lo dichiara nella sua pagina.",
  },
  "home.heroReady": {
    en: "ready",
    "pt-br": "pronto",
    id: "siap",
    "es-mx": "listo",
    "es-co": "listo",
    de: "bereit",
    fr: "prêt",
    it: "pronto",
  },

  /* ------------------------------------------------------------------ */
  /* About page (/about)                                                */
  /* ------------------------------------------------------------------ */
  "about.crumbTitle": {
    en: "About",
    "pt-br": "Sobre",
    id: "Tentang",
    "es-mx": "Acerca de",
    "es-co": "Acerca de",
    de: "Über uns",
    fr: "À propos",
    it: "Chi siamo",
  },
  "about.seoTitle": {
    en: "About GainUtility — Built by One Person, Privacy-First",
    "pt-br": "Sobre a GainUtility — Feita por uma pessoa, feita para respeitar seus dados",
    id: "Tentang GainUtility — Dibangun oleh satu orang, dibuat untuk menghormati data Anda",
    "es-mx": "Acerca de GainUtility — Hecho por una persona, hecho para respetar tus datos",
    "es-co": "Acerca de GainUtility — Hecho por una persona, hecho para respetar tus datos",
    de: "Über GainUtility — Von einer Person gebaut, mit Respekt für Ihre Daten",
    fr: "À propos de GainUtility — Construit par une personne, fait pour respecter vos données",
    it: "Chi siamo — GainUtility, costruito da una persona, pensato per rispettare i tuoi dati",
  },
  "about.seoDescription": {
    en: "GainUtility is a one-person project: browser-based tools that process on your device. Here's how it started, who builds it, and how to verify what it claims.",
    "pt-br": "A GainUtility é um projeto solo: ferramentas de navegador que processam no seu dispositivo. Veja aqui como começou, quem mantém e como verificar o que ela afirma.",
    id: "GainUtility adalah proyek satu orang: alat berbasis browser yang memproses di perangkat Anda. Di sini cara dimulainya, siapa yang membangun, dan cara memverifikasi klaimnya.",
    "es-mx": "GainUtility es un proyecto de una sola persona: herramientas de navegador que procesan en tu dispositivo. Así empezó, quién la construye y cómo verificar lo que afirma.",
    "es-co": "GainUtility es un proyecto de una sola persona: herramientas de navegador que procesan en tu dispositivo. Así empezó, quién la construye y cómo verificar lo que afirma.",
    de: "GainUtility ist ein Ein-Personen-Projekt: Browser-Werkzeuge, die auf Ihrem Gerät verarbeiten. So hat es angefangen, wer es baut und wie Sie die Aussagen prüfen können.",
    fr: "GainUtility est un projet d'une seule personne : des outils de navigateur qui traitent sur votre appareil. Voici ses débuts, qui le construit et comment vérifier ses affirmations.",
    it: "GainUtility è un progetto di una sola persona: strumenti di browser che elaborano sul tuo dispositivo. Ecco come è iniziato, chi lo costruisce e come verificarne le affermazioni.",
  },
  "about.eyebrow": {
    en: "Built from a simple idea",
    "pt-br": "Construída a partir de uma ideia simples",
    id: "Dibangun dari ide sederhana",
    "es-mx": "Construida desde una idea simple",
    "es-co": "Construida desde una idea simple",
    de: "Gebaut aus einer einfachen Idee",
    fr: "Construit à partir d'une idée simple",
    it: "Costruito da un'idea semplice",
  },
  "about.heroHeading": {
    en: "Why I built GainUtility",
    "pt-br": "Por que eu construí a GainUtility",
    id: "Mengapa saya membangun GainUtility",
    "es-mx": "Por qué construí GainUtility",
    "es-co": "Por qué construí GainUtility",
    de: "Warum ich GainUtility gebaut habe",
    fr: "Pourquoi j'ai construit GainUtility",
    it: "Perché ho costruito GainUtility",
  },
  "about.heroP1": {
    en: "GainUtility started in August 2026 as a personal project. I initially thought, \"There are already too many websites offering tools on Google, so why build another one?\" Then I realized I didn't need to simply copy what already exists. I could build useful tools around different everyday problems and make them faster, simpler, and less frustrating to use.",
    "pt-br": "A GainUtility começou em agosto de 2026 como um projeto pessoal. No início, eu pensava: \"Já existem muitos sites oferecendo ferramentas no Google, por que construir outro?\" Depois percebi que não precisava simplesmente copiar o que já existia. Eu poderia construir ferramentas úteis para diferentes problemas do dia a dia e torná-las mais rápidas, simples e menos frustrantes de usar.",
    id: "GainUtility dimulai pada Agustus 2026 sebagai proyek pribadi. Awalnya saya berpikir, \"Sudah terlalu banyak situs yang menawarkan alat di Google, lalu kenapa harus membuat lagi?\" Lalu saya menyadari bahwa saya tidak perlu sekadar menyalin apa yang sudah ada. Saya bisa membangun alat yang berguna untuk berbagai masalah sehari-hari dan membuatnya lebih cepat, lebih sederhana, dan lebih mudah digunakan.",
    "es-mx": "GainUtility empezó en agosto de 2026 como un proyecto personal. Al principio pensé: \"Ya hay demasiados sitios web ofreciendo herramientas en Google, ¿por qué construir otro?\" Luego me di cuenta de que no necesitaba simplemente copiar lo que ya existía. Podía construir herramientas útiles para diferentes problemas cotidianos y hacerlas más rápidas, simples y menos frustrantes de usar.",
    "es-co": "GainUtility empezó en agosto de 2026 como un proyecto personal. Al principio pensé: \"Ya hay demasiados sitios web ofreciendo herramientas en Google, ¿por qué construir otro?\" Luego me di cuenta de que no necesitaba simplemente copiar lo que ya existía. Podía construir herramientas útiles para diferentes problemas cotidianos y hacerlas más rápidas, simples y menos frustrantes de usar.",
    de: "GainUtility startete im August 2026 als persönliches Projekt. Anfangs dachte ich: \"Es gibt schon zu viele Webseiten mit Werkzeugen bei Google – warum noch eine bauen?\" Dann wurde mir klar, dass ich nicht einfach das Bestehende kopieren musste. Ich konnte nützliche Werkzeuge rund um verschiedene alltägliche Probleme bauen und sie schneller, einfacher und weniger frustrierend machen.",
    fr: "GainUtility a démarré en août 2026 comme projet personnel. Au début, j'ai pensé : \"Il y a déjà trop de sites qui offrent des outils sur Google, pourquoi en construire un autre ?\" Puis j'ai réalisé que je n'avais pas besoin de simplement copier ce qui existait déjà. Je pouvais construire des outils utiles autour de différents problèmes quotidiens et les rendre plus rapides, plus simples et moins frustrants à utiliser.",
    it: "GainUtility è nato ad agosto 2026 come progetto personale. All'inizio ho pensato: \"Ci sono già troppi siti web che offrono strumenti su Google, perché costruirne un altro?\" Poi ho capito che non dovevo semplicemente copiare ciò che esisteva già. Potevo costruire strumenti utili per diversi problemi quotidiani e renderli più rapidi, più semplici e meno frustranti da usare.",
  },
  "about.heroP2": {
    en: "The motivation is simple: people should be able to come to GainUtility, solve a small problem quickly, save time, and leave.",
    "pt-br": "A motivação é simples: as pessoas deveriam poder vir à GainUtility, resolver um problema pequeno rapidamente, economizar tempo e ir embora.",
    id: "Motivasinya sederhana: orang-orang harus bisa datang ke GainUtility, memecahkan masalah kecil dengan cepat, menghemat waktu, dan pergi.",
    "es-mx": "La motivación es simple: la gente debería poder llegar a GainUtility, resolver un problema pequeño rápidamente, ahorrar tiempo e irse.",
    "es-co": "La motivación es simple: la gente debería poder llegar a GainUtility, resolver un problema pequeño rápidamente, ahorrar tiempo e irse.",
    de: "Die Motivation ist einfach: Menschen sollten zu GainUtility kommen, ein kleines Problem schnell lösen, Zeit sparen und weiterziehen.",
    fr: "La motivation est simple : les gens devraient pouvoir venir sur GainUtility, résoudre un petit problème rapidement, gagner du temps et partir.",
    it: "La motivazione è semplice: le persone dovrebbero poter venire su GainUtility, risolvere un piccolo problema rapidamente, guadagnare tempo e andarsene.",
  },
  "about.updated": {
    en: "Updated: September 2026",
    "pt-br": "Atualizado: setembro de 2026",
    id: "Diperbarui: September 2026",
    "es-mx": "Actualizado: septiembre de 2026",
    "es-co": "Actualizado: septiembre de 2026",
    de: "Aktualisiert: September 2026",
    fr: "Mis à jour : septembre 2026",
    it: "Aggiornato: settembre 2026",
  },
  "about.reasonHeading": {
    en: "Why another tools website?",
    "pt-br": "Por que mais um site de ferramentas?",
    id: "Mengapa lagi situs alat?",
    "es-mx": "\u00bfPor qu\u00e9 otro sitio de herramientas?",
    "es-co": "\u00bfPor qu\u00e9 otro sitio de herramientas?",
    de: "Warum noch eine Werkzeug-Webseite?",
    fr: "Pourquoi un autre site d\u2019outils ?",
    it: "Perch\u00e9 un altro sito di strumenti?",
  },
  "about.reasonP1": {
    en: "There are already plenty of tool websites on Google. I knew that. So I didn\u2019t want to build another site just to add more of the same.",
    "pt-br": "J\u00e1 existem muitos sites de ferramentas no Google. Eu sabia disso. Ent\u00e3o n\u00e3o queria construir outro site s\u00f3 para adicionar mais do mesmo.",
    id: "Sudah ada banyak situs alat di Google. Saya tahu itu. Jadi saya tidak ingin membangun situs lain hanya untuk menambah lebih banyak yang sama.",
    "es-mx": "Ya hay bastantes sitios de herramientas en Google. Lo sab\u00eda. No quer\u00eda construir otro sitio solo para agregar m\u00e1s de lo mismo.",
    "es-co": "Ya hay bastantes sitios de herramientas en Google. Lo sab\u00eda. No quer\u00eda construir otro sitio solo para agregar m\u00e1s de lo mismo.",
    de: "Es gibt bereits genug Werkzeug-Webseiten bei Google. Das wusste ich. Deshalb wollte ich nicht einfach nur eine weitere Seite bauen, um mehr vom Gleichen anzubieten.",
    fr: "Il existe d\u00e9j\u00e0 beaucoup de sites d\u2019outils sur Google. Je le savais. Je ne voulais pas construire un autre site juste pour ajouter encore le m\u00eame.",
    it: "Ci sono gi\u00e0 molti siti di strumenti su Google. Lo sapevo. Non volevo costruire un altro sito solo per aggiungere altro dello stesso.",
  },
  "about.reasonP2": {
    en: "I wanted to solve the small problems that waste people\u2019s time \u2014 finding the right tool, dealing with unnecessary steps, uploading files when they don\u2019t need to leave the device, or simply trying to figure out how something works.",
    "pt-br": "Eu queria resolver os pequenos problemas que desperdi\u00e7am o tempo das pessoas \u2014 encontrar a ferramenta certa, lidar com passos desnecess\u00e1rios, enviar arquivos quando eles n\u00e3o precisam sair do dispositivo, ou simplesmente tentar descobrir como algo funciona.",
    id: "Saya ingin memecahkan masalah kecil yang membuang waktu orang \u2014 menemukan alat yang tepat, menghadapi langkah yang tidak perlu, mengunggah file saat file tidak perlu meninggalkan perangkat, atau sekadar mencoba memahami cara sesuatu bekerja.",
    "es-mx": "Quer\u00eda resolver los peque\u00f1os problemas que desperdician el tiempo de la gente \u2014 encontrar la herramienta correcta, lidiar con pasos innecesarios, subir archivos cuando no necesitan salir del dispositivo, o simplemente tratar de entender c\u00f3mo funciona algo.",
    "es-co": "Quer\u00eda resolver los peque\u00f1os problemas que desperdician el tiempo de la gente \u2014 encontrar la herramienta correcta, lidiar con pasos innecesarios, subir archivos cuando no necesitan salir del dispositivo, o simplemente tratar de entender c\u00f3mo funciona algo.",
    de: "Ich wollte die kleinen Probleme l\u00f6sen, die Menschen ihre Zeit kosten \u2014 das richtige Werkzeug finden, mit unn\u00f6tigen Schritten jonglieren, Dateien hochladen, obwohl sie das Ger\u00e4t nicht verlassen m\u00fcssen, oder einfach herausfinden, wie etwas funktioniert.",
    fr: "Je voulais r\u00e9soudre les petits probl\u00e8mes qui font perdre du temps aux gens \u2014 trouver le bon outil, faire face \u00e0 des \u00e9tapes inutiles, t\u00e9l\u00e9charger des fichiers alors qu\u2019ils n\u2019ont pas besoin de quitter l\u2019appareil, ou simplement essayer de comprendre comment quelque chose fonctionne.",
    it: "Volevo risolvere i piccoli problemi che fanno perdere tempo alle persone \u2014 trovare lo strumento giusto, affrontare passaggi inutili, caricare file quando non hanno bisogno di lasciare il dispositivo, o semplicemente cercare di capire come funziona qualcosa.",
  },
  "about.whatHeading": {
    en: "Built for the small things",
    "pt-br": "Feita para as pequenas coisas",
    id: "Dibangun untuk hal-hal kecil",
    "es-mx": "Hecha para las cosas peque\u00f1as",
    "es-co": "Hecha para las cosas peque\u00f1as",
    de: "F\u00fcr die kleinen Dinge gebaut",
    fr: "Construit pour les petites choses",
    it: "Costruito per le piccole cose",
  },
  "about.whatP1": {
    en: "GainUtility focuses on practical utilities you can open, use, and finish quickly. Most of the tools run directly in your browser, which means:",
    "pt-br": "A GainUtility foca em utilit\u00e1rios pr\u00e1ticos que voc\u00ea pode abrir, usar e terminar rapidamente. A maioria das ferramentas roda diretamente no seu navegador, o que significa:",
    id: "GainUtility berfokus pada utilitas praktis yang bisa Anda buka, gunakan, dan selesaikan dengan cepat. Sebagian besar alat berjalan langsung di browser Anda, yang berarti:",
    "es-mx": "GainUtility se enfoca en utilidades pr\u00e1cticas que puedes abrir, usar y terminar r\u00e1pidamente. La mayor\u00eda de las herramientas se ejecutan directamente en tu navegador, lo que significa:",
    "es-co": "GainUtility se enfoca en utilidades pr\u00e1cticas que puedes abrir, usar y terminar r\u00e1pidamente. La mayor\u00eda de las herramientas se ejecutan directamente en tu navegador, lo que significa:",
    de: "GainUtility konzentriert sich auf praktische Werkzeuge, die Sie \u00f6ffnen, nutzen und schnell abschlie\u00dfen k\u00f6nnen. Die meisten Tools laufen direkt in Ihrem Browser, was bedeutet:",
    fr: "GainUtility se concentre sur des utilitaires pratiques que vous pouvez ouvrir, utiliser et terminer rapidement. La plupart des outils fonctionnent directement dans votre navigateur, ce qui signifie :",
    it: "GainUtility si concentra su utilit\u00e0 pratiche che puoi aprire, usare e concludere rapidamente. La maggior parte degli strumenti funziona direttamente nel tuo browser, il che significa:",
  },
"about.bullet1": {
    en: "Less friction",
    "pt-br": "Menos atrito",
    id: "Lebih sedikit hambatan",
    "es-mx": "Menos fricci\u00f3n",
    "es-co": "Menos fricci\u00f3n",
    de: "Weniger Reibung",
    fr: "Moins de friction",
    it: "Meno frizione",
  },
  "about.bullet2": {
    en: "Fewer unnecessary steps",
    "pt-br": "Menos passos desnecess\u00e1rios",
    id: "Lebih sedikit langkah yang tidak perlu",
    "es-mx": "Menos pasos innecesarios",
    "es-co": "Menos pasos innecesarios",
    de: "Weniger unn\u00f6tige Schritte",
    fr: "Moins d\u2019\u00e9tapes inutiles",
    it: "Meno passaggi inutili",
  },
  "about.bullet3": {
    en: "Simple interfaces that get out of your way",
    "pt-br": "Interfaces simples que n\u00e3o atrapalham",
    id: "Antarmuka sederhana yang tidak mengganggu",
    "es-mx": "Interfaces simples que no estorban",
    "es-co": "Interfaces simples que no estorban",
    de: "Einfache Oberfl\u00e4chen, die nicht im Weg stehen",
    fr: "Des interfaces simples qui ne g\u00eanent pas",
    it: "Interfacce semplici che non ostacolano",
  },
  "about.bullet4": {
    en: "Useful tools for everyday problems",
    "pt-br": "Ferramentas \u00fateis para problemas do dia a dia",
    id: "Alat yang berguna untuk masalah sehari-hari",
    "es-mx": "Herramientas \u00fatiles para problemas cotidianos",
    "es-co": "Herramientas \u00fatiles para problemas cotidianos",
    de: "N\u00fctzliche Werkzeuge f\u00fcr allt\u00e4gliche Probleme",
    fr: "Des outils utiles pour les probl\u00e8mes du quotidien",
    it: "Strumenti utili per i problemi di tutti i giorni",
  },
  "about.bullet5": {
    en: "Privacy when processing can happen locally",
    "pt-br": "Privacidade quando o processamento pode acontecer localmente",
    id: "Privasi saat pemrosesan bisa dilakukan secara lokal",
    "es-mx": "Privacidad cuando el procesamiento puede ocurrir localmente",
    "es-co": "Privacidad cuando el procesamiento puede ocurrir localmente",
    de: "Datenschutz, wenn die Verarbeitung lokal erfolgen kann",
    fr: "Confidentialit\u00e9 lorsque le traitement peut avoir lieu localement",
    it: "Privacy quando l\u2019elaborazione pu\u00f2 avvenire localmente",
  },
  "about.bullet6": {
    en: "No account when one isn\u2019t necessary",
    "pt-br": "Sem conta quando uma n\u00e3o \u00e9 necess\u00e1ria",
    id: "Tanpa akun saat akun tidak diperlukan",
    "es-mx": "Sin cuenta cuando no es necesaria",
    "es-co": "Sin cuenta cuando no es necesaria",
    de: "Kein Konto, wenn keins n\u00f6tig ist",
    fr: "Pas de compte quand ce n\u2019est pas n\u00e9cessaire",
    it: "Nessun account quando non \u00e8 necessario",
  },
  "about.personHeading": {
    en: "One person, building it",
    "pt-br": "Uma pessoa, construindo",
    id: "Satu orang, membangunnya",
    "es-mx": "Una persona, construy\u00e9ndola",
    "es-co": "Una persona, construy\u00e9ndola",
    de: "Eine Person, die es baut",
    fr: "Une personne, qui la construit",
    it: "Una persona, che la costruisce",
  },
  "about.personP1": {
    en: "GainUtility is designed and maintained by one person. I design the pages, build the tools, fix the bugs, and decide what gets added next. It\u2019s a small project, which also means I can pay attention to the little things.",
    "pt-br": "A GainUtility \u00e9 projetada e mantida por uma pessoa. Eu projeto as p\u00e1ginas, construo as ferramentas, corrijo os bugs e decido o que ser\u00e1 adicionado a seguir. \u00c9 um projeto pequeno, o que tamb\u00e9m significa que posso prestar aten\u00e7\u00e3o aos detalhes.",
    id: "GainUtility dirancang dan dipelihara oleh satu orang. Saya mendesain halaman, membangun alat, memperbaiki bug, dan memutuskan apa yang ditambahkan selanjutnya. Ini proyek kecil, yang juga berarti saya bisa memperhatikan hal-hal kecil.",
    "es-mx": "GainUtility est\u00e1 dise\u00f1ada y mantenida por una persona. Dise\u00f1o las p\u00e1ginas, construyo las herramientas, corrijo los errores y decido qu\u00e9 se agrega despu\u00e9s. Es un proyecto peque\u00f1o, lo que tambi\u00e9n significa que puedo prestar atenci\u00f3n a los detalles.",
    "es-co": "GainUtility est\u00e1 dise\u00f1ada y mantenida por una persona. Dise\u00f1o las p\u00e1ginas, construyo las herramientas, corrijo los errores y decido qu\u00e9 se agrega despu\u00e9s. Es un proyecto peque\u00f1o, lo que tambi\u00e9n significa que puedo prestar atenci\u00f3n a los detalles.",
    de: "GainUtility wird von einer Person gestaltet und gepflegt. Ich gestalte die Seiten, baue die Werkzeuge, behebe Fehler und entscheide, was als N\u00e4chstes kommt. Es ist ein kleines Projekt, was auch bedeutet, dass ich auf die kleinen Details achten kann.",
    fr: "GainUtility est con\u00e7u et maintenu par une seule personne. Je con\u00e7ois les pages, je construis les outils, je corrige les bugs et je d\u00e9cide ce qui sera ajout\u00e9 ensuite. C\u2019est un petit projet, ce qui signifie aussi que je peux pr\u00eater attention aux d\u00e9tails.",
    it: "GainUtility \u00e8 progettato e mantenuto da una persona. Progetto le pagine, costruisco gli strumenti, correggo i bug e decido cosa viene aggiunto dopo. \u00c8 un piccolo progetto, il che significa anche che posso prestare attenzione alle piccole cose.",
  },
  "about.valuesHeading": {
    en: "What I care about",
    "pt-br": "O que me importa",
    id: "Yang saya pedulikan",
    "es-mx": "Lo que me importa",
    "es-co": "Lo que me importa",
    de: "Worum es mir geht",
    fr: "Ce qui compte pour moi",
    it: "Ci\u00f2 che mi sta a cuore",
  },
  "about.value1.title": {
    en: "Save time",
    "pt-br": "Economizar tempo",
    id: "Hemat waktu",
    "es-mx": "Ahorrar tiempo",
    "es-co": "Ahorrar tiempo",
    de: "Zeit sparen",
    fr: "Gagner du temps",
    it: "Risparmiare tempo",
  },
  "about.value1.body": {
    en: "Small tasks shouldn\u2019t require a complicated workflow.",
    "pt-br": "Pequenas tarefas n\u00e3o deveriam exigir um fluxo de trabalho complicado.",
    id: "Tugas kecil seharusnya tidak memerlukan alur kerja yang rumit.",
    "es-mx": "Las tareas peque\u00f1as no deber\u00edan requerir un flujo de trabajo complicado.",
    "es-co": "Las tareas peque\u00f1as no deber\u00edan requerir un flujo de trabajo complicado.",
    de: "Kleine Aufgaben sollten keinen komplizierten Workflow erfordern.",
    fr: "Les petites t\u00e2ches ne devraient pas n\u00e9cessiter un flux de travail compliqu\u00e9.",
    it: "I piccoli compiti non dovrebbero richiedere un flusso di lavoro complicato.",
  },
  "about.value2.title": {
    en: "Keep it simple",
    "pt-br": "Manter simples",
    id: "Tetap sederhana",
    "es-mx": "Mantenerlo simple",
    "es-co": "Mantenerlo simple",
    de: "Einfach halten",
    fr: "Garder simple",
    it: "Mantenere semplice",
  },
  "about.value2.body": {
    en: "A useful tool should be understandable without instructions longer than the task itself.",
    "pt-br": "Uma ferramenta \u00fatil deve ser compreens\u00edvel sem instru\u00e7\u00f5es mais longas do que a pr\u00f3pria tarefa.",
    id: "Alat yang berguna seharusnya bisa dipahami tanpa instruksi yang lebih panjang dari tugas itu sendiri.",
    "es-mx": "Una herramienta \u00fatil debe ser comprensible sin instrucciones m\u00e1s largas que la tarea misma.",
    "es-co": "Una herramienta \u00fatil debe ser comprensible sin instrucciones m\u00e1s largas que la tarea misma.",
    de: "Ein n\u00fctzliches Werkzeug sollte verst\u00e4ndlich sein, ohne Anleitungen, die l\u00e4nger sind als die Aufgabe selbst.",
    fr: "Un outil utile devrait \u00eatre compr\u00e9hensible sans instructions plus longues que la t\u00e2che elle-m\u00eame.",
    it: "Uno strumento utile dovrebbe essere comprensibile senza istruzioni pi\u00f9 lunghe del compito stesso.",
  },
  "about.value3.title": {
    en: "Respect your files",
    "pt-br": "Respeitar seus arquivos",
    id: "Menghormati file Anda",
    "es-mx": "Respetar tus archivos",
    "es-co": "Respetar tus archivos",
    de: "Ihre Dateien respektieren",
    fr: "Respecter vos fichiers",
    it: "Rispettare i tuoi file",
  },
  "about.value3.body": {
    en: "When something can be processed in the browser, there is no reason to send it somewhere else.",
    "pt-br": "Quando algo pode ser processado no navegador, n\u00e3o h\u00e1 motivo para envi\u00e1-lo para outro lugar.",
    id: "Ketika sesuatu bisa diproses di browser, tidak ada alasan untuk mengirimnya ke tempat lain.",
    "es-mx": "Cuando algo puede procesarse en el navegador, no hay raz\u00f3n para enviarlo a otro lado.",
    "es-co": "Cuando algo puede procesarse en el navegador, no hay raz\u00f3n para enviarlo a otro lado.",
    de: "Wenn etwas im Browser verarbeitet werden kann, gibt es keinen Grund, es woanders hinzuschicken.",
    fr: "Quand quelque chose peut \u00eatre trait\u00e9 dans le navigateur, il n\u2019y a aucune raison de l\u2019envoyer ailleurs.",
    it: "Quando qualcosa pu\u00f2 essere elaborato nel browser, non c\u2019\u00e8 motivo per inviarlo altrove.",
  },
  "about.value4.title": {
    en: "Keep improving",
    "pt-br": "Continuar melhorando",
    id: "Terus meningkatkan",
    "es-mx": "Seguir mejorando",
    "es-co": "Seguir mejorando",
    de: "St\u00e4ndig verbessern",
    fr: "Continuer \u00e0 s\u2019am\u00e9liorer",
    it: "Continuare a migliorare",
  },
  "about.value4.body": {
    en: "Tools are improved based on what is actually useful, confusing, broken, or missing.",
    "pt-br": "As ferramentas s\u00e3o melhoradas com base no que \u00e9 realmente \u00fatil, confuso, quebrado ou ausente.",
    id: "Alat ditingkatkan berdasarkan apa yang sebenarnya berguna, membingungkan, rusak, atau hilang.",
    "es-mx": "Las herramientas se mejoran en funci\u00f3n de lo que es realmente \u00fatil, confuso, roto o faltante.",
    "es-co": "Las herramientas se mejoran en funci\u00f3n de lo que es realmente \u00fatil, confuso, roto o faltante.",
    de: "Werkzeuge werden verbessert basierend auf dem, was tats\u00e4chlich n\u00fctzlich, verwirrend, kaputt oder fehlend ist.",
    fr: "Les outils sont am\u00e9lior\u00e9s en fonction de ce qui est r\u00e9ellement utile, trompeur, cass\u00e9 ou manquant.",
    it: "Gli strumenti vengono migliorati in base a ci\u00f2 che \u00e8 effettivamente utile, confuso, rotto o mancante.",
  },
  "about.notHeading": {
    en: "What I don\u2019t want this to become",
    "pt-br": "O que n\u00e3o quero que isso se torne",
    id: "Apa yang tidak saya inginkan dari ini",
    "es-mx": "Lo que no quiero que esto se convierta",
    "es-co": "Lo que no quiero que esto se convierta",
    de: "Was ich nicht daraus machen will",
    fr: "Ce que je ne veux pas que \u00e7a devienne",
    it: "Ci\u00f2 che non voglio che diventi",
  },
  "about.notP1": {
    en: "GainUtility isn\u2019t trying to become an enormous collection of complicated software. There are no accounts forced on you, no unnecessary popups, no long workflows, and no walls of text before you can use a tool. The goal is the opposite: find something, use it, move on.",
    "pt-br": "A GainUtility n\u00e3o tenta se tornar uma enorme cole\u00e7\u00e3o de software complicado. N\u00e3o h\u00e1 contas for\u00e7adas, popups desnecess\u00e1rios, longos fluxos de trabalho ou blocos de texto antes de usar uma ferramenta. O objetivo \u00e9 o oposto: encontrar algo, us\u00e1-lo e seguir em frente.",
    id: "GainUtility tidak berusaha menjadi kumpulan perangkat lunak rumit yang besar. Tidak ada akun yang dipaksakan, popup yang tidak perlu, alur kerja yang panjang, atau dinding teks sebelum Anda bisa menggunakan alat. Tujuannya adalah kebalikannya: temukan sesuatu, gunakan, dan lanjutkan.",
    "es-mx": "GainUtility no intenta convertirse en una enorme colecci\u00f3n de software complicado. No hay cuentas forzadas, popups innecesarios, flujos de trabajo largos ni muros de texto antes de usar una herramienta. El objetivo es lo contrario: encuentra algo, \u00fasalo, sigue adelante.",
    "es-co": "GainUtility no intenta convertirse en una enorme colecci\u00f3n de software complicado. No hay cuentas forzadas, popups innecesarios, flujos de trabajo largos ni muros de texto antes de usar una herramienta. El objetivo es lo contrario: encuentra algo, \u00fasalo, sigue adelante.",
    de: "GainUtility versucht nicht, eine riesige Sammlung komplizierter Software zu werden. Es gibt keine erzwungenen Konten, keine unn\u00f6tigen Pop-ups, keine langen Workflows und keine Textw\u00e4nde, bevor man ein Werkzeug nutzen kann. Das Ziel ist das Gegenteil: etwas finden, nutzen und weitermachen.",
    fr: "GainUtility n\u2019essaie pas de devenir une \u00e9norme collection de logiciels compliqu\u00e9s. Il n\u2019y a pas de comptes forc\u00e9s, pas de popups inutiles, pas de flux de travail longs et pas de murs de texte avant de pouvoir utiliser un outil. L\u2019objectif est le contraire : trouver quelque chose, l\u2019utiliser, passer \u00e0 autre chose.",
    it: "GainUtility non cerca di diventare un\u2019enorme raccolta di software complicato. Non ci sono account forzati, popup inutili, flussi di lavoro lunghi o muri di testo prima di poter usare uno strumento. L\u2019obiettivo \u00e8 il contrario: trovare qualcosa, usarlo, andare avanti.",
  },
  "about.closingHeading": {
    en: "That\u2019s the idea.",
    "pt-br": "Essa \u00e9 a ideia.",
    id: "Itu idenya.",
    "es-mx": "Esa es la idea.",
    "es-co": "Esa es la idea.",
    de: "Das ist die Idee.",
    fr: "C\u2019est l\u2019id\u00e9e.",
    it: "Quella \u00e8 l\u2019idea.",
  },
  "about.closingBody": {
    en: "Find a tool. Get the job done. Get on with your day.",
    "pt-br": "Encontre uma ferramenta. Fa\u00e7a o trabalho. Siga com seu dia.",
    id: "Temukan alat. Selesaikan pekerjaan. Lanjutkan hari Anda.",
    "es-mx": "Encuentra una herramienta. Haz el trabajo. Sigue con tu d\u00eda.",
    "es-co": "Encuentra una herramienta. Haz el trabajo. Sigue con tu d\u00eda.",
    de: "Finden Sie ein Werkzeug. Erledigen Sie die Aufgabe. Gehen Sie Ihrem Tag weiter nach.",
    fr: "Trouvez un outil. Faites le travail. Continuez votre journ\u00e9e.",
    it: "Trova uno strumento. Fai il lavoro. Vai avanti con la tua giornata.",
  },
  "about.cta": {
    en: "Browse tools",
    "pt-br": "Explorar ferramentas",
    id: "Jelajahi alat",
    "es-mx": "Explorar herramientas",
    "es-co": "Explorar herramientas",
    de: "Werkzeuge durchst\u00f6bern",
    fr: "Parcourir les outils",
    it: "Sfoglia gli strumenti",
  },


/* ------------------------------------------------------------------ */
  /* Blog listing (/blog)                                               */
  /* ------------------------------------------------------------------ */
  "blog.seoTitle": {
    en: "GainUtility Blog — Practical Digital Work Guides",
    "pt-br": "Blog da GainUtility — Guias práticos para tarefas diárias com arquivos",
    id: "Blog GainUtility — Panduan praktis untuk tugas file sehari-hari",
    "es-mx": "Blog de GainUtility — Guías prácticas para tareas cotidianas con archivos",
    "es-co": "Blog de GainUtility — Guías prácticas para tareas cotidianas con archivos",
    de: "GainUtility-Blog — Praktische Anleitungen für alltägliche Dateiaufgaben",
    fr: "Blog GainUtility — Guides pratiques pour les tâches de fichiers du quotidien",
    it: "Blog di GainUtility — Guide pratiche per le attività di file di tutti i giorni",
  },
  "blog.seoDescription": {
    en: "Short, honest walkthroughs for the small file jobs that get in the way — PDFs, images, JSON, QR codes, and search snippets. Every guide ends with the tool that does the job.",
    "pt-br": "Guias práticos e fluxos de trabalho reais para PDFs, imagens, SEO, utilitários de desenvolvedor e ferramentas de navegador do dia a dia — escritos para dar conta do que você precisa fazer.",
    id: "Panduan praktis dan alur kerja nyata untuk PDF, gambar, SEO, utilitas developer, dan alat browser sehari-hari — ditulis untuk menyelesaikan hal-hal yang perlu dilakukan.",
    "es-mx": "Guías prácticas y flujos de trabajo reales para PDF, imágenes, SEO, utilidades de desarrollo y herramientas de navegador de uso diario — escritas para hacer las cosas.",
    "es-co": "Guías prácticas y flujos de trabajo reales para PDF, imágenes, SEO, utilidades de desarrollo y herramientas de navegador de uso diario — escritas para hacer las cosas.",
    de: "Praktische Anleitungen und echte Arbeitsabläufe für PDFs, Bilder, SEO, Entwickler-Werkzeuge und alltägliche Browser-Tools — geschrieben, um Dinge erledigt zu bekommen.",
    fr: "Guides pratiques et flux de travail réels pour les PDF, les images, le SEO, les utilitaires développeur et les outils de navigateur du quotidien — écrits pour mener vos tâches à bien.",
    it: "Guide pratiche e flussi di lavoro reali per PDF, immagini, SEO, utilità per sviluppatori e strumenti di uso quotidiano nel browser — scritte per portare a termine le cose.",
  },
  "blog.h1": {
    en: "Practical guides for everyday digital work.",
    "pt-br": "Guias práticos para dar conta do que você precisa fazer.",
    id: "Panduan praktis untuk menyelesaikan hal-hal yang perlu dilakukan.",
    "es-mx": "Guías prácticas para hacer las cosas.",
    "es-co": "Guías prácticas para hacer las cosas.",
    de: "Praktische Anleitungen, um Dinge erledigt zu bekommen.",
    fr: "Des guides pratiques pour mener vos tâches à bien.",
    it: "Guide pratiche per portare a termine le cose.",
  },
  "blog.subtitle": {
    en: "Short, honest walkthroughs for the small file jobs that get in the way. Each guide names the task, the steps, and the tool that finishes it.",
    "pt-br": "Como usar nossas ferramentas, resolver problemas comuns de arquivos e obter melhores resultados com utilitários simples de navegador.",
    id: "Cara menggunakan alat kami, memperbaiki masalah file yang umum, dan mendapatkan hasil yang lebih baik dari utilitas browser sehari-hari.",
    "es-mx": "Cómo usar nuestras herramientas, resolver problemas comunes de archivos y lograr mejores resultados con utilidades sencillas del navegador.",
    "es-co": "Cómo usar nuestras herramientas, resolver problemas comunes de archivos y lograr mejores resultados con utilidades sencillas del navegador.",
    de: "So nutzen Sie unsere Tools, beheben typische Dateiprobleme und holen mehr aus den alltäglichen Browser-Werkzeugen heraus.",
    fr: "Comment utiliser nos outils, régler les problèmes de fichiers les plus courants et obtenir de meilleurs résultats avec les utilitaires du navigateur au quotidien.",
    it: "Come usare i nostri strumenti, risolvere i problemi di file più comuni e ottenere risultati migliori dalle utility del browser di tutti i giorni.",
  },
  "blog.latestTitle": {
    en: "Latest articles",
    "pt-br": "Artigos recentes",
    id: "Artikel terbaru",
    "es-mx": "Artículos recientes",
    "es-co": "Artículos recientes",
    de: "Neueste Beiträge",
    fr: "Articles récents",
    it: "Articoli recenti",
  },
  "blog.moreTitle": {
    en: "All guides",
    "pt-br": "Mais artigos",
    id: "Artikel lainnya",
    "es-mx": "Más artículos",
    "es-co": "Más artículos",
    de: "Weitere Beiträge",
    fr: "Plus d'articles",
    it: "Altri articoli",
  },
  "blog.topicsTitle": {
    en: "Browse by topic",
    "pt-br": "Navegue por tópico",
    id: "Telusuri berdasarkan topik",
    "es-mx": "Explora por tema",
    "es-co": "Explora por tema",
    de: "Nach Thema stöbern",
    fr: "Parcourir par sujet",
    it: "Sfoglia per argomento",
  },
  "blog.allLabel": {
    en: "All",
    "pt-br": "Todos",
    id: "Semua",
    "es-mx": "Todos",
    "es-co": "Todos",
    de: "Alle",
    fr: "Tout",
    it: "Tutti",
  },
  "blog.categoryImages": {
    en: "Images",
    "pt-br": "Imagens",
    id: "Gambar",
    "es-mx": "Imágenes",
    "es-co": "Imágenes",
    de: "Bilder",
    fr: "Images",
    it: "Immagini",
  },
  "blog.categoryProductivity": {
    en: "Productivity",
    "pt-br": "Produtividade",
    id: "Produktivitas",
    "es-mx": "Productividad",
    "es-co": "Productividad",
    de: "Produktivität",
    fr: "Productivité",
    it: "Produttività",
  },
  "blog.sectionPdf": {
    en: "PDF",
    "pt-br": "Guias de PDF",
    id: "Panduan PDF",
    "es-mx": "Guías de PDF",
    "es-co": "Guías de PDF",
    de: "PDF-Anleitungen",
    fr: "Guides PDF",
    it: "Guide PDF",
  },
  "blog.sectionDeveloper": {
    en: "Developer",
    "pt-br": "Desenvolvedor",
    id: "Developer",
    "es-mx": "Desarrollo",
    "es-co": "Desarrollo",
    de: "Entwickler",
    fr: "Développement",
    it: "Sviluppo",
  },
  "blog.sectionSeo": {
    en: "SEO",
    "pt-br": "SEO",
    id: "SEO",
    "es-mx": "SEO",
    "es-co": "SEO",
    de: "SEO",
    fr: "SEO",
    it: "SEO",
  },
  "blog.readPost": {
    en: "Read article",
    "pt-br": "Ler artigo",
    id: "Baca artikel",
    "es-mx": "Leer artículo",
    "es-co": "Leer artículo",
    de: "Artikel lesen",
    fr: "Lire l'article",
    it: "Leggi l'articolo",
  },
  "blog.crumbTitle": {
    en: "Blog",
    "pt-br": "Blog",
    id: "Blog",
    "es-mx": "Blog",
    "es-co": "Blog",
    de: "Blog",
    fr: "Blog",
    it: "Blog",
  },

  /* ------------------------------------------------------------------ */
  /* Blog article reading page                                          */
  /* ------------------------------------------------------------------ */
  "blogArticle.backToAll": {
    en: "All articles",
    "pt-br": "Todos os artigos",
    id: "Semua artikel",
    "es-mx": "Todos los artículos",
    "es-co": "Todos los artículos",
    de: "Alle Beiträge",
    fr: "Tous les articles",
    it: "Tutti gli articoli",
  },
  "blogArticle.related": {
    en: "Related articles",
    "pt-br": "Artigos relacionados",
    id: "Artikel terkait",
    "es-mx": "Artículos relacionados",
    "es-co": "Artículos relacionados",
    de: "Verwandte Beiträge",
    fr: "Articles liés",
    it: "Articoli correlati",
  },
  "blogArticle.keyTakeaway": {
    en: "Key takeaway",
    "pt-br": "Resumo",
    id: "Inti sari",
    "es-mx": "Lo esencial",
    "es-co": "Lo esencial",
    de: "Kernaussage",
    fr: "L'essentiel",
    it: "In breve",
  },
  "blogArticle.quickAnswer": {
    en: "Quick answer",
    "pt-br": "Resposta rápida",
    id: "Jawaban singkat",
    "es-mx": "Respuesta rápida",
    "es-co": "Respuesta rápida",
    de: "Kurze Antwort",
    fr: "Réponse rapide",
    it: "Risposta rapida",
  },

  /* ------------------------------------------------------------------ */
  /* Category hub pages (SeoLandingPage chrome)                          */
  /* ------------------------------------------------------------------ */
  "hub.sectionWhat": {
    en: "What You Can Do",
    "pt-br": "O que você pode fazer",
    id: "Yang dapat Anda lakukan",
    "es-mx": "Qué puedes hacer",
    "es-co": "Qué puedes hacer",
    de: "Was du tun kannst",
    fr: "Ce que vous pouvez faire",
    it: "Cosa puoi fare",
  },
  "hub.sectionHow": {
    en: "How to Use",
    "pt-br": "Como usar",
    id: "Cara menggunakan",
    "es-mx": "Cómo usar",
    "es-co": "Cómo usar",
    de: "So funktioniert's",
    fr: "Comment utiliser",
    it: "Come si usa",
  },
  "hub.sectionLimitations": {
    en: "Limitations",
    "pt-br": "Limitações",
    id: "Keterbatasan",
    "es-mx": "Limitaciones",
    "es-co": "Limitaciones",
    de: "Einschränkungen",
    fr: "Limites",
    it: "Limitazioni",
  },
  "hub.sectionFaq": {
    en: "Frequently Asked Questions",
    "pt-br": "Perguntas Frequentes",
    id: "Pertanyaan yang Sering Diajukan",
    "es-mx": "Preguntas Frecuentes",
    "es-co": "Preguntas frecuentes",
    de: "Häufig gestellte Fragen",
    fr: "Questions fréquentes",
    it: "Domande frequenti",
  },
  "hub.sectionRelated": {
    en: "Related Tools",
    "pt-br": "Ferramentas relacionadas",
    id: "Alat terkait",
    "es-mx": "Herramientas relacionadas",
    "es-co": "Herramientas relacionadas",
    de: "Verwandte Werkzeuge",
    fr: "Outils associés",
    it: "Strumenti correlati",
  },
  "hub.loadingTool": {
    en: "Loading tool...",
    "pt-br": "Carregando ferramenta...",
    id: "Memuat alat...",
    "es-mx": "Cargando herramienta...",
    "es-co": "Cargando herramienta...",
    de: "Werkzeug wird geladen...",
    fr: "Chargement de l'outil...",
    it: "Caricamento dello strumento...",
  },
  "hub.browseAll": {
    en: "Browse all {category} on GainUtility",
    "pt-br": "Ver todas as {category} na GainUtility",
    id: "Jelajahi semua {category} di GainUtility",
    "es-mx": "Explora todas las {category} en GainUtility",
    "es-co": "Explora todas las {category} en GainUtility",
    de: "Alle {category} auf GainUtility ansehen",
    fr: "Parcourir tous les {category} sur GainUtility",
    it: "Sfoglia tutte le {category} su GainUtility",
  },
  "hub.h1Primary": {
    en: "Free Online {name}",
    "pt-br": "{name} online grátis",
    id: "{name} online gratis",
    "es-mx": "{name} en línea gratis",
    "es-co": "{name} en línea gratis",
    de: "Kostenloses {name} online",
    fr: "{name} en ligne gratuit",
    it: "{name} online gratuito",
  },
  "hub.h1Hub": {
    en: "{category} — Free Online Tools",
    "pt-br": "{category} online grátis",
    id: "{category} Online Gratis",
    "es-mx": "{category} en línea gratis",
    "es-co": "{category} en línea gratis",
    de: "{category} online kostenlos",
    fr: "{category} en ligne gratuits",
    it: "{category} gratuiti online",
  },
};

/** Look up a page string for a locale (falls back to English). */
export const pageText = (key: string, locale: string = DEFAULT_LOCALE): string =>
  PAGE[key]?.[locale as LocaleCode] ?? PAGE[key]?.en ?? key;

/* ------------------------------------------------------------------ */
/* Homepage FAQ — single source of truth for UI + JSON-LD              */
/* ------------------------------------------------------------------ */

export const HOME_FAQS: FaqEntry[] = [
  {
    question: "Do I need to upload my files?",
    answer:
      "For tools that run in your browser, no. Your file is processed on your device instead of being sent to a server. The tool will tell you if a particular feature works differently.",
  },
  {
    question: "Are GainUtility tools free?",
    answer:
      "Yes. The tools are free to use in your browser, and you don't need an account just to complete a simple task.",
  },
  {
    question: "What happens to my files?",
    answer:
      "Files you open in a browser-based tool are processed on your device, so there is no normal upload step. If a tool needs server-side processing, its interface will tell you.",
  },
  {
    question: "Can I use GainUtility on my phone?",
    answer:
      "Yes. The tools are designed to work in modern mobile and desktop browsers. For larger files, performance can depend on your phone or computer.",
  },
  {
    question: "Do I need an account?",
    answer: "No. You can use the tools without creating an account.",
  },
  {
    question: "Why can a tool be slower on my phone?",
    answer:
      "Some tools do the work directly on your device. Large PDFs, images or complex files can therefore take longer on a phone than on a desktop.",
  },
  {
    question: "Why didn't my file get smaller?",
    answer:
      "Some files are already compressed, so there may not be much room to reduce them further. Try another compression setting or format if the tool provides one.",
  },
];

const HOME_FAQS_PT_BR: FaqEntry[] = [
  {
    question: "Preciso enviar meus arquivos?",
    answer:
      "Para as ferramentas que funcionam no seu navegador, não. Seu arquivo é processado no seu dispositivo em vez de ser enviado a um servidor. A ferramenta informa se algum recurso específico funciona de forma diferente.",
  },
  {
    question: "As ferramentas da GainUtility são gratuitas?",
    answer:
      "Sim. As ferramentas são gratuitas para usar no navegador e você não precisa de uma conta apenas para realizar uma tarefa simples.",
  },
  {
    question: "O que acontece com meus arquivos?",
    answer:
      "Os arquivos que você abre em uma ferramenta baseada no navegador são processados no seu dispositivo, então não há etapa de upload. Se uma ferramenta precisar de processamento no servidor, a interface deve informar claramente.",
  },
  {
    question: "Posso usar a GainUtility no celular?",
    answer:
      "Sim. As ferramentas são projetadas para funcionar em navegadores móveis e de desktop modernos. Para arquivos maiores, o desempenho pode depender do seu celular ou computador.",
  },
  {
    question: "Preciso de uma conta?",
    answer: "Não. Você pode usar as ferramentas sem criar uma conta.",
  },
  {
    question: "Por que uma ferramenta pode ser mais lenta no meu celular?",
    answer:
      "Algumas ferramentas fazem o trabalho diretamente no seu dispositivo. PDFs grandes, imagens ou arquivos complexos podem, portanto, demorar mais em um celular do que em um desktop.",
  },
  {
    question: "Por que meu arquivo não ficou menor?",
    answer:
      "Alguns arquivos já são comprimidos, então pode não haver muito espaço para reduzi-los ainda mais. Tente outra configuração ou formato de compressão, se a ferramenta oferecer.",
  },
];

const HOME_FAQS_ID: FaqEntry[] = [
  {
    question: "Apakah saya perlu mengunggah file saya?",
    answer:
      "Untuk alat yang berjalan di browser Anda, tidak. File Anda diproses di perangkat Anda, bukan dikirim ke server. Alat akan memberi tahu jika fitur tertentu bekerja dengan cara berbeda.",
  },
  {
    question: "Apakah alat GainUtility gratis?",
    answer:
      "Ya. Alat-alat ini gratis digunakan di browser Anda, dan Anda tidak perlu akun untuk menyelesaikan satu tugas sederhana.",
  },
  {
    question: "Apa yang terjadi dengan file saya?",
    answer:
      "File yang Anda buka di alat berbasis browser diproses di perangkat Anda, jadi tidak ada langkah unggah. Jika alat membutuhkan pemrosesan di server, antarmukanya akan memberi tahu Anda dengan jelas.",
  },
  {
    question: "Bisakah saya menggunakan GainUtility di ponsel?",
    answer:
      "Ya. Alat-alat ini dirancang untuk bekerja di browser ponsel dan desktop modern. Untuk file yang lebih besar, kinerja bisa bergantung pada ponsel atau komputer Anda.",
  },
  {
    question: "Apakah saya perlu akun?",
    answer: "Tidak. Anda bisa menggunakan alat-alat ini tanpa membuat akun.",
  },
  {
    question: "Kenapa sebuah alat bisa lebih lambat di ponsel saya?",
    answer:
      "Beberapa alat mengerjakan semuanya langsung di perangkat Anda. File PDF besar, gambar, atau file kompleks bisa jadi membutuhkan waktu lebih lama di ponsel daripada di desktop.",
  },
  {
    question: "Kenapa file saya tidak mengecil?",
    answer:
      "Beberapa file sudah terkompresi, jadi mungkin tidak banyak ruang untuk memperkecilnya lebih jauh. Coba pengaturan atau format kompresi lain jika alat menyediakannya.",
  },
];

const HOME_FAQS_ES: FaqEntry[] = [
  {
    question: "¿Tengo que subir mis archivos?",
    answer:
      "Para las herramientas que funcionan en tu navegador, no. Tu archivo se procesa en tu dispositivo en lugar de enviarse a un servidor. La herramienta te dirá si una función concreta funciona de otra manera.",
  },
  {
    question: "¿Las herramientas de GainUtility son gratuitas?",
    answer:
      "Sí. Las herramientas son gratuitas en tu navegador y no necesitas una cuenta solo para realizar una tarea sencilla.",
  },
  {
    question: "¿Qué ocurre con mis archivos?",
    answer:
      "Los archivos que abres en una herramienta basada en el navegador se procesan en tu dispositivo, así que no hay un paso normal de subida. Si una herramienta necesita procesamiento en el servidor, su interfaz te lo indicará.",
  },
  {
    question: "¿Puedo usar GainUtility en mi teléfono?",
    answer:
      "Sí. Las herramientas están diseñadas para funcionar en navegadores móviles y de escritorio modernos. Con archivos más grandes, el rendimiento puede depender de tu teléfono o computadora.",
  },
  {
    question: "¿Necesito una cuenta?",
    answer: "No. Puedes usar las herramientas sin crear una cuenta.",
  },
  {
    question: "¿Por qué una herramienta puede ser más lenta en mi teléfono?",
    answer:
      "Algunas herramientas hacen el trabajo directamente en tu dispositivo. Los PDF grandes, las imágenes o los archivos complejos pueden tardar más en un teléfono que en una computadora.",
  },
  {
    question: "¿Por qué mi archivo no se hizo más pequeño?",
    answer:
      "Algunos archivos ya están comprimidos, así que puede que no haya mucho margen para reducirlos más. Prueba otra configuración o formato de compresión si la herramienta lo ofrece.",
  },
];

const HOME_FAQS_DE: FaqEntry[] = [
  {
    question: "Muss ich meine Dateien hochladen?",
    answer:
      "Nein, bei Tools, die in Ihrem Browser laufen. Ihre Datei wird auf Ihrem Gerät verarbeitet, statt an einen Server gesendet zu werden. Das Tool weist Sie darauf hin, wenn eine Funktion anders funktioniert.",
  },
  {
    question: "Sind die GainUtility-Tools kostenlos?",
    answer:
      "Ja. Die Tools sind kostenlos in Ihrem Browser nutzbar, und Sie brauchen für eine einfache Aufgabe kein Konto.",
  },
  {
    question: "Was passiert mit meinen Dateien?",
    answer:
      "Dateien, die Sie in einem browserbasierten Tool öffnen, werden auf Ihrem Gerät verarbeitet, sodass es keinen Upload-Schritt gibt. Wenn ein Tool eine serverseitige Verarbeitung benötigt, weist Sie dessen Oberfläche klar darauf hin.",
  },
  {
    question: "Kann ich GainUtility auf meinem Handy nutzen?",
    answer:
      "Ja. Die Tools sind für moderne Mobile- und Desktop-Browser ausgelegt. Bei größeren Dateien kann die Leistung von Ihrem Handy oder Computer abhängen.",
  },
  {
    question: "Brauche ich ein Konto?",
    answer: "Nein. Sie können die Tools ohne Konto nutzen.",
  },
  {
    question: "Warum kann ein Tool auf meinem Handy langsamer sein?",
    answer:
      "Einige Tools erledigen die Arbeit direkt auf Ihrem Gerät. Große PDFs, Bilder oder komplexe Dateien können auf einem Handy daher länger dauern als auf einem Desktop.",
  },
  {
    question: "Warum ist meine Datei nicht kleiner geworden?",
    answer:
      "Manche Dateien sind bereits komprimiert, sodass es kaum Spielraum gibt, sie weiter zu verkleinern. Probieren Sie eine andere Komprimierungseinstellung oder ein anderes Format, falls das Tool eine bietet.",
  },
];

const HOME_FAQS_FR: FaqEntry[] = [
  {
    question: "Dois-je envoyer mes fichiers ?",
    answer:
      "Non, pour les outils qui fonctionnent dans votre navigateur. Votre fichier est traité sur votre appareil au lieu d'être envoyé à un serveur. L'outil vous indiquera si une fonction particulière fonctionne différemment.",
  },
  {
    question: "Les outils GainUtility sont-ils gratuits ?",
    answer:
      "Oui. Les outils sont gratuits dans votre navigateur et vous n'avez pas besoin de compte pour une simple tâche.",
  },
  {
    question: "Que deviennent mes fichiers ?",
    answer:
      "Les fichiers que vous ouvrez dans un outil basé sur le navigateur sont traités sur votre appareil, il n'y a donc pas d'étape d'envoi. Si un outil nécessite un traitement côté serveur, son interface vous le dira.",
  },
  {
    question: "Puis-je utiliser GainUtility sur mon téléphone ?",
    answer:
      "Oui. Les outils sont conçus pour fonctionner dans les navigateurs mobiles et de bureau modernes. Pour les fichiers volumineux, les performances peuvent dépendre de votre téléphone ou de votre ordinateur.",
  },
  {
    question: "Ai-je besoin d'un compte ?",
    answer: "Non. Vous pouvez utiliser les outils sans créer de compte.",
  },
  {
    question: "Pourquoi un outil peut-il être plus lent sur mon téléphone ?",
    answer:
      "Certains outils travaillent directement sur votre appareil. Les PDF volumineux, les images ou les fichiers complexes peuvent donc prendre plus de temps sur un téléphone que sur un ordinateur.",
  },
  {
    question: "Pourquoi mon fichier n'a-t-il pas rétréci ?",
    answer:
      "Certains fichiers sont déjà compressés, il reste donc peut-être peu de marge. Essayez un autre réglage de compression ou un autre format si l'outil en propose.",
  },
];

const HOME_FAQS_IT: FaqEntry[] = [
  {
    question: "Devo caricare i miei file?",
    answer:
      "No, per gli strumenti che funzionano nel browser. Il tuo file viene elaborato sul tuo dispositivo invece di essere inviato a un server. Lo strumento ti dirà se una funzione specifica funziona in modo diverso.",
  },
  {
    question: "Gli strumenti GainUtility sono davvero gratuiti?",
    answer:
      "Sì. Gli strumenti sono gratuiti nel browser e non serve un account per svolgere una semplice attività.",
  },
  {
    question: "Cosa succede ai miei file?",
    answer:
      "I file che apri in uno strumento basato sul browser vengono elaborati sul tuo dispositivo, quindi non esiste un passaggio di caricamento. Se uno strumento richiede elaborazione lato server, la sua interfaccia te lo dirà chiaramente.",
  },
  {
    question: "Posso usare GainUtility sul mio telefono?",
    answer:
      "Sì. Gli strumenti sono progettati per funzionare nei browser mobili e desktop moderni. Per file più grandi, le prestazioni possono dipendere dal tuo telefono o computer.",
  },
  {
    question: "Mi serve un account?",
    answer: "No. Puoi usare gli strumenti senza creare un account.",
  },
  {
    question: "Perché uno strumento può essere più lento sul mio telefono?",
    answer:
      "Alcuni strumenti svolgono il lavoro direttamente sul tuo dispositivo. PDF di grandi dimensioni, immagini o file complessi possono quindi richiedere più tempo su un telefono che su un desktop.",
  },
  {
    question: "Perché il mio file non si è ridotto?",
    answer:
      "Alcuni file sono già compressi, quindi potrebbe esserci poco margine per ridurli ulteriormente. Prova un'altra impostazione o formato di compressione se lo strumento lo consente.",
  },
];

const HOME_FAQS_BY_LOCALE: Record<string, FaqEntry[]> = {
  "pt-br": HOME_FAQS_PT_BR,
  id: HOME_FAQS_ID,
  "es-mx": HOME_FAQS_ES,
  "es-co": HOME_FAQS_ES,
  de: HOME_FAQS_DE,
  fr: HOME_FAQS_FR,
  it: HOME_FAQS_IT,
};

/** Homepage FAQ for a given locale (English is the shared default). */
export const homeFaqs = (locale: string = DEFAULT_LOCALE): FaqEntry[] =>
  HOME_FAQS_BY_LOCALE[locale] ?? HOME_FAQS;

/** Localized label for a blog category (falls back to the English label). */
const BLOG_CATEGORY_KEY: Record<BlogCategory, string> = {
  PDF: "blog.sectionPdf",
  Images: "blog.categoryImages",
  SEO: "blog.sectionSeo",
  Developer: "blog.sectionDeveloper",
  Productivity: "blog.categoryProductivity",
};

export const blogCategoryLabel = (category: BlogCategory, locale: string = DEFAULT_LOCALE): string =>
  pageText(BLOG_CATEGORY_KEY[category] ?? category, locale);

/* ------------------------------------------------------------------ */
/* Localization gating                                                 */
/* ------------------------------------------------------------------ */

/**
 * True when a view has genuinely localized content for the given locale.
 *
 * English (`en`) is always genuine. Page content (home, about, services),
 * the blog listing, the localized article set and the category hub pages
 * (/pdf, /json, /image, /css, /dev, /seo) are localized per the
 * page-content model. Tool pages are genuinely localized only for the tools
 * whose interactive UI has a wired translation dict. Everything else that is
 * routed for every locale (non-wired tools, sub-pages, studio, translator
 * pairs, comparisons, category-best, color studio/pages, and the static
 * legal/contact pages) is English-authored and must not be claimed as
 * localized: its localized routes keep working but are gated out of
 * sitemap/hreflang (en-only), so crawlers never see a fake localized URL.
 */
export const isLocalizedView = (view: ViewState, locale: string = DEFAULT_LOCALE): boolean => {
  if (locale === DEFAULT_LOCALE) return true;
  switch (view.type) {
    case "home":
    case "about":
    case "blog":
      return true;
    case "blog-article":
      return LOCALIZED_ARTICLE_SLUGS.has(view.slug);
    case "tool": {
      // A tool is localized per-locale: it must be in LOCALIZED_TOOL_IDS and
      // have a translated display name for that locale (so e.g.
      // box-shadow-generator is never emitted for German, where it has no
      // localized name). On top of that, a tool that ships a wired UI
      // dictionary must actually carry the locale — a translated name alone
      // would advertise an English tool page such as
      // /de/tools/youtube-keyword-explorer.
      if (!LOCALIZED_TOOL_IDS.has(view.id)) return false;
      if (!TOOL_LOCALE_NAMES[view.id as ToolId]?.[locale as LocaleCode]) return false;
      const wired = toolUiLocaleWired(view.id, locale);
      return wired === null ? true : wired;
    }
    case "seo-page":
      return LOCALIZED_HUB_SLUGS.has(view.id);
    case "faq":
    case "privacy":
    case "terms":
    case "security":
    case "cookies":
    case "contact":
    case "notFound":
      return true;
    case "audit":
    case "studio":
    case "translator-pair":
    case "comparison-page":
    case "category-best":
    case "color-studio":
    case "color-page":
      return false;
    default:
      return false;
  }
};

/** Blog article slugs that have real localized content. */
export const LOCALIZED_ARTICLE_SLUGS: ReadonlySet<string> = new Set([
  "how-to-remove-background-from-an-image",
  "how-to-make-a-transparent-png",
  "how-to-compress-an-image",
  "how-to-resize-an-image",
  "background-remover-for-product-photos",
  "how-to-merge-pdf-files",
  "how-to-split-a-pdf",
  "how-to-convert-pdf-to-jpg",
  "how-to-convert-jpg-to-pdf",
  "how-to-compress-a-pdf",
  "how-to-add-a-watermark-to-a-pdf",
  "fix-pdf-too-big-to-upload",
  "box-shadow-values-real-websites",
  "box-shadow-vs-drop-shadow-filter",
  "soft-shadow-css-recipes",
  "neumorphism-box-shadow-guide",
  "format-and-debug-json-when-api-responses-are-unreadable",
  "how-to-make-a-qr-code",
  "clean-up-css-gradients-and-borders-in-design-work",
  "write-seo-title-and-meta-description-in-twenty-minutes",
  "why-i-started-building-small-browser-tools",
]);

/** Tool ids whose interactive tool UI is genuinely localized (wired dicts). */
export const LOCALIZED_TOOL_IDS: ReadonlySet<string> = new Set([
  "merge-pdf",
  "split-pdf",
  "json-beautifier",
  "contrast-checker",
  "slug-generator",
  "password-generator",
  "youtube-thumbnail-preview",
  "image-converter",
  "base64-tool",
  "box-shadow-generator",
  "youtube-keyword-explorer",
  "stylish-name-generator",
  "linkedin-carousel-maker",
  "font-detector",
  "favicon-generator",
  "logo-maker",
  "image-resizer",
  "image-cropper",
  "qr-code-generator",
  "gradient-generator",
  "border-radius-generator",
]);

/** SEO hub slugs with genuinely localized content for every locale. */
export const LOCALIZED_HUB_SLUGS: ReadonlySet<string> = new Set([
  "pdf",
  "json",
  "image",
  "css",
  "dev",
  "seo",
]);
