/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Single source of truth for GainUtility FAQ.
 * Powers the dedicated /faq page, homepage FAQ section, and FAQPage JSON-LD schema.
 * All questions and answers are genuinely localized across all 8 supported locales.
 */

import { LocaleCode } from "./slugs";
import { DEFAULT_LOCALE } from "./locales";

export interface FaqItemLocalized {
  id: string;
  category: "general" | "privacy" | "pdf" | "images" | "developer" | "mobile";
  question: Record<LocaleCode, string>;
  answer: Record<LocaleCode, string>;
}

export const FAQ_CATEGORIES: { id: FaqItemLocalized["category"]; label: Record<LocaleCode, string> }[] = [
  {
    id: "general",
    label: {
      en: "General",
      "pt-br": "Geral",
      id: "Umum",
      "es-mx": "General",
      "es-co": "General",
      de: "Allgemein",
      fr: "Général",
      it: "Generale",
    },
  },
  {
    id: "privacy",
    label: {
      en: "Privacy & Files",
      "pt-br": "Privacidade e Arquivos",
      id: "Privasi & File",
      "es-mx": "Privacidad y Archivos",
      "es-co": "Privacidad y Archivos",
      de: "Datenschutz & Dateien",
      fr: "Confidentialité & Fichiers",
      it: "Privacy e File",
    },
  },
  {
    id: "pdf",
    label: {
      en: "PDF & Documents",
      "pt-br": "PDF e Documentos",
      id: "PDF & Dokumen",
      "es-mx": "PDF y Documentos",
      "es-co": "PDF y Documentos",
      de: "PDF & Dokumente",
      fr: "PDF & Documents",
      it: "PDF e Documenti",
    },
  },
  {
    id: "images",
    label: {
      en: "Images & Design",
      "pt-br": "Imagens e Design",
      id: "Gambar & Desain",
      "es-mx": "Imágenes y Diseño",
      "es-co": "Imágenes y Diseño",
      de: "Bilder & Design",
      fr: "Images & Design",
      it: "Immagini e Design",
    },
  },
  {
    id: "developer",
    label: {
      en: "Developer Tools",
      "pt-br": "Ferramentas para Desenvolvedores",
      id: "Alat Pengembang",
      "es-mx": "Herramientas de Desarrollador",
      "es-co": "Herramientas de Desarrollador",
      de: "Entwickler-Tools",
      fr: "Outils Développeur",
      it: "Strumenti per Sviluppatori",
    },
  },
  {
    id: "mobile",
    label: {
      en: "Mobile & Performance",
      "pt-br": "Dispositivos Móveis e Desempenho",
      id: "Seluler & Performa",
      "es-mx": "Móviles y Rendimiento",
      "es-co": "Móviles y Rendimiento",
      de: "Mobilgeräte & Leistung",
      fr: "Mobile & Performances",
      it: "Dispositivi Mobili e Prestazioni",
    },
  },
];

