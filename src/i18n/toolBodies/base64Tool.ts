/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlay for base64-tool (6 locales, 6 FAQs —
 * base entry only, no EXTRA_FAQS boost). Source: src/data.ts "base64-tool".
 */

import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";

export const overlay: Partial<Record<LocaleCode, ToolBodyOverlay>> = {
  "pt-br": {
    desc: "Codifique texto em Base64 ou decodifique de volta, com suporte completo a UTF-8 e Unicode.",
    whatText:
      "Um conversor seguro para dados binários, com codificadores e decodificadores em dois modos, strings UTF-8 e atualizações reativas ao vivo para fluxos de trabalho de desenvolvimento local.",
    whyText:
      "Muitos serviços online corrompem caracteres internacionais ou emojis. Esta ferramenta roda 100% localmente para proteger suas variáveis, chaves de API e configurações.",
    features: [
      "Codificação e decodificação totalmente seguras em UTF-8, prevenindo degradação de caracteres",
      "Reconhecimento automático de strings Base64 com alternador de modo auxiliar",
      "Carregadores de arquivos sob medida com suporte a arrastar e soltar",
      "Downloads diretos de backups em arquivos de texto formatados",
      "Estrutura de cartões lado a lado com atualizações reativas instantâneas",
    ],
    steps: [
      "Selecione o Modo Codificador ou o Modo Decodificador na aba de segmentos.",
      "Escreva, cole ou arraste um arquivo de texto para dentro do cartão de entrada.",
      "Acompanhe as contagens ao vivo de caracteres e bytes para monitorar os dados.",
      "Copie instantaneamente a string convertida do painel oposto.",
      "Ou baixe a saída diretamente como um arquivo de texto limpo.",
    ],
    examples: [
      {
        title: "Codificação UTF-8 padrão",
        desc: "Texto original com acentos e emojis.",
        code: "Hello, World! 🌐 Café #1",
      },
      {
        title: "Conversão segura em Base64",
        desc: "Fluxo Base64 compilado e pronto para transporte por URL.",
        code: "SGVsbG8sIFdvcmxkISDwn4yOIENhZsOpICMx",
      },
    ],
    mistakes: [
      "Tratar Base64 como criptografia (é apenas um formato de codificação para transporte seguro; nunca armazene dados sensíveis em Base64 sem chaves AES padrão).",
      "Colar caracteres que não são Base64 no Modo Decodificador (causa falhas de análise estrutural; use nossos avisos claros para corrigir).",
    ],
    privacyExplanation:
      "Todo o parsing, as conversões e a renderização acontecem na memória local do seu navegador. Esta ferramenta não envia seus arquivos para os servidores da GainUtility; qualquer processamento externo é divulgado na própria ferramenta.",
    faqs: [
      {
        question: "Esta ferramenta suporta conjuntos de caracteres de emoji?",
        answer:
          "Sim. Nossa implementação usa as rotinas padrão TextEncoder e TextDecoder para converter strings Unicode em fluxos de bytes UTF-8 antes da codificação Base64, evitando texto ilegível na decodificação.",
      },
      {
        question: "Como funciona o sistema de detecção automática de Base64?",
        answer:
          "Enquanto você escreve, o mecanismo verifica se a entrada está alinhada em blocos de 4 caracteres e contém apenas caracteres Base64 válidos. Se corresponder, oferecemos a troca automática de modo.",
      },
      {
        question: "Posso usar Base64 como uma forma segura de criptografar senhas sensíveis?",
        answer:
          "Absolutamente não. Base64 é estritamente um formato de codificação para transporte seguro de dados, não criptografia. Qualquer pessoa pode decodificá-lo. Nunca armazene senhas em Base64 sem chaves AES padrão.",
      },
      {
        question: "Por que recebo erros de formatação ou decodificação ao colar fluxos brutos?",
        answer:
          "Colar caracteres que não são base64, caracteres de preenchimento finais incorretos (=) ou formatos binários brutos causa falhas no decodificador padrão. Verifique se sua entrada é uma string Base64 limpa.",
      },
      {
        question: "Para que serve o caractere de preenchimento '=' no Base64?",
        answer:
          "O Base64 codifica dados em grupos de 4 caracteres. Quando os dados de entrada não se dividem perfeitamente, sinais de igual (=) são adicionados ao final da string codificada como preenchimento estrutural.",
      },
      {
        question: "Existe algum risco de vazamento das minhas chaves ou credenciais?",
        answer:
          "Sua entrada nunca chega a um servidor — toda a conversão roda no sandbox local do seu navegador, então não há cópia do lado do servidor que possa vazar. Como em qualquer página da web, evite colar segredos reais em máquinas compartilhadas ou públicas.",
      },
    ],
  },
  id: {
    desc: "Kodekan teks ke Base64 atau uraikan kembali, dengan dukungan penuh UTF-8 dan Unicode.",
    whatText:
      "Konverter yang aman terhadap biner dengan pengode dan pengurai mode ganda, string UTF-8, dan pembaruan reaktif langsung untuk alur kerja pengembangan lokal.",
    whyText:
      "Banyak layanan online merusak karakter internasional atau emoji. Alat ini berjalan 100% secara lokal untuk melindungi variabel, API key, dan konfigurasi Anda.",
    features: [
      "Pengodean dan penguraian UTF-8 yang sepenuhnya aman untuk mencegah degradasi karakter",
      "Pengenalan string Base64 otomatis dengan pengalih mode pembantu",
      "Pemuat file khusus yang mendukung seret dan lepas",
      "Cadangan unduhan langsung untuk berkas teks yang sudah diformat",
      "Struktur kartu berdampingan dengan pembaruan reaktif seketika",
    ],
    steps: [
      "Pilih Mode Pengode atau Mode Pengurai dari tab segmen.",
      "Tulis, tempel, atau jatuhkan berkas teks ke kartu input.",
      "Pantau jumlah karakter dan byte secara langsung untuk melacak muatan.",
      "Salin seketika string yang dikonversi dari panel berseberangan.",
      "Atau unduh hasilnya langsung sebagai berkas teks yang bersih.",
    ],
    examples: [
      {
        title: "Pengodean UTF-8 standar",
        desc: "Teks asli yang berisi aksen dan emoji.",
        code: "Hello, World! 🌐 Café #1",
      },
      {
        title: "Konversi aman Base64",
        desc: "Aliran base64 terkompilasi siap untuk transportasi URL.",
        code: "SGVsbG8sIFdvcmxkISDwn4yOIENhZsOpICMx",
      },
    ],
    mistakes: [
      "Memperlakukan Base64 sebagai enkripsi (hanya format pengodean untuk transportasi aman; jangan pernah menyimpan data sensitif dalam Base64 tanpa kunci AES standar).",
      "Menempelkan karakter non-base64 di Mode Pengurai (menyebabkan kegagalan parsing struktural; gunakan peringatan jelas kami untuk memperbaikinya).",
    ],
    privacyExplanation:
      "Semua parsing, konversi, dan rendering berjalan di memori lokal browser Anda. Alat ini tidak mengirimkan file Anda ke server GainUtility; pemrosesan eksternal apa pun diungkapkan di dalam alat itu sendiri.",
    faqs: [
      {
        question: "Apakah alat ini mendukung set karakter emoji?",
        answer:
          "Ya. Implementasi kami menggunakan rutinitas standar TextEncoder dan TextDecoder untuk mengonversi string Unicode ke aliran byte UTF-8 sebelum pengodean Base64, mencegah teks acak saat penguraian.",
      },
      {
        question: "Bagaimana sistem deteksi otomatis Base64 bekerja?",
        answer:
          "Saat Anda menulis, mesin memeriksa apakah input selaras dengan blok 4 karakter dan hanya berisi karakter Base64 yang valid. Jika cocok, kami menawarkan peralihan mode secara otomatis.",
      },
      {
        question: "Bisakah saya menggunakan Base64 sebagai cara aman mengenkripsi kata sandi sensitif?",
        answer:
          "Sama sekali tidak. Base64 sepenuhnya merupakan format pengodean untuk transportasi data yang aman, bukan enkripsi. Siapa pun dapat menguraikannya. Jangan pernah menyimpan kata sandi dalam Base64 tanpa kunci AES standar.",
      },
      {
        question: "Mengapa saya mendapat kesalahan formatisasi atau penguraian saat menempelkan aliran mentah?",
        answer:
          "Menempelkan karakter non-base64, karakter padding ekor yang salah (=), atau format biner mentah menyebabkan dekoder standar gagal. Pastikan input Anda adalah string Base64 yang bersih.",
      },
      {
        question: "Untuk apa karakter padding '=' digunakan dalam Base64?",
        answer:
          "Base64 mengodekan data dalam kelompok 4 karakter. Ketika data input tidak terbagi dengan sempurna, tanda sama dengan (=) ditambahkan di akhir string terkode sebagai padding struktural.",
      },
      {
        question: "Apakah ada risiko kunci atau kredensial saya bocor?",
        answer:
          "Input Anda tidak pernah sampai ke server — setiap konversi berjalan di dalam sandbox lokal browser Anda, sehingga tidak ada salinan server-side yang bisa bocor. Seperti halnya halaman web mana pun, hindari menempelkan rahasia sungguhan pada mesin bersama atau publik.",
      },
    ],
  },
  "es-mx": {
    desc: "Codifica texto a Base64 o decodifícalo de vuelta, con soporte completo de UTF-8 y Unicode.",
    whatText:
      "Un conversor seguro para binarios con codificadores y decodificadores de doble modo, cadenas UTF-8 y actualizaciones reactivas en vivo para flujos de trabajo de desarrollo local.",
    whyText:
      "Muchos servicios en línea descuadran caracteres internacionales o emojis. Esta herramienta funciona 100% localmente para proteger tus variables, claves API y configuraciones.",
    features: [
      "Codificación y decodificación UTF-8 totalmente seguras que evitan la degradación de caracteres",
      "Reconocimiento automático de cadenas Base64 con cambiador de modo auxiliar",
      "Cargadores de archivos a medida con soporte de arrastrar y soltar",
      "Descargas directas de respaldos de archivos de texto con formato",
      "Estructura de tarjetas lado a lado con actualizaciones reactivas instantáneas",
    ],
    steps: [
      "Selecciona el Modo Codificador o el Modo Decodificador en la pestaña de segmentos.",
      "Escribe, pega o suelta un archivo de texto en la tarjeta de entrada.",
      "Monitorea los contadores en vivo de caracteres y bytes para hacer seguimiento de las cargas.",
      "Copia al instante la cadena convertida desde el panel opuesto.",
      "O descarga la salida directamente como un archivo de texto limpio.",
    ],
    examples: [
      {
        title: "Codificación UTF-8 estándar",
        desc: "Texto original con acentos y emojis.",
        code: "Hello, World! 🌐 Café #1",
      },
      {
        title: "Conversión segura a Base64",
        desc: "Flujo base64 compilado listo para transporte por URL.",
        code: "SGVsbG8sIFdvcmxkISDwn4yOIENhZsOpICMx",
      },
    ],
    mistakes: [
      "Tratar Base64 como cifrado (solo es un formato de codificación para transporte seguro; nunca almacenes datos sensibles en Base64 sin claves AES estándar).",
      "Pegar caracteres que no son base64 en el Modo Decodificador (provoca fallos de análisis estructural; usa nuestras advertencias claras para corregirlo).",
    ],
    privacyExplanation:
      "Todo el parsing, las conversiones y el renderizado ocurren en la memoria local de tu navegador. Esta herramienta no envía tus archivos a los servidores de GainUtility; cualquier procesamiento externo se divulga en la propia herramienta.",
    faqs: [
      {
        question: "¿Esta herramienta admite conjuntos de caracteres de emoji?",
        answer:
          "Sí. Nuestra implementación usa las rutinas estándar TextEncoder y TextDecoder para convertir cadenas Unicode en flujos de bytes UTF-8 antes de la codificación Base64, evitando texto ilegible al decodificar.",
      },
      {
        question: "¿Cómo funciona el sistema de detección automática de Base64?",
        answer:
          "Mientras escribes, el motor verifica si la entrada está alineada en bloques de 4 caracteres y contiene solo caracteres Base64 válidos. Si coincide, ofrecemos cambiar de modo automáticamente.",
      },
      {
        question: "¿Puedo usar Base64 como una forma segura de cifrar contraseñas sensibles?",
        answer:
          "Absolutamente no. Base64 es estrictamente un formato de codificación para transporte seguro de datos, no cifrado. Cualquiera puede decodificarlo. Nunca almacenes contraseñas en Base64 sin claves AES estándar.",
      },
      {
        question: "¿Por qué obtengo errores de formato o decodificación al pegar flujos sin procesar?",
        answer:
          "Pegar caracteres que no son base64, caracteres de relleno final incorrectos (=) o formatos binarios sin procesar provoca fallos del decodificador estándar. Asegúrate de que tu entrada sea una cadena Base64 limpia.",
      },
      {
        question: "¿Para qué se usa el carácter de relleno '=' en Base64?",
        answer:
          "Base64 codifica datos en grupos de 4 caracteres. Cuando los datos de entrada no se dividen perfectamente, se agregan signos iguales (=) al final de la cadena codificada como relleno estructural.",
      },
      {
        question: "¿Existe algún riesgo de que mis claves o credenciales se filtren?",
        answer:
          "Tu entrada nunca llega a un servidor: cada conversión se ejecuta en el sandbox local de tu navegador, así que no existe copia del lado del servidor que pueda filtrarse. Como en cualquier página web, evita pegar secretos reales en máquinas compartidas o públicas.",
      },
    ],
  },
  de: {
    desc: "Text in Base64 kodieren oder wieder dekodieren, mit voller UTF-8- und Unicode-Unterstützung.",
    whatText:
      "Ein binärsicherer Konverter mit Kodierern und Dekodern im Zweimodus-Design, UTF-8-Zeichenfolgen und live reaktiven Updates für lokale Entwicklungsroutinen.",
    whyText:
      "Viele Online-Dienste verfälschen internationale Zeichen oder Emojis. Dieses Tool läuft zu 100 % lokal, um Ihre Variablen, API-Schlüssel und Konfigurationen zu schützen.",
    features: [
      "Vollständig UTF-8-sicheres Kodieren und Dekodieren ohne Zeichenverschlechterung",
      "Automatische Erkennung von Base64-Zeichenfolgen mit hilfreichem Modusumschalter",
      "Individuelle Dateilader mit Drag-and-drop-Unterstützung",
      "Direkte Download-Sicherungen formatierter Textdateien",
      "Nebeneinander-Anordnung der Karten mit sofortigen Live-Updates",
    ],
    steps: [
      "Wählen Sie im Segmenttab den Kodierermodus oder den Dekodierermodus.",
      "Schreiben Sie Text, fügen Sie ihn ein oder ziehen Sie eine Textdatei in die Eingabekarte.",
      "Beobachten Sie die Live-Zähler für Zeichen und Bytes, um Ihre Daten im Blick zu behalten.",
      "Kopieren Sie die konvertierte Zeichenfolge sofort aus dem gegenüberliegenden Panel.",
      "Oder laden Sie die Ausgabe direkt als saubere Textdatei herunter.",
    ],
    examples: [
      {
        title: "Standard UTF-8-Kodierung",
        desc: "Originaltext mit Akzenten und Emojis.",
        code: "Hello, World! 🌐 Café #1",
      },
      {
        title: "Sichere Base64-Konvertierung",
        desc: "Kompilierter Base64-Stream, bereit für den Transport über URLs.",
        code: "SGVsbG8sIFdvcmxkISDwn4yOIENhZsOpICMx",
      },
    ],
    mistakes: [
      "Base64 als Verschlüsselung behandeln (es ist nur ein Kodierformat für den sicheren Transport; speichern Sie niemals sensible Daten in Base64 ohne Standard-AES-Schlüssel).",
      "Nicht-Base64-Zeichen im Dekodierermodus einfügen (führt zu Parsing-Crashs; beheben Sie das mit unseren klaren Warnhinweisen).",
    ],
    privacyExplanation:
      "Sämtliches Parsen, Konvertieren und Rendern läuft im lokalen Arbeitsspeicher Ihres Browsers. Dieses Tool sendet Ihre Dateien nicht an die Server von GainUtility; externe Verarbeitung wird im Tool selbst offengelegt.",
    faqs: [
      {
        question: "Unterstützt dieses Tool Emoji-Zeichensätze?",
        answer:
          "Ja. Unsere Implementierung nutzt die Standard-Routinen TextEncoder und TextDecoder, um Unicode-Zeichenfolgen vor der Base64-Kodierung in UTF-8-Byteströme zu wandeln, damit beim Dekodieren kein Kauderwelsch entsteht.",
      },
      {
        question: "Wie funktioniert das Base64-Erkennungssystem?",
        answer:
          "Während Sie schreiben, prüft die Engine, ob die Eingabe auf 4-Zeichen-Blöcke ausgerichtet ist und nur gültige Base64-Zeichen enthält. Stimmt das überein, bieten wir den automatischen Moduswechsel an.",
      },
      {
        question: "Kann ich Base64 als sichere Methode zur Verschlüsselung sensibler Passwörter verwenden?",
        answer:
          "Ausdrücklich nicht. Base64 ist strikt ein Kodierformat für den sicheren Datentransport, keine Verschlüsselung. Jeder kann es dekodieren. Speichern Sie Passwörter niemals in Base64 ohne Standard-AES-Schlüssel.",
      },
      {
        question: "Warum erhalte ich Formatierungs- oder Dekodierfehler beim Einfügen roher Ströme?",
        answer:
          "Das Einfügen nicht-Base64-Zeichen, falscher abschließender Padding-Zeichen (=) oder roher Binärformate lässt den Standard-Dekoder abstürzen. Stellen Sie sicher, dass Ihre Eingabe eine saubere Base64-Zeichenfolge ist.",
      },
      {
        question: "Wofür wird das Padding-Zeichen '=' in Base64 verwendet?",
        answer:
          "Base64 kodiert Daten in Gruppen zu 4 Zeichen. Wenn sich die Eingabedaten nicht exakt teilen lassen, werden Gleichheitszeichen (=) als strukturelles Padding ans Ende der kodierten Zeichenfolge angehängt.",
      },
      {
        question: "Besteht das Risiko, dass meine Schlüssel oder Zugangsdaten verraten werden?",
        answer:
          "Ihre Eingabe erreicht nie einen Server — jede Konversion läuft in der lokalen Sandbox Ihres Browsers, es gibt also keine serverseitige Kopie, die verraten werden könnte. Wie auf jeder Webseite: vermeiden Sie es, echte Geheimnisse auf geteilten oder öffentlichen Geräten einzufügen.",
      },
    ],
  },
  fr: {
    desc: "Encodez du texte en Base64 ou décodez-le à nouveau, avec une prise en charge complète d'UTF-8 et d'Unicode.",
    whatText:
      "Un convertisseur binaire sûr avec encodeurs et décodeurs à double mode, des chaînes UTF-8 et des mises à jour réactives en temps réel pour les flux de travail de développement local.",
    whyText:
      "De nombreux services en ligne corrompent les caractères internationaux ou les emojis. Cet outil fonctionne à 100 % en local pour protéger vos variables, clés API et configurations.",
    features: [
      "Encodage et décodage UTF-8 totalement sûrs, empêchant la dégradation des caractères",
      "Reconnaissance automatique des chaînes Base64 avec sélecteur de mode assisté",
      "Chargeurs de fichiers sur mesure avec glisser-déposer",
      "Sauvegardes en téléchargement direct des fichiers texte formatés",
      "Structure de cartes côte à côte avec mises à jour réactives instantanées",
    ],
    steps: [
      "Sélectionnez le Mode encodeur ou le Mode décodeur dans l'onglet segmenté.",
      "Écrivez, collez ou déposez un fichier texte dans la carte d'entrée.",
      "Surveillez les compteurs de caractères et d'octets en temps réel pour suivre vos charges.",
      "Copiez instantanément la chaîne convertie depuis le panneau opposé.",
      "Ou téléchargez directement la sortie comme fichier texte propre.",
    ],
    examples: [
      {
        title: "Encodage UTF-8 standard",
        desc: "Texte original contenant des accents et des emojis.",
        code: "Hello, World! 🌐 Café #1",
      },
      {
        title: "Conversion sûre en Base64",
        desc: "Flux base64 compilé prêt pour le transport par URL.",
        code: "SGVsbG8sIFdvcmxkISDwn4yOIENhZsOpICMx",
      },
    ],
    mistakes: [
      "Traiter Base64 comme un chiffrement (ce n'est qu'un format d'encodage pour un transport sûr ; ne stockez jamais de données sensibles en Base64 sans clés AES standard).",
      "Coller des caractères non-base64 en Mode décodeur (provoque des plantages d'analyse structurelle ; utilisez nos avertissements clairs pour corriger).",
    ],
    privacyExplanation:
      "Toutes les analyses, conversions et rendus s'exécutent dans la mémoire locale de votre navigateur. Cet outil n'envoie jamais vos fichiers vers les serveurs de GainUtility ; tout traitement externe est indiqué dans l'outil lui-même.",
    faqs: [
      {
        question: "Cet outil prend-il en charge les jeux de caractères d'emoji ?",
        answer:
          "Oui. Notre implémentation utilise les routines standard TextEncoder et TextDecoder pour convertir les chaînes Unicode en flux d'octets UTF-8 avant l'encodage Base64, évitant ainsi un texte illisible au décodage.",
      },
      {
        question: "Comment fonctionne le système de détection automatique de Base64 ?",
        answer:
          "Au fil de votre saisie, le moteur vérifie si l'entrée est alignée sur des blocs de 4 caractères et ne contient que des caractères Base64 valides. En cas de correspondance, nous proposons un changement de mode automatique.",
      },
      {
        question: "Puis-je utiliser Base64 comme moyen sécurisé de chiffrer des mots de passe sensibles ?",
        answer:
          "Absolument pas. Base64 est strictement un format d'encodage pour le transport sûr des données, pas un chiffrement. N'importe qui peut le déchiffrer. Ne stockez jamais de mots de passe en Base64 sans clés AES standard.",
      },
      {
        question: "Pourquoi j'obtiens des erreurs de formatage ou de décodage en collant des flux bruts ?",
        answer:
          "Coller des caractères non-base64, des caractères de remplissage finaux incorrects (=) ou des formats binaires bruts fait planter le décodeur standard. Assurez-vous que votre entrée est une chaîne Base64 propre.",
      },
      {
        question: "À quoi sert le caractère de remplissage '=' dans Base64 ?",
        answer:
          "Base64 encode les données par groupes de 4 caractères. Lorsque les données d'entrée ne se divisent pas exactement, des signes égaux (=) sont ajoutés à la fin de la chaîne encodée comme remplissage structurel.",
      },
      {
        question: "Existe-t-il un risque que mes clés ou identifiants fuient ?",
        answer:
          "Votre entrée n'atteint jamais un serveur — chaque conversion s'exécute dans le sandbox local de votre navigateur, il n'y a donc aucune copie côté serveur qui pourrait fuir. Comme sur n'importe quelle page web, évitez de coller des secrets réels sur des machines partagées ou publiques.",
      },
    ],
  },
  it: {
    desc: "Codifica il testo in Base64 o decodificalo di nuovo, con supporto completo a UTF-8 e Unicode.",
    whatText:
      "Un convertitore sicuro per dati binari con codificatori e decodificatori a doppia modalità, stringhe UTF-8 e aggiornamenti reattivi in tempo reale per i flussi di lavoro di sviluppo locale.",
    whyText:
      "Molti servizi online rovinano i caratteri internazionali o le emoji. Questo strumento funziona al 100% in locale per proteggere le tue variabili, le chiavi API e le configurazioni.",
    features: [
      "Codifica e decodifica UTF-8 completamente sicure che impediscono la degradazione dei caratteri",
      "Riconoscimento automatico delle stringhe Base64 con selettore di modalità assistito",
      "Caricatori di file su misura con supporto al trascinamento",
      "Backup in download diretto di file di testo formattati",
      "Struttura di schede affiancate con aggiornamenti reattivi istantanei",
    ],
    steps: [
      "Seleziona Modalità codifica o Modalità decodifica dalla linguetta a segmenti.",
      "Scrivi, incolla o trascina un file di testo nella scheda di input.",
      "Monitora i contatori in tempo reale di caratteri e byte per tenere traccia dei dati.",
      "Copia istantaneamente la stringa convertita dal pannello opposto.",
      "Oppure scarica l'output direttamente come file di testo pulito.",
    ],
    examples: [
      {
        title: "Codifica UTF-8 standard",
        desc: "Testo originale con accenti ed emoji.",
        code: "Hello, World! 🌐 Café #1",
      },
      {
        title: "Conversione sicura Base64",
        desc: "Flusso base64 compilato pronto per il trasporto via URL.",
        code: "SGVsbG8sIFdvcmxkISDwn4yOIENhZsOpICMx",
      },
    ],
    mistakes: [
      "Trattare Base64 come crittografia (è solo un formato di codifica per il trasporto sicuro; non memorizzare mai dati sensibili in Base64 senza chiavi AES standard).",
      "Incollare caratteri non-base64 in Modalità decodifica (causa errori di parsing strutturale; usa i nostri avvisi chiari per correggere).",
    ],
    privacyExplanation:
      "Tutte le analisi, le conversioni e il rendering avvengono nella memoria locale del tuo browser. Questo strumento non invia i tuoi file ai server di GainUtility; qualsiasi elaborazione esterna è indicata nello strumento stesso.",
    faqs: [
      {
        question: "Questo strumento supporta i set di caratteri emoji?",
        answer:
          "Sì. La nostra implementazione usa le routine standard TextEncoder e TextDecoder per convertire le stringhe Unicode in flussi di byte UTF-8 prima della codifica Base64, impedendo testi incomprensibili alla decodifica.",
      },
      {
        question: "Come funziona il sistema di rilevamento automatico di Base64?",
        answer:
          "Mentre scrivi, il motore verifica che l'input sia allineato a blocchi di 4 caratteri e contenga solo caratteri Base64 validi. Se corrisponde, proponiamo il cambio di modalità automatico.",
      },
      {
        question: "Posso usare Base64 come sistema sicuro per crittografare password sensibili?",
        answer:
          "Assolutamente no. Base64 è unicamente un formato di codifica per il trasporto sicuro dei dati, non una crittografia. Chiunque può decodificarlo. Non memorizzare mai password in Base64 senza chiavi AES standard.",
      },
      {
        question: "Perché ricevo errori di formattazione o decodifica quando incollo flussi grezzi?",
        answer:
          "Incollare caratteri non-base64, caratteri di padding finali errati (=) o formati binari grezzi provoca il crash del decodificatore standard. Assicurati che il tuo input sia una stringa Base64 pulita.",
      },
      {
        question: "A cosa serve il carattere di padding '=' in Base64?",
        answer:
          "Base64 codifica i dati in gruppi di 4 caratteri. Quando i dati di input non si dividono in modo perfetto, i segni di uguale (=) vengono aggiunti alla fine della stringa codificata come padding strutturale.",
      },
      {
        question: "C'è il rischio che le mie chiavi o credenziali vadano in mano a terzi?",
        answer:
          "Il tuo input non raggiunge mai un server — ogni conversione avviene nella sandbox locale del tuo browser, quindi non esiste alcuna copia lato server che possa essere compromessa. Come su qualsiasi pagina web, evita di incollare segreti reali su macchine condivise o pubbliche.",
      },
    ],
  },
};
