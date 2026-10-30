/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlay for json-beautifier (6 locales, 6 FAQs —
 * 4 base entries plus the 2 EXTRA_FAQS boost). Source: src/data.ts
 * "json-beautifier" + src/seo/extraFaqs.ts.
 */

import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";

export const overlay: Partial<Record<LocaleCode, ToolBodyOverlay>> = {
  "pt-br": {
    desc: "Reformat JSON minificado com indentação limpa e realce de sintaxe.",
    whatText:
      "Formate JSON minificado ou bagunçado com indentação legível direto no seu navegador. Escolha a indentação de 2 espaços, 4 espaços ou tabulações, veja o realce de sintaxe e copie ou baixe o resultado.",
    whyText:
      "JSON minificado de exportações de banco de dados, respostas de API e dumps de configuração é difícil de escanear em busca de estrutura e erros. Reformatar com indentação consistente torna os mesmos dados rápidos de ler e editar.",
    features: [
      "Espaços de indentação configuráveis (2 espaços, 4 espaços, tabulações)",
      "Código de cores vivo no realce de sintaxe para chaves, strings e números",
      "Transferências completas para a área de transferência em um clique e downloads de backup",
      "Processamento offline e seguro",
    ],
    steps: [
      "Cole o JSON desorganizado na Entrada JSON Bruto ou carregue seu arquivo .json bruto.",
      "Selecione o Estilo de Indentação de sua preferência.",
      "Copie a saída formatada do Resultado Formatado ou baixe o arquivo com Exportar Arquivo.",
    ],
    examples: [
      {
        title: "Formatos embelezados",
        desc: "Estilo de indentação de 2 espaços.",
        code: '{\n  "project": "Studio",\n  "active": true\n}',
      },
    ],
    mistakes: [
      "Usar aspas simples não padrão em vez das aspas duplas padrão nos parâmetros de chave.",
    ],
    privacyExplanation:
      "A formatação, o realce de sintaxe e a análise acontecem inteiramente na aba do seu navegador. Seu JSON nunca sai do seu dispositivo e nunca é enviado a um servidor.",
    faqs: [
      {
        question: "Quais estilos de indentação são suportados?",
        answer:
          "Você pode escolher 2 Espaços, 4 Espaços ou Abas como delimitadores, com base nas regras de formatação de código da sua equipe.",
      },
      {
        question: "O que acontece se meu JSON tiver um erro de sintaxe?",
        answer:
          "O formatador sinaliza a linha e a posição exata do caractere com o problema em vez de falhar silenciosamente, para que você corrija a entrada e execute novamente.",
      },
      {
        question: "Posso carregar e baixar arquivos?",
        answer:
          "Sim. Carregue um arquivo .json bruto do seu dispositivo, formate-o e depois copie o resultado ou baixe a saída embelezada.",
      },
      {
        question: "Meu JSON é enviado a um servidor?",
        answer:
          "Não. Análise, realce e formatação rodam localmente na aba do seu navegador — nada é enviado para lugar nenhum.",
      },
      {
        question: "Como embelezar um arquivo .json sem copiar e colar?",
        answer:
          "Use o controle de upload para carregar seu arquivo .json diretamente, escolha o tamanho da indentação e formate. O resultado embelezado pode então ser baixado como um novo arquivo.",
      },
      {
        question: "Embelezar altera algum dos meus valores?",
        answer:
          "Não. A formatação apenas adiciona espaços em branco e quebras de linha entre tokens. Strings, números e a ordem das chaves permanecem exatamente como foram analisados.",
      },
    ],
  },
  id: {
    desc: "Format ulang JSON terminifikasi dengan indentasi rapi dan sorotan sintaks.",
    whatText:
      "Rapikan JSON terminifikasi atau berantakan langsung di browser Anda dengan indentasi yang mudah dibaca. Pilih indentasi 2 spasi, 4 spasi, atau tab, lihat sorotan sintaks, lalu salin atau unduh hasilnya.",
    whyText:
      "JSON terminifikasi dari ekspor basis data, respons API, dan dump konfigurasi menyulitkan pelacakan struktur dan kesalahan. Memformat ulang dengan indentasi yang konsisten membuat data yang sama cepat dibaca dan diedit.",
    features: [
      "Jarak indentasi yang dapat dikonfigurasi (2 spasi, 4 spasi, tab)",
      "Pewarnaan sorotan sintaks yang tajam untuk kunci, string, dan angka",
      "Transfer clipboard lengkap dalam satu klik dan unduhan cadangan",
      "Pemrosesan offline dan aman",
    ],
    steps: [
      "Tempel JSON yang tidak beraturan ke Masukan JSON Mentah atau unggah file .json mentah Anda.",
      "Pilih Gaya Indentasi sesuai keinginan Anda.",
      "Salin keluaran yang sudah dirapikan dari Hasil yang Diformat atau unduh filenya lewat Ekspor File.",
    ],
    examples: [
      {
        title: "Format yang dirapikan",
        desc: "Gaya indentasi 2 spasi.",
        code: '{\n  "project": "Studio",\n  "active": true\n}',
      },
    ],
    mistakes: [
      "Menggunakan tanda kutip tunggal non-standar sebagai ganti tanda kutip ganda standar untuk parameter kunci.",
    ],
    privacyExplanation:
      "Pemformatan, sorotan sintaks, dan parsing semuanya berjalan sepenuhnya di tab browser Anda. JSON Anda tidak pernah meninggalkan perangkat dan tidak pernah diunggah ke server mana pun.",
    faqs: [
      {
        question: "Gaya indentasi apa saja yang didukung?",
        answer:
          "Anda dapat memilih 2 Spasi, 4 Spasi, atau Tab sebagai pemisah, sesuai aturan format kode tim Anda.",
      },
      {
        question: "Apa yang terjadi jika JSON saya punya kesalahan sintaks?",
        answer:
          "Pemformat menandai baris dan posisi karakter yang tepat dari masalah itu alih-alih gagal diam-diam, sehingga Anda dapat memperbaiki input dan menjalankannya ulang.",
      },
      {
        question: "Bisakah saya mengunggah dan mengunduh file?",
        answer:
          "Bisa. Muat file .json mentah dari perangkat Anda, format, lalu salin hasilnya atau unduh output yang sudah dirapikan.",
      },
      {
        question: "Apakah JSON saya dikirim ke server?",
        answer:
          "Tidak. Parsing, sorotan, dan pemformatan semuanya berjalan secara lokal di tab browser Anda — tidak ada yang diunggah ke mana pun.",
      },
      {
        question: "Bagaimana cara merapikan file .json tanpa salin-tempel?",
        answer:
          "Gunakan kontrol unggah untuk memuat file .json Anda langsung, pilih ukuran indentasi, lalu format. Hasil yang sudah dirapikan kemudian bisa diunduh sebagai file baru.",
      },
      {
        question: "Apakah pemformatan mengubah nilai saya?",
        answer:
          "Tidak. Pemformatan hanya menambahkan spasi kosong dan baris baru antar token. String, angka, dan urutan kunci dibiarkan persis seperti saat di-parse.",
      },
    ],
  },
  "es-mx": {
    desc: "Da formato a JSON minificado con sangría limpia y resaltado de sintaxis.",
    whatText:
      "Formatea JSON minificado o desordenado con sangría legible directo en tu navegador. Elige la sangría de 2 espacios, 4 espacios o tabulaciones, consulta el resaltado de sintaxis y copia o descarga el resultado.",
    whyText:
      "El JSON minificado de exportaciones de bases de datos, respuestas de API y volcados de configuración es difícil de recorrer para encontrar estructura y errores. Volver a formatear con sangría consistente hace que los mismos datos sean rápidos de leer y editar.",
    features: [
      "Sangrías configurables (2 espacios, 4 espacios, tabulaciones)",
      "Codificación de colores vívida en el resaltado de sintaxis para claves, strings y números",
      "Transferencias completas al portapapeles en un clic y descargas de respaldo",
      "Procesamiento sin conexión y seguro",
    ],
    steps: [
      "Pega el JSON desordenado en la Entrada JSON sin procesar o carga tu archivo .json sin procesar.",
      "Selecciona el Estilo de sangría que prefieras.",
      "Copia la salida formateada del Resultado Formateado o descarga el archivo con Exportar Archivo.",
    ],
    examples: [
      {
        title: "Formatos embelezados",
        desc: "Estilo de sangría de 2 espacios.",
        code: '{\n  "project": "Studio",\n  "active": true\n}',
      },
    ],
    mistakes: [
      "Usar comillas simples no estándar en lugar de las comillas dobles estándar en los parámetros de clave.",
    ],
    privacyExplanation:
      "El formateado, el resaltado de sintaxis y el análisis se ejecutan por completo en la pestaña de tu navegador. Tu JSON nunca sale de tu dispositivo y nunca se sube a un servidor.",
    faqs: [
      {
        question: "¿Qué estilos de sangría se admiten?",
        answer:
          "Puedes elegir 2 Espacios, 4 Espacios o Tabulaciones como delimitadores, según las reglas de formato de código de tu equipo.",
      },
      {
        question: "¿Qué pasa si mi JSON tiene un error de sintaxis?",
        answer:
          "El formateador marca la línea y la posición exacta del carácter del problema en vez de fallar en silencio, para que corrijas la entrada y vuelvas a ejecutar.",
      },
      {
        question: "¿Puedo subir y descargar archivos?",
        answer:
          "Sí. Carga un archivo .json sin procesar desde tu dispositivo, formátalo y luego copia el resultado o descarga la salida embelezada.",
      },
      {
        question: "¿Se envía mi JSON a un servidor?",
        answer:
          "No. El análisis, el resaltado y el formateo se ejecutan localmente en la pestaña de tu navegador: no se sube nada a ningún lado.",
      },
      {
        question: "¿Cómo embelezar un archivo .json sin copiar y pegar?",
        answer:
          "Usa el control de carga para cargar tu archivo .json directamente, elige un tamaño de sangría y formátalo. La salida embelezada puede descargarse después como un archivo nuevo.",
      },
      {
        question: "¿El embelezado cambiará alguno de mis valores?",
        answer:
          "No. El formateado solo añade espacios en blanco y saltos de línea entre tokens. Las cadenas, los números y el orden de las claves quedan exactamente como se analizaron.",
      },
    ],
  },
  de: {
    desc: "Formatiere minifiziertes JSON mit sauberer Einrückung und Syntax-Highlighting.",
    whatText:
      "Formatieren Sie minifiziertes oder unordentliches JSON direkt in Ihrem Browser mit lesbarer Einrückung. Wählen Sie die Einrückung mit 2 Leerzeichen, 4 Leerzeichen oder Tabs, sehen Sie das Syntax-Highlighting und kopieren oder laden Sie das Ergebnis herunter.",
    whyText:
      "Minifiziertes JSON aus Datenbank-Exporten, API-Antworten und Konfigurations-Dumps ist mühsam zu durchsuchen, um Struktur und Fehler zu finden. Eine Neformatierung mit konsistenter Einrückung macht dieselben Daten schnell les- und bearbeitbar.",
    features: [
      "Konfigurierbare Einrückungen (2 Leerzeichen, 4 Leerzeichen, Tabs)",
      "Kräftige Farbcodierung im Syntax-Highlighting für Schlüssel, Strings und Zahlen",
      "Ein-Klick-Komplettübertragungen in die Zwischenablage und Backup-Downloads",
      "Offline- und sichere Verarbeitung",
    ],
    steps: [
      "Fügen Sie das unsortierte JSON in die Roh-JSON-Eingabe ein oder laden Sie Ihre .json-Datei hoch.",
      "Wählen Sie Ihren bevorzugten Einzugsstil.",
      "Kopieren Sie die formatierte Ausgabe aus dem Formatierten Ergebnis oder laden Sie die Datei über Datei exportieren herunter.",
    ],
    examples: [
      {
        title: "Formatierte Ergebnisse",
        desc: "Einrückungsstil mit 2 Leerzeichen.",
        code: '{\n  "project": "Studio",\n  "active": true\n}',
      },
    ],
    mistakes: [
      "Einfache Anführungszeichen statt der üblichen doppelten Anführungszeichen für Schlüsselparameter verwenden.",
    ],
    privacyExplanation:
      "Formatierung, Syntax-Highlighting und Parsing laufen vollständig in Ihrem Browser-Tab. Ihr JSON verlässt Ihr Gerät nie und wird nie auf einen Server hochgeladen.",
    faqs: [
      {
        question: "Welche Einzugsstile werden unterstützt?",
        answer:
          "Sie können 2 Leerzeichen, 4 Leerzeichen oder Tabs als Trennzeichen wählen, je nach den Code-Formatierungsregeln Ihres Teams.",
      },
      {
        question: "Was passiert, wenn mein JSON einen Syntaxfehler hat?",
        answer:
          "Der Formatter markiert die genaue Zeile und Zeichenposition des Problems, anstatt stillschweigend zu scheitern, damit Sie die Eingabe korrigieren und erneut ausführen können.",
      },
      {
        question: "Kann ich Dateien hoch- und herunterladen?",
        answer:
          "Ja. Laden Sie eine Roh-.json-Datei von Ihrem Gerät, formatieren Sie sie und kopieren Sie anschließend das Ergebnis oder laden Sie das formatierte Ergebnis herunter.",
      },
      {
        question: "Wird mein JSON an einen Server gesendet?",
        answer:
          "Nein. Parsing, Highlighting und Formatierung laufen lokal in Ihrem Browser-Tab — nichts wird irgendwohin hochgeladen.",
      },
      {
        question: "Wie formatiere ich eine .json-Datei ohne Kopieren und Einfügen?",
        answer:
          "Verwenden Sie das Upload-Steuerelement, um Ihre .json-Datei direkt zu laden, wählen Sie eine Einrückungsgröße und formatieren Sie sie. Das formatierte Ergebnis lässt sich dann als neue Datei herunterladen.",
      },
      {
        question: "Verändert das Formatieren meine Werte?",
        answer:
          "Nein. Die Formatierung fügt nur Leerzeichen und Zeilenumbrüche zwischen Token hinzu. Strings, Zahlen und die Schlüsselreihenfolge bleiben genau so, wie sie geparst wurden.",
      },
    ],
  },
  fr: {
    desc: "Reformatez le JSON minifié avec une indentation propre et la coloration syntaxique.",
    whatText:
      "Formatez du JSON minifié ou désordonné avec une indentation lisible directement dans votre navigateur. Choisissez l'indentation de 2 espaces, 4 espaces ou tabulations, consultez la coloration syntaxique, puis copiez ou téléchargez le résultat.",
    whyText:
      "Le JSON minifié issu des exports de bases de données, des réponses d'API et des dumps de configuration est pénible à parcourir pour repérer structure et erreurs. Le reformater avec une indentation cohérente rend les mêmes données rapides à lire et à éditer.",
    features: [
      "Indentations configurables (2 espaces, 4 espaces, tabulations)",
      "Coloration syntaxique vive pour les clés, les chaînes et les nombres",
      "Transferts complets vers le presse-papiers en un clic et téléchargements de sauvegarde",
      "Traitement hors ligne et sécurisé",
    ],
    steps: [
      "Collez le JSON désordonné dans la Saisie JSON brute ou téléversez votre fichier .json brut.",
      "Sélectionnez le Style d'indentation de votre choix.",
      "Copiez la sortie formatée depuis le Résultat formaté ou téléchargez le fichier via Exporter le fichier.",
    ],
    examples: [
      {
        title: "Formats embelli",
        desc: "Style d'indentation de 2 espaces.",
        code: '{\n  "project": "Studio",\n  "active": true\n}',
      },
    ],
    mistakes: [
      "Utiliser des guillemets simples non standard à la place des guillemets doubles standard pour les paramètres de clé.",
    ],
    privacyExplanation:
      "Le formatage, la coloration syntaxique et l'analyse s'exécutent entièrement dans l'onglet de votre navigateur. Votre JSON ne quitte jamais votre appareil et n'est jamais envoyé sur un serveur.",
    faqs: [
      {
        question: "Quels styles d'indentation sont pris en charge ?",
        answer:
          "Vous pouvez choisir 2 espaces, 4 espaces ou tabulations comme délimiteurs, selon les règles de formatage de code de votre équipe.",
      },
      {
        question: "Que se passe-t-il si mon JSON contient une erreur de syntaxe ?",
        answer:
          "Le formateur signale la ligne et la position exacte du caractère posant problème au lieu d'échouer silencieusement, pour que vous puissiez corriger la saisie et relancer.",
      },
      {
        question: "Puis-je téléverser et télécharger des fichiers ?",
        answer:
          "Oui. Chargez un fichier .json brut depuis votre appareil, formatez-le, puis copiez le résultat ou téléchargez la sortie embellie.",
      },
      {
        question: "Mon JSON est-il envoyé sur un serveur ?",
        answer:
          "Non. L'analyse, la coloration et le formatage s'exécutent localement dans l'onglet de votre navigateur — rien n'est envoyé nulle part.",
      },
      {
        question: "Comment embeller un fichier .json sans copier-coller ?",
        answer:
          "Utilisez le contrôle de téléversement pour charger votre fichier .json directement, choisissez une taille d'indentation et formatez-le. La sortie embellie peut ensuite être téléchargée en nouveau fichier.",
      },
      {
        question: "L'embellissement modifie-t-il mes valeurs ?",
        answer:
          "Non. Le formatage n'ajoute que des espaces et retours à la ligne entre les tokens. Les chaînes, les nombres et l'ordre des clés restent exactement tels qu'ils ont été analysés.",
      },
    ],
  },
  it: {
    desc: "Riformatta JSON minificato con rientro pulito ed evidenziazione della sintassi.",
    whatText:
      "Formatta JSON minificato o disordinato con rientro leggibile direttamente nel tuo browser. Scegli il rientro a 2 spazi, 4 spazi o tab, guarda l'evidenziazione della sintassi e copia o scarica il risultato.",
    whyText:
      "Il JSON minificato proveniente da export di database, risposte API e dump di configurazione è difficile da scansionare per struttura e errori. Riformattarlo con un rientro coerente rende gli stessi dati veloci da leggere e modificare.",
    features: [
      "Rientri configurabili (2 spazi, 4 spazi, tab)",
      "Colorazione vivace dell'evidenziazione sintattica per chiavi, stringhe e numeri",
      "Trasferimenti completi negli appunti con un clic e download di backup",
      "Elaborazione offline e sicura",
    ],
    steps: [
      "Incolla il JSON disordinato nell'Input JSON grezzo o carica il tuo payload .json grezzo.",
      "Seleziona lo Stile di indentazione che preferisci.",
      "Copia l'output formattato dal Risultato formattato o scarica il file con Esporta file.",
    ],
    examples: [
      {
        title: "Formati abbelliti",
        desc: "Stile di indentazione a 2 spazi.",
        code: '{\n  "project": "Studio",\n  "active": true\n}',
      },
    ],
    mistakes: [
      "Usare virgolette singole non standard al posto delle virgolette doppie standard per i parametri chiave.",
    ],
    privacyExplanation:
      "La formattazione, l'evidenziazione della sintassi e l'analisi avvengono interamente nella scheda del tuo browser. Il tuo JSON non lascia mai il tuo dispositivo e non viene mai caricato su un server.",
    faqs: [
      {
        question: "Quali stili di indentazione sono supportati?",
        answer:
          "Puoi scegliere 2 spazi, 4 spazi o tab come delimitatori, in base alle regole di formattazione del codice del tuo team.",
      },
      {
        question: "Cosa succede se il mio JSON ha un errore di sintassi?",
        answer:
          "Il formattatore segnala la riga e la posizione esatta del carattere del problema invece di fallire silenziosamente, così puoi correggere l'input e rieseguire.",
      },
      {
        question: "Posso caricare e scaricare file?",
        answer:
          "Sì. Carica un file .json grezzo dal tuo dispositivo, formattalo, poi copia il risultato o scarica l'output abbellito.",
      },
      {
        question: "Il mio JSON viene inviato a un server?",
        answer:
          "No. Analisi, evidenziazione e formattazione girano localmente nella scheda del tuo browser — nulla viene caricato da nessuna parte.",
      },
      {
        question: "Come abbellire un file .json senza copiare e incollare?",
        answer:
          "Usa il controllo di caricamento per caricare il tuo file .json direttamente, scegli una dimensione di rientro e formattalo. L'output abbellito può poi essere scaricato come nuovo file.",
      },
      {
        question: "L'abbellimento cambia qualcuno dei miei valori?",
        answer:
          "No. La formattazione aggiunge solo spazi bianchi e a capo tra i token. Stringhe, numeri e ordine delle chiavi restano esattamente come sono stati analizzati.",
      },
    ],
  },
};