export const FAQ_ITEMS: FaqItemLocalized[] = [
  // 1. General
  {
    id: "is-it-free",
    category: "general",
    question: {
      en: "Are GainUtility tools really free to use?",
      "pt-br": "As ferramentas da GainUtility são realmente gratuitas?",
      id: "Apakah alat GainUtility benar-benar gratis digunakan?",
      "es-mx": "¿Las herramientas de GainUtility son realmente gratuitas?",
      "es-co": "¿Las herramientas de GainUtility son realmente gratuitas?",
      de: "Sind die Tools auf GainUtility wirklich kostenlos?",
      fr: "Les outils GainUtility sont-ils réellement gratuits ?",
      it: "Gli strumenti di GainUtility sono davvero gratuiti?",
    },
    answer: {
      en: "Yes. All utility tools on GainUtility are 100% free with no hidden fees, paywalls, or feature lockouts. You can format JSON, merge PDFs, crop images, and convert files without entering credit card details.",
      "pt-br": "Sim. Todas as ferramentas da GainUtility são 100% gratuitas, sem taxas ocultas, assinaturas ou limites de recursos. Você pode formatar JSON, juntar PDFs, cortar imagens e converter arquivos sem fornecer dados de pagamento.",
      id: "Ya. Semua alat di GainUtility 100% gratis tanpa biaya tersembunyi, sistem langganan, atau batasan fitur. Anda dapat memformat JSON, menggabungkan PDF, memotong gambar, dan mengonversi file tanpa kartu kredit.",
      "es-mx": "Sí. Todas las herramientas de GainUtility son 100% gratuitas, sin costos ocultos, muros de pago ni funciones bloqueadas. Puedes formatear JSON, unir PDFs, recortar imágenes y convertir archivos sin ingresar tarjetas de crédito.",
      "es-co": "Sí. Todas las herramientas de GainUtility son 100% gratuitas, sin costos ocultos, muros de pago ni funciones bloqueadas. Puedes formatear JSON, unir PDFs, recortar imágenes y convertir archivos sin ingresar tarjetas de crédito.",
      de: "Ja. Alle Dienstprogramme auf GainUtility sind zu 100 % kostenlos, ohne versteckte Kosten, Abomodelle oder künstliche Funktionssperren. Sie können JSON formatieren, PDFs zusammenfügen oder Bilder zuschneiden, ohne Zahlungsdaten anzugeben.",
      fr: "Oui. Tous les utilitaires GainUtility sont 100 % gratuits, sans frais cachés, abonnements ni limitations artificielles. Vous pouvez formater du JSON, fusionner des PDF, recadrer des images et convertir des fichiers sans renseigner de carte bancaire.",
      it: "Sì. Tutti gli strumenti su GainUtility sono gratuiti al 100%, senza costi nascosti, abbonamenti o funzionalità bloccate. Puoi formattare JSON, unire PDF, ritagliare immagini e convertire file senza fornire alcuna carta di credito.",
    },
  },
  {
    id: "need-account",
    category: "general",
    question: {
      en: "Do I need to create an account or sign up?",
      "pt-br": "Preciso criar uma conta ou me cadastrar?",
      id: "Apakah saya perlu membuat akun atau mendaftar?",
      "es-mx": "¿Necesito crear una cuenta o registrarme?",
      "es-co": "¿Necesito crear una cuenta o registrarme?",
      de: "Muss ich ein Konto erstellen oder mich registrieren?",
      fr: "Dois-je créer un compte ou m'inscrire ?",
      it: "Devo creare un account o registrarmi?",
    },
    answer: {
      en: "No. You never need to create an account, log in, or provide an email address. Open any tool, complete your task immediately, and download your results.",
      "pt-br": "Não. Você nunca precisa criar uma conta, fazer login ou fornecer seu e-mail. Basta abrir qualquer ferramenta, realizar sua tarefa e baixar o resultado na hora.",
      id: "Tidak. Anda tidak perlu membuat akun, masuk log, atau memberikan alamat email. Cukup buka alat yang diinginkan, selesaikan tugas Anda, dan unduh hasilnya seketika.",
      "es-mx": "No. Nunca necesitas crear una cuenta, iniciar sesión ni facilitar un correo electrónico. Abre la herramienta, completa tu tarea de inmediato y descarga el resultado.",
      "es-co": "No. Nunca necesitas crear una cuenta, iniciar sesión ni facilitar un correo electrónico. Abre la herramienta, completa tu tarea de inmediato y descarga el resultado.",
      de: "Nein. Sie müssen kein Konto anlegen, sich nicht anmelden und keine E-Mail-Adresse angeben. Tool aufrufen, Aufgabe erledigen und das Ergebnis direkt herunterladen.",
      fr: "Non. Vous n'avez jamais besoin de créer un compte, de vous connecter ou de fournir une adresse e-mail. Ouvrez l'outil, réalisez votre tâche et téléchargez immédiatement le résultat.",
      it: "No. Non è mai necessario registrarsi, accedere o fornire un indirizzo email. Apri lo strumento, completa il lavoro e scarica subito il tuo file.",
    },
  },
  {
    id: "install-software",
    category: "general",
    question: {
      en: "Do I need to install any software, app, or browser extension?",
      "pt-br": "Preciso instalar algum software, aplicativo ou extensão de navegador?",
      id: "Apakah saya perlu menginstal perangkat lunak atau ekstensi browser?",
      "es-mx": "¿Tengo que instalar algún software, aplicación o extensión?",
      "es-co": "¿Tengo que instalar algún software, aplicación o extensión?",
      de: "Muss ich Software, eine App oder eine Browser-Erweiterung installieren?",
      fr: "Dois-je installer un logiciel, une application ou une extension ?",
      it: "Devo installare software, app o estensioni del browser?",
    },
    answer: {
      en: "No. Everything runs natively inside your modern web browser using HTML5, WebAssembly, and modern JavaScript standards. No extensions, plugins, or background apps required.",
      "pt-br": "Não. Tudo funciona diretamente no seu navegador moderno usando HTML5, WebAssembly e padrões atuais do JavaScript. Nenhuma extensão ou instalação necessária.",
      id: "Tidak. Semua alat berjalan langsung di dalam browser modern Anda menggunakan HTML5, WebAssembly, dan standar JavaScript terkini tanpa ekstensi atau aplikasi tambahan.",
      "es-mx": "No. Todo se ejecuta de forma nativa en tu navegador web moderno mediante HTML5, WebAssembly y JavaScript estándar. No requiere extensiones ni programas adicionales.",
      "es-co": "No. Todo se ejecuta de forma nativa en tu navegador web moderno mediante HTML5, WebAssembly y JavaScript estándar. No requiere extensiones ni programas adicionales.",
      de: "Nein. Alles läuft direkt und nativ in Ihrem modernen Webbrowser über HTML5, WebAssembly und JavaScript. Es sind keinerlei Installationen oder Erweiterungen erforderlich.",
      fr: "Non. Tout s'exécute nativement dans votre navigateur web via HTML5, WebAssembly et les standards JavaScript modernes. Aucune extension ni installation n'est requise.",
      it: "No. Tutto viene eseguito nativamente nel tuo browser web moderno grazie a HTML5, WebAssembly e JavaScript. Non è richiesta alcuna estensione né installazione.",
    },
  },

  // 2. Privacy & Files
  {
    id: "file-upload-server",
    category: "privacy",
    question: {
      en: "Are my files uploaded to your servers?",
      "pt-br": "Meus arquivos são enviados para os seus servidores?",
      id: "Apakah file saya diunggah ke server Anda?",
      "es-mx": "¿Mis archivos se suben a sus servidores?",
      "es-co": "¿Mis archivos se suben a sus servidores?",
      de: "Werden meine Dateien auf Ihre Server hochgeladen?",
      fr: "Mes fichiers sont-ils envoyés sur vos serveurs ?",
      it: "I miei file vengono caricati sui vostri server?",
    },
    answer: {
      en: "No. By default, GainUtility operates on a browser-first architecture. Files you select are read directly into your device's memory (RAM) and processed client-side. Your sensitive documents, photos, and spreadsheets never leave your computer or phone.",
      "pt-br": "Não. Por padrão, a GainUtility opera em uma arquitetura focada no navegador. Os arquivos selecionados são carregados diretamente na memória do seu dispositivo (RAM) e processados localmente. Seus documentos e fotos confidenciais nunca saem do seu computador ou celular.",
      id: "Tidak. Secara default, GainUtility beroperasi dengan arsitektur berbasis browser lokal. File yang Anda pilih dibaca langsung ke memori (RAM) perangkat Anda dan diproses di sisi klien. Dokumen dan foto sensitif Anda tidak pernah keluar dari perangkat Anda.",
      "es-mx": "No. Por defecto, GainUtility funciona con una arquitectura basada en el navegador. Los archivos seleccionados se leen directamente en la memoria RAM de tu dispositivo y se procesan localmente. Tus documentos y fotos confidenciales nunca salen de tu equipo.",
      "es-co": "No. Por defecto, GainUtility funciona con una arquitectura basada en el navegador. Los archivos seleccionados se leen directamente en la memoria RAM de tu dispositivo y se procesan localmente. Tus documentos y fotos confidenciales nunca salen de tu equipo.",
      de: "Nein. GainUtility setzt standardmäßig auf eine strikte Client-Architektur. Ausgewählte Dateien werden direkt in den Arbeitsspeicher (RAM) Ihres Geräts geladen und lokal verarbeitet. Ihre vertraulichen Dokumente und Fotos verlassen Ihr Gerät zu keinem Zeitpunkt.",
      fr: "Non. Par défaut, GainUtility fonctionne sur une architecture locale dans le navigateur. Les fichiers sélectionnés sont chargés directement dans la mémoire vive (RAM) de votre appareil et traités localement. Vos documents et photos sensibles ne quittent jamais votre terminal.",
      it: "No. Per impostazione predefinita, GainUtility opera con un'architettura client-side. I file selezionati vengono letti direttamente nella memoria RAM del tuo dispositivo ed elaborati localmente. Documenti e immagini riservate non lasciano mai il tuo dispositivo.",
    },
  },
  {
    id: "how-long-stored",
    category: "privacy",
    question: {
      en: "How long are my files stored?",
      "pt-br": "Por quanto tempo meus arquivos ficam armazenados?",
      id: "Berapa lama file saya disimpan?",
      "es-mx": "¿Cuánto tiempo se almacenan mis archivos?",
      "es-co": "¿Cuánto tiempo se almacenan mis archivos?",
      de: "Wie lange werden meine Dateien gespeichert?",
      fr: "Combien de temps mes fichiers sont-ils conservés ?",
      it: "Per quanto tempo vengono conservati i miei file?",
    },
    answer: {
      en: "They are not stored at all. Because processing occurs inside your browser session, closing the tab, clicking reset, or reloading the page immediately clears all file data from your device's memory. We do not have databases containing your files.",
      "pt-br": "Eles não são armazenados de forma alguma. Como o processamento acontece na sessão do seu navegador, fechar a aba, clicar em limpar ou recarregar a página descarta imediatamente todos os dados da memória. Não possuímos bancos de dados com seus arquivos.",
      id: "File Anda sama sekali tidak disimpan. Karena pemrosesan berlangsung di sesi browser Anda, menutup tab, mengeklik reset, atau memuat ulang halaman akan langsung menghapus seluruh data file dari memori. Kami tidak memiliki basis data yang menyimpan file Anda.",
      "es-mx": "No se almacenan en absoluto. Debido a que el procesamiento se realiza en la sesión de tu navegador, cerrar la pestaña, pulsar restablecer o recargar la página borra de inmediato todos los datos de la memoria. No disponemos de servidores que guarden tus archivos.",
      "es-co": "No se almacenan en absoluto. Debido a que el procesamiento se realiza en la sesión de tu navegador, cerrar la pestaña, pulsar restablecer o recargar la página borra de inmediato todos los datos de la memoria. No disponemos de servidores que guarden tus archivos.",
      de: "Sie werden überhaupt nicht gespeichert. Da die Verarbeitung in Ihrer Browser-Sitzung stattfindet, löscht das Schließen des Tabs oder das Neuladen der Seite alle Dateidaten restlos aus dem Speicher. Wir betreiben keine Datenbanken für Nutzerdateien.",
      fr: "Ils ne sont pas stockés du tout. Le traitement s'effectuant au sein de votre session de navigation, fermer l'onglet, cliquer sur réinitialiser ou rafraîchir la page supprime aussitôt l'ensemble des données de la mémoire vive. Aucun serveur ne conserve vos fichiers.",
      it: "Non vengono conservati affatto. Poiché l'elaborazione avviene all'interno della sessione del tuo browser, chiudere la scheda o ricaricare la pagina elimina all'istante ogni traccia dalla memoria. Non abbiamo database contenenti i tuoi file.",
    },
  },
  {
    id: "gdpr-compliance",
    category: "privacy",
    question: {
      en: "Is GainUtility compliant with GDPR and CCPA privacy standards?",
      "pt-br": "A GainUtility está em conformidade com as normas LGPD e GDPR?",
      id: "Apakah GainUtility mematuhi standar privasi GDPR dan undang-undang data?",
      "es-mx": "¿GainUtility cumple con los estándares de privacidad del RGPD y CCPA?",
      "es-co": "¿GainUtility cumple con los estándares de privacidad del RGPD y CCPA?",
      de: "Ist GainUtility konform mit der DSGVO (GDPR)?",
      fr: "GainUtility est-il conforme au RGPD et aux normes de confidentialité ?",
      it: "GainUtility è conforme al regolamento GDPR e agli standard di privacy?",
    },
    answer: {
      en: "Yes. By eliminating server-side file uploads and avoiding invasive behavioral tracking, GainUtility inherently protects user privacy by design. We do not sell personal data, build cross-site user profiles, or store file contents.",
      "pt-br": "Sim. Ao eliminar uploads para servidores e evitar rastreadores invasivos de comportamento, a GainUtility foi desenhada desde o início para respeitar a privacidade. Não vendemos dados pessoais nem armazenamos o conteúdo dos seus arquivos.",
      id: "Ya. Dengan meniadakan pengunggahan file ke server dan menghindari pelacakan invasif, GainUtility secara inheren melindungi privasi pengguna berdasarkan prinsip privacy-by-design. Kami tidak menjual data pribadi atau menyimpan isi file Anda.",
      "es-mx": "Sí. Al eliminar subidas a servidores y no emplear rastreadores invasivos, GainUtility protege por diseño la privacidad del usuario según el RGPD. No comercializamos datos personales ni almacenamos el contenido de los archivos.",
      "es-co": "Sí. Al eliminar subidas a servidores y no emplear rastreadores invasivos, GainUtility protege por diseño la privacidad del usuario según el RGPD. No comercializamos datos personales ni almacenamos el contenido de los archivos.",
      de: "Ja. Durch den vollständigen Verzicht auf Server-Uploads und invasive Tracking-Mechanismen erfüllt GainUtility das Prinzip 'Privacy by Design'. Wir verkaufen keine Daten und speichern keine Dateiinhalte.",
      fr: "Oui. En éliminant tout transfert de fichier vers des serveurs et en refusant le traçage invasif, GainUtility garantit la protection des données par défaut selon les principes du RGPD. Nous ne vendons aucune donnée personnelle.",
      it: "Sì. Escludendo l'upload dei file su server remoti ed evitando tracciamenti invasivi, GainUtility rispetta pienamente i principi di privacy by design del GDPR. Non vendiamo dati né archiviamo i contenuti dei tuoi documenti.",
    },
  },

  // 3. PDF & Documents
  {
    id: "pdf-file-size-limit",
    category: "pdf",
    question: {
      en: "Is there a file size limit for PDF merging or conversion?",
      "pt-br": "Existe um limite de tamanho de arquivo para mesclar ou converter PDFs?",
      id: "Apakah ada batasan ukuran file untuk menggabungkan atau mengonversi PDF?",
      "es-mx": "¿Existe un límite de tamaño de archivo para unir o convertir PDFs?",
      "es-co": "¿Existe un límite de tamaño de archivo para unir o convertir PDFs?",
      de: "Gibt es eine Dateigrößenbeschränkung für das Zusammenfügen oder Konvertieren von PDFs?",
      fr: "Y a-t-il une limite de taille de fichier pour fusionner ou convertir des PDF ?",
      it: "C'è un limite di dimensione per unire o convertire i file PDF?",
    },
    answer: {
      en: "Because processing happens directly on your device, the practical limit is determined by your device's available memory. Most modern laptops and phones can comfortably handle PDFs up to 100–300 MB without issue.",
      "pt-br": "Como o processamento ocorre no próprio dispositivo, o limite prático depende da memória RAM disponível. A maioria dos computadores e celulares modernos consegue manipular arquivos de 100 a 300 MB tranquilamente.",
      id: "Karena pemrosesan berlangsung di perangkat Anda, batas praktisnya bergantung pada memori RAM yang tersedia. Sebagian besar laptop dan ponsel modern dapat memproses file PDF hingga 100–300 MB tanpa kendala.",
      "es-mx": "Dado que el procesamiento se realiza en tu equipo, el límite práctico lo define la memoria RAM disponible. La mayoría de computadoras y teléfonos modernos procesan sin problemas archivos PDF de 100 a 300 MB.",
      "es-co": "Dado que el procesamiento se realiza en tu equipo, el límite práctico lo define la memoria RAM disponible. La mayoría de computadoras y teléfonos modernos procesan sin problemas archivos PDF de 100 a 300 MB.",
      de: "Da die Verarbeitung auf Ihrem Endgerät erfolgt, hängt das Limit vom verfügbaren RAM ab. Die meisten modernen Computer und Smartphones verarbeiten PDF-Dateien von 100 bis 300 MB problemlos.",
      fr: "Le traitement étant opéré sur votre équipement, la limite dépend de la mémoire RAM disponible. La plupart des ordinateurs et téléphones récents traitent sans difficulté des PDF de 100 à 300 Mo.",
      it: "Poiché il processo avviene sul tuo dispositivo, il limite effettivo dipende dalla memoria RAM disponibile. La maggioranza di computer e smartphone moderni gestisce comodamente PDF fino a 100–300 MB.",
    },
  },
  {
    id: "why-pdf-compression-minimal",
    category: "pdf",
    question: {
      en: "Why did my PDF file size barely reduce when compressing?",
      "pt-br": "Por que o tamanho do meu PDF quase não diminuiu na compressão?",
      id: "Mengapa ukuran file PDF saya hampir tidak berkurang saat dikompresi?",
      "es-mx": "¿Por qué el tamaño de mi PDF casi no se redujo al comprimir?",
      "es-co": "¿Por qué el tamaño de mi PDF casi no se redujo al comprimir?",
      de: "Warum hat sich die Dateigröße meines PDFs beim Komprimieren kaum verringert?",
      fr: "Pourquoi la taille de mon PDF a-t-elle à peine diminué lors de la compression ?",
      it: "Perché la dimensione del mio PDF è diminuita a malapena con la compressione?",
    },
    answer: {
      en: "If a PDF already contains heavily optimized text, vectorized shapes, or previously compressed images (such as JPEG/WebP), further lossy or lossless compression yields marginal gains. Compression works best on high-resolution scanned documents or uncompressed embedded images.",
      "pt-br": "Se o PDF já contém texto otimizado, gráficos vetoriais ou fotos que já estavam compactadas (como JPEG/WebP), uma nova compressão trará ganhos mínimos. O compressor funciona melhor em documentos digitalizados em alta resolução com fotos não compactadas.",
      id: "Jika PDF sudah berisi teks yang dioptimalkan, grafik vektor, atau gambar yang telah dikompresi sebelumnya (seperti JPEG/WebP), kompresi ulang hanya menghasilkan sedikit pengurangan. Kompresi paling efektif untuk dokumen hasil pemindaian beresolusi tinggi.",
      "es-mx": "Si el PDF ya contiene texto optimizado, vectores o imágenes previamente comprimidas (como JPEG/WebP), una compresión adicional genera reducciones marginales. Funciona mejor en documentos escaneados en alta resolución con imágenes sin comprimir.",
      "es-co": "Si el PDF ya contiene texto optimizado, vectores o imágenes previamente comprimidas (como JPEG/WebP), una compresión adicional genera reducciones marginales. Funciona mejor en documentos escaneados en alta resolución con imágenes sin comprimir.",
      de: "Wenn ein PDF bereits optimierten Text, Vektorgrafiken oder vorab komprimierte Bilder (wie JPEG/WebP) enthält, bringt eine erneute Komprimierung kaum Ersparnis. Die stärkste Reduktion wird bei hochauflösenden Scans und unkomprimierten Bilddateien erzielt.",
      fr: "Si un PDF comprend déjà du texte vectorisé optimisé ou des images déjà fortement compressées (JPEG/WebP), une compression supplémentaire aura peu d'impact. L'outil est particulièrement efficace sur des numérisations haute résolution avec images brutes.",
      it: "Se il PDF contiene già testo ottimizzato, grafiche vettoriali o immagini precedentemente compresse (come JPEG/WebP), una nuova compressione produrrà guadagni minimi. Lo strumento dà il meglio su scansioni ad alta risoluzione non ottimizzate.",
    },
  },
  {
    id: "rearrange-pdf-order",
    category: "pdf",
    question: {
      en: "Can I reorder, rotate, or delete specific pages in a PDF?",
      "pt-br": "Posso reordenar, girar ou excluir páginas específicas de um PDF?",
      id: "Bisakah saya menyusun ulang, memutar, atau menghapus halaman tertentu di PDF?",
      "es-mx": "¿Puedo reordenar, rotar o eliminar páginas específicas de un PDF?",
      "es-co": "¿Puedo reordenar, rotar o eliminar páginas específicas de un PDF?",
      de: "Kann ich einzelne Seiten in einem PDF neu anordnen, drehen oder löschen?",
      fr: "Puis-je réorganiser, pivoter ou supprimer des pages précises d'un PDF ?",
      it: "Posso riordinare, ruotare o eliminare singole pagine in un PDF?",
    },
    answer: {
      en: "Yes. Use our dedicated Rearrange PDF, Rotate PDF, or Delete PDF tools. You can visually drag and drop page thumbnails to reorder, rotate pages 90/180/270 degrees, or remove blank and unnecessary pages before saving.",
      "pt-br": "Sim. Utilize nossas ferramentas dedicadas Organizar PDF, Girar PDF ou Excluir Páginas de PDF. Você pode arrastar miniaturas de páginas visualmente para reordenar, girar páginas em 90/180/270 graus ou remover páginas em branco antes de salvar.",
      id: "Ya. Gunakan alat Susun Ulang PDF, Putar PDF, atau Hapus Halaman PDF kami. Anda dapat menyeret gambar mini halaman untuk mengubah urutan, memutar halaman 90/180/270 derajat, atau menghapus halaman kosong sebelum menyimpan.",
      "es-mx": "Sí. Utiliza nuestras herramientas especializadas Organizar PDF, Rotar PDF o Eliminar Páginas de PDF. Puedes arrastrar miniaturas para cambiar el orden, rotar en 90/180/270 grados o quitar páginas en blanco antes de descargar.",
      "es-co": "Sí. Utiliza nuestras herramientas especializadas Organizar PDF, Rotar PDF o Eliminar Páginas de PDF. Puedes arrastrar miniaturas para cambiar el orden, rotar en 90/180/270 grados o quitar páginas en blanco antes de descargar.",
      de: "Ja. Nutzen Sie dazu unsere spezialisierten Tools PDF organisieren, PDF drehen oder PDF-Seiten löschen. Sie können Seitenvorschauen per Drag-and-Drop anordnen, um 90/180/270 Grad drehen oder leere Seiten entfernen.",
      fr: "Oui. Utilisez nos outils dédiés Réorganiser PDF, Faire pivoter PDF ou Supprimer des pages PDF. Vous pouvez glisser-déposer les miniatures pour modifier l'ordre, faire pivoter les pages à 90/180/270 degrés ou retirer des pages blanches.",
      it: "Sì. Puoi usare i nostri strumenti Riordina PDF, Ruota PDF o Elimina pagine PDF. È possibile trascinare le miniature per cambiare ordine, ruotare le pagine di 90/180/270 gradi o rimuovere fogli vuoti prima del salvataggio.",
    },
  },

  // 4. Images & Design
  {
    id: "transparent-png-background",
    category: "images",
    question: {
      en: "How does the background remover tool work without uploading my photo?",
      "pt-br": "Como o removedor de fundo funciona sem enviar minha foto?",
      id: "Bagaimana alat penghapus latar belakang bekerja tanpa mengunggah foto saya?",
      "es-mx": "¿Cómo funciona el eliminador de fondo sin subir mi foto?",
      "es-co": "¿Cómo funciona el eliminador de fondo sin subir mi foto?",
      de: "Wie funktioniert der Hintergrund-Entferner ohne Upload des Fotos?",
      fr: "Comment l'outil de suppression de fond fonctionne-t-il sans téléverser ma photo ?",
      it: "Come funziona la rimozione dello sfondo senza caricare la mia foto?",
    },
    answer: {
      en: "Our background remover leverages HTML5 Canvas pixel manipulation and local client-side color clustering algorithms. You click the background color to sample it, adjust the tolerance and feather sliders, and download a transparent PNG generated right on your machine.",
      "pt-br": "Nosso removedor de fundo utiliza manipulação direta de pixels via HTML5 Canvas e algoritmos locais de agrupamento de cor. Você clica na cor de fundo para capturá-la, ajusta os controles de tolerância e suavização, e baixa um PNG transparente gerado no seu dispositivo.",
      id: "Penghapus latar belakang kami memanfaatkan manipulasi piksel HTML5 Canvas dan algoritme pengelompokan warna lokal. Anda cukup mengeklik warna latar belakang, menyesuaikan toleransi dan kehalusan tepi, lalu mengunduh PNG transparan.",
      "es-mx": "Nuestro eliminador de fondo utiliza manipulación de píxeles mediante HTML5 Canvas y algoritmos locales de color. Haces clic en el color de fondo para capturarlo, regulas la tolerancia y el suavizado de bordes, y descargas un PNG transparente creado en tu equipo.",
      "es-co": "Nuestro eliminador de fondo utiliza manipulación de píxeles mediante HTML5 Canvas y algoritmos locales de color. Haces clic en el color de fondo para capturarlo, regulas la tolerancia y el suavizado de bordes, y descargas un PNG transparente creado en tu equipo.",
      de: "Unser Hintergrund-Entferner nutzt pixelgenaue HTML5-Canvas-Verarbeitung und lokale Farbfilter-Algorithmen direkt im Browser. Klicken Sie auf die Hintergrundfarbe, passen Sie Toleranz und Weichzeichnung an und laden Sie ein transparentes PNG herunter.",
      fr: "Notre outil de suppression d'arrière-plan utilise la manipulation de pixels via HTML5 Canvas et des algorithmes locaux d'analyse de couleur. Cliquez sur la couleur de fond, ajustez la tolérance et le lissage, puis téléchargez un PNG transparent généré localement.",
      it: "Il nostro strumento per rimuovere lo sfondo sfrutta la manipolazione dei pixel via HTML5 Canvas e algoritmi locali di selezione colore. Clicca sul colore di sfondo, regola tolleranza e sfumatura dei bordi, e scarica il PNG trasparente pronto.",
    },
  },
  {
    id: "image-formats-supported",
    category: "images",
    question: {
      en: "Which image formats can I convert between?",
      "pt-br": "Quais formatos de imagem posso converter?",
      id: "Format gambar apa saja yang didukung untuk konversi?",
      "es-mx": "¿Entre qué formatos de imagen puedo convertir?",
      "es-co": "¿Entre qué formatos de imagen puedo convertir?",
      de: "Welche Bildformate werden für die Konvertierung unterstützt?",
      fr: "Quels formats d'image puis-je convertir ?",
      it: "Quali formati di immagine posso convertire?",
    },
    answer: {
      en: "You can convert between PNG, JPG/JPEG, WebP, SVG, and modern mobile formats like HEIC/HEIF. You can also generate multi-size ICO favicons and convert photos into PDF documents.",
      "pt-br": "Você pode converter entre PNG, JPG/JPEG, WebP, SVG e formatos móveis modernos como HEIC/HEIF. Também é possível gerar favicons ICO em vários tamanhos e converter fotos para documentos PDF.",
      id: "Anda dapat mengonversi antara PNG, JPG/JPEG, WebP, SVG, dan format ponsel modern seperti HEIC/HEIF. Anda juga dapat membuat favicon ICO multi-ukuran dan mengonversi foto menjadi dokumen PDF.",
      "es-mx": "Puedes convertir entre PNG, JPG/JPEG, WebP, SVG y formatos móviles modernos como HEIC/HEIF. Además, puedes generar favicons ICO multirresolución y convertir fotos a documentos PDF.",
      "es-co": "Puedes convertir entre PNG, JPG/JPEG, WebP, SVG y formatos móviles modernos como HEIC/HEIF. Además, puedes generar favicons ICO multirresolución y convertir fotos a documentos PDF.",
      de: "Sie können zwischen PNG, JPG/JPEG, WebP, SVG und mobilen Formaten wie HEIC/HEIF konvertieren. Zudem erstellen Sie mehrstufige ICO-Favicons und wandeln Bilder in PDF-Dokumente um.",
      fr: "Vous pouvez convertir entre PNG, JPG/JPEG, WebP, SVG et les formats mobiles récents comme HEIC/HEIF. Vous pouvez également générer des favicons ICO multi-tailles et convertir des images en PDF.",
      it: "Puoi convertire tra PNG, JPG/JPEG, WebP, SVG e formati mobili come HEIC/HEIF. È anche possibile creare favicon ICO multiformato e convertire foto in documenti PDF.",
    },
  },

  // 5. Developer Tools
  {
    id: "json-formatting-privacy",
    category: "developer",
    question: {
      en: "Is it safe to format proprietary or sensitive JSON and API tokens?",
      "pt-br": "É seguro formatar JSON confidencial ou tokens de API?",
      id: "Apakah aman memformat JSON rahasia atau token API di sini?",
      "es-mx": "¿Es seguro formatear JSON confidencial o tokens de API?",
      "es-co": "¿Es seguro formatear JSON confidencial o tokens de API?",
      de: "Ist es sicher, vertrauliches JSON oder API-Tokens hier zu formatieren?",
      fr: "Est-il sûr de formater des JSON confidentiels ou des jetons d'API ici ?",
      it: "È sicuro formattare JSON proprietari o token API su questo sito?",
    },
    answer: {
      en: "Yes, completely safe. Unlike online formatters that send payloads to remote logging servers, our JSON Beautifier, Viewer, and Diff tools parse everything locally inside your browser's V8 engine. No network requests are made with your JSON data.",
      "pt-br": "Sim, totalmente seguro. Ao contrário de formatadores online que enviam dados para servidores de registro, nosso Formatador, Visualizador e Comparador JSON processam tudo localmente no motor JavaScript do seu navegador. Nenhuma requisição de rede é feita com o seu JSON.",
      id: "Ya, sangat aman. Berbeda dengan format online yang mengirim payload ke server jarak jauh, alat JSON Beautifier, Viewer, dan Diff kami mengurai semuanya secara lokal di dalam mesin browser Anda tanpa mengirim permintaan jaringan apa pun.",
      "es-mx": "Sí, totalmente seguro. A diferencia de otros formateadores que envían información a servidores remotos, nuestro Embellecedor, Visor y Comparador JSON procesan todo localmente en el motor JavaScript de tu navegador sin enviar peticiones de red.",
      "es-co": "Sí, totalmente seguro. A diferencia de otros formateadores que envían información a servidores remotos, nuestro Embellecedor, Visor y Comparador JSON procesan todo localmente en el motor JavaScript de tu navegador sin enviar peticiones de red.",
      de: "Ja, absolut sicher. Im Gegensatz zu vielen Online-Formatierern, die Daten an Remoteserver senden, verarbeiten unser JSON-Beautifier, -Viewer und -Diff-Tools alles lokal im JavaScript-Engine Ihres Browsers. Ihre Nutzdaten werden nicht übertragen.",
      fr: "Oui, totalement sûr. Contrairement aux formateurs en ligne qui transmettent les charges utiles à des serveurs tiers, nos outils JSON (formateur, visionneuse et diff) analysent tout localement dans votre navigateur sans aucune requête réseau.",
      it: "Sì, assolutamente sicuro. A differenza dei formattatori online che trasmettono i dati a server remoti, i nostri strumenti JSON elaborano tutto localmente nel motore del tuo browser. Nessuna chiamata di rete viene effettuata con i tuoi dati.",
    },
  },
  {
    id: "qr-code-expiration",
    category: "developer",
    question: {
      en: "Do QR codes generated on GainUtility ever expire?",
      "pt-br": "Os códigos QR gerados na GainUtility expiram?",
      id: "Apakah kode QR yang dibuat di GainUtility memiliki masa kedaluwarsa?",
      "es-mx": "¿Los códigos QR creados en GainUtility caducan en algún momento?",
      "es-co": "¿Los códigos QR creados en GainUtility caducan en algún momento?",
      de: "Laufen auf GainUtility erstellte QR-Codes irgendwann ab?",
      fr: "Les codes QR créés sur GainUtility expirent-ils dans le temps ?",
      it: "I codici QR generati su GainUtility hanno una scadenza?",
    },
    answer: {
      en: "No. The QR codes you create are static standard QR codes. The destination URL or text is directly encoded into the matrix pattern itself, not redirected through a middleman domain. As long as your target link works, the QR code works forever.",
      "pt-br": "Não. Os QR codes gerados são códigos estáticos padrão. A URL ou texto de destino é codificado diretamente na matriz de módulos, sem passar por redirecionadores intermediários. Enquanto seu link de destino existir, o código funcionará para sempre.",
      id: "Tidak. Kode QR yang Anda buat adalah kode QR standar statis. URL tujuan atau teks dikodekan langsung ke dalam matriks pola, bukan dialihkan melalui server perantara. Selama tautan tujuan Anda aktif, kode QR akan berfungsi selamanya.",
      "es-mx": "No. Los códigos QR que generas son códigos estándar estáticos. La URL o el texto de destino se codifica directamente en el patrón matricial sin intermediarios ni redirecciones. Mientras tu enlace de destino funcione, el QR funcionará para siempre.",
      "es-co": "No. Los códigos QR que generas son códigos estándar estáticos. La URL o el texto de destino se codifica directamente en el patrón matricial sin intermediarios ni redirecciones. Mientras tu enlace de destino funcione, el QR funcionará para siempre.",
      de: "Nein. Die erstellten QR-Codes sind statische Standard-Codes. Die Ziel-URL oder der Text ist direkt im Matrixmuster codiert, ohne Weiterleitung über Zwischenserver. Solange Ihre Zieladresse erreichbar ist, funktioniert der Code dauerhaft.",
      fr: "Non. Les QR codes générés sont des codes statiques conformes aux standards. L'URL ou le texte cible est directement encodé dans la matrice de modules, sans redirection intermédiaire. Tant que votre lien fonctionne, le QR code reste valide indéfiniment.",
      it: "No. I codici QR generati sono statici e conformi allo standard. L'URL o il testo di destinazione è direttamente codificato nella matrice, senza server intermedi né reindirizzamenti. Finché il tuo link funziona, il QR code funzionerà per sempre.",
    },
  },

  // 6. Mobile & Performance
  {
    id: "use-on-mobile-phones",
    category: "mobile",
    question: {
      en: "Can I use all GainUtility tools on my smartphone or tablet?",
      "pt-br": "Posso usar todas as ferramentas da GainUtility no smartphone ou tablet?",
      id: "Bisakah saya menggunakan seluruh alat GainUtility di ponsel atau tablet?",
      "es-mx": "¿Puedo usar todas las herramientas de GainUtility en el móvil o tableta?",
      "es-co": "¿Puedo usar todas las herramientas de GainUtility en el móvil o tableta?",
      de: "Kann ich alle GainUtility-Tools auf Smartphones oder Tablets nutzen?",
      fr: "Puis-je utiliser tous les outils GainUtility sur smartphone ou tablette ?",
      it: "Posso usare tutti gli strumenti di GainUtility su smartphone o tablet?",
    },
    answer: {
      en: "Yes. Every tool interface is designed responsively for mobile screens, with touch-friendly controls (minimum 44px hit targets) and adaptive layouts. For resource-intensive tasks on very large files, performance depends on your phone's processor and memory.",
      "pt-br": "Sim. A interface de cada ferramenta foi construída de forma responsiva para telas móveis, com botões confortáveis ao toque (alvos mínimos de 44 px) e layouts fluidos. Para arquivos muito pesados, o tempo de processamento dependerá da memória do seu celular.",
      id: "Ya. Setiap antarmuka alat dirancang responsif untuk layar ponsel dengan target sentuh ramah jari (minimal 44px) dan tata letak adaptif. Untuk tugas berat pada file sangat besar, performa bergantung pada prosesor dan memori perangkat Anda.",
      "es-mx": "Sí. Cada interfaz está diseñada de forma responsiva para pantallas móviles, con controles táctiles cómodos (mínimo 44 px de área de toque) y diseño adaptable. Para archivos muy pesados, el rendimiento dependerá del procesador de tu móvil.",
      "es-co": "Sí. Cada interfaz está diseñada de forma responsiva para pantallas móviles, con controles táctiles cómodos (mínimo 44 px de área de toque) y diseño adaptable. Para archivos muy pesados, el rendimiento dependerá del procesador de tu móvil.",
      de: "Ja. Jedes Tool ist responsiv für mobile Displays optimiert, bietet berührungsfreundliche Bedienelemente (mindestens 44 px Touch-Ziele) und adaptive Layouts. Bei sehr großen Dateien hängt das Tempo von Prozessor und RAM Ihres Geräts ab.",
      fr: "Oui. Toutes les interfaces sont conçues de manière réactive pour les écrans mobiles, avec des commandes tactiles adaptées (cibles d'au moins 44 px) et des mises en page fluides. Pour les fichiers très volumineux, la vitesse dépend de la puissance de votre appareil.",
      it: "Sì. Ogni strumento è progettato per adattarsi perfettamente agli schermi mobili, con comandi facili da toccare (target di almeno 44 px) e layout reattivi. Con file particolarmente pesanti, le prestazioni dipendono dalla memoria e dalla CPU del telefono.",
    },
  },
  {
    id: "offline-capabilities",
    category: "mobile",
    question: {
      en: "Do these browser tools work offline?",
      "pt-br": "Essas ferramentas de navegador funcionam sem internet (offline)?",
      id: "Apakah alat browser ini dapat bekerja secara luring (offline)?",
      "es-mx": "¿Estas herramientas del navegador funcionan sin conexión (offline)?",
      "es-co": "¿Estas herramientas del navegador funcionan sin conexión (offline)?",
      de: "Funktionieren diese Browser-Tools auch offline ohne Internetverbindung?",
      fr: "Ces outils fonctionnent-ils hors ligne sans connexion internet ?",
      it: "Questi strumenti nel browser funzionano anche offline senza connessione?",
    },
    answer: {
      en: "Once a tool page has loaded in your browser, the client-side processing code is cached locally on your device. You can disconnect from Wi-Fi or mobile data and continue converting, formatting, or inspecting files without an active internet connection.",
      "pt-br": "Uma vez que a página da ferramenta é carregada no seu navegador, todo o código de processamento fica armazenado em cache no seu dispositivo. Você pode desconectar da internet e continuar convertendo, formatando ou manipulando arquivos normalmente.",
      id: "Setelah halaman alat dimuat di browser Anda, seluruh kode pemrosesan tersimpan di cache lokal perangkat Anda. Anda dapat memutuskan sambungan internet dan tetap mengonversi, memformat, atau memproses file secara luring.",
      "es-mx": "Una vez cargada la página de la herramienta en tu navegador, el código de procesamiento se almacena en la caché de tu dispositivo. Puedes desconectarte de internet y continuar convirtiendo, formateando o editando archivos con normalidad.",
      "es-co": "Una vez cargada la página de la herramienta en tu navegador, el código de procesamiento se almacena en la caché de tu dispositivo. Puedes desconectarte de internet y continuar convirtiendo, formateando o editando archivos con normalidad.",
      de: "Sobald eine Tool-Seite einmal geladen wurde, befindet sich der Verarbeitungscode im lokalen Cache Ihres Geräts. Sie können die Internetverbindung trennen und weiterhin offline Dokumente bearbeiten, formatieren oder prüfen.",
      fr: "Une fois la page de l'outil chargée, l'ensemble du code de traitement est mis en cache sur votre appareil. Vous pouvez couper votre connexion internet et continuer à convertir, formater ou vérifier des fichiers en toute autonomie.",
      it: "Una volta caricata la pagina nel browser, il codice di elaborazione rimane memorizzato nella cache del dispositivo. Puoi disconnetterti dalla rete e continuare a convertire, formattare o manipolare i file senza connessione attiva.",
    },
  },
];

export const getAllFaqEntries = (locale: string = DEFAULT_LOCALE) => {
  const loc = (locale as LocaleCode) || DEFAULT_LOCALE;
  return FAQ_ITEMS.map((item) => ({
    question: item.question[loc] ?? item.question.en,
    answer: item.answer[loc] ?? item.answer.en,
  }));
};
