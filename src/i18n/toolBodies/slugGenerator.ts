/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlay for slug-generator (6 locales, 5 FAQs —
 * 2 base entries plus the 3 EXTRA_FAQS boost). Source: src/data.ts
 * "slug-generator" + src/seo/extraFaqs.ts.
 */

import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";

export const overlay: Partial<Record<LocaleCode, ToolBodyOverlay>> = {
  "pt-br": {
    desc: "Transforme um título de página em um slug limpo, em minúsculas e amigável para URL.",
    whatText:
      "Um gerador de slug que transforma manchetes de artigos ou nomes de software em slugs limpos e seguros para URL.",
    whyText:
      "URLs limpas e amigáveis aos mecanismos de busca são uma métrica central da otimização para mecanismos de busca na página. Esta ferramenta permite rascinhar slugs localmente, sem tráfego de rede.",
    features: [
      "Compilação instantânea do slug em tempo real enquanto você digita",
      "Tradução de caracteres acentuados e suporte a Unicode",
      "Opções para forçar minúsculas, remover caracteres especiais e aparar hífens no início e no fim",
      "Indicador de contagem de caracteres para auditar o tamanho ideal do slug",
      "Simulação de prévia do domínio em tempo real",
    ],
    steps: [
      "Digite ou cole sua manchete na Entrada de Manchete Fonte.",
      "Em Parâmetros de Compilação, escolha o Caractere Separador e as opções de caixa, como Forçar Minúsculas.",
      "Acompanhe a prévia do Slug de URL Gerado, atualizada ao vivo abaixo do campo de texto.",
      "Use Copiar Slug para copiar o slug pronto ou exporte sua configuração pelo arquivo .txt.",
    ],
    examples: [
      {
        title: "Conversão de manchete de artigo",
        desc: "Converte um título de post de blog descritivo em um slug de URL otimizado.",
        code: "10 Essential Developer Tools for React in 2026!",
      },
    ],
    mistakes: [
      "Incluir palavras de parada como 'a', 'o' ou 'e', que alongam as URLs desnecessariamente.",
      "Esquecer de substituir caracteres não ASCII ou deixar hífens iniciais intactos.",
    ],
    privacyExplanation:
      "Todo o parsing, a conversão e a renderização acontecem na memória local do seu navegador. Esta ferramenta não envia seus arquivos para os servidores da GainUtility; qualquer processamento externo é informado na própria ferramenta.",
    faqs: [
      {
        question: "O que é um slug de SEO?",
        answer:
          "Um slug de SEO é a parte de uma URL que identifica uma página específica em um formato fácil de ler, geralmente em minúsculas, separando as palavras com hífens.",
      },
      {
        question: "Esta ferramenta suporta caracteres não ingleses?",
        answer:
          "Sim. O modo de normalização Unicode preserva e traduz caracteres de conjuntos acentuados ou de diversas línguas em vez de descartá-los por completo.",
      },
      {
        question: "Como transformar um título em um slug amigável para SEO?",
        answer:
          "Digite ou cole sua manchete e o gerador passa tudo para minúsculas, remove a pontuação, substitui espaços por hífens e aparar separadores sobressalentes — pronto para colar em um campo de URL de CMS.",
      },
      {
        question: "A ferramenta lida com caracteres acentuados e não latinos?",
        answer:
          "Letras latinas acentuadas são transliteradas para suas formas base (é vira e). Outros alfabetos são tratados conforme as regras de separador e limpeza selecionadas, para que o resultado permaneça seguro para URL.",
      },
      {
        question: "Qual deve ser o comprimento de um slug de URL?",
        answer:
          "Mais curto costuma ser melhor para a legibilidade nos resultados de busca: busque algumas palavras descritivas em vez do título completo, descartando palavras dispensáveis que não agregam nada.",
      },
    ],
  },
  id: {
    desc: "Ubah judul halaman menjadi slug yang bersih, huruf kecil, dan ramah URL.",
    whatText:
      "Slug Generator yang mengubah judul artikel atau nama perangkat lunak menjadi slug yang bersih dan aman untuk URL.",
    whyText:
      "URL yang bersih dan ramah mesin pencari adalah metrik inti dari optimisasi mesin pencari di halaman. Alat ini memungkinkan Anda menyusun slug secara lokal tanpa lalu lintas jaringan.",
    features: [
      "Kompilasi slug instan secara langsung saat Anda mengetik",
      "Transliterasi karakter beraksen dan dukungan Unicode",
      "Opsi untuk memaksa huruf kecil, menghapus karakter khusus, dan memangkas tanda hubung di awal/akhir",
      "Indikator jumlah karakter untuk mengaudit panjang slug yang optimal",
      "Simulasi pratinjau domain secara langsung",
    ],
    steps: [
      "Ketik atau tempel judul Anda ke Masukan Judul Sumber.",
      "Di Parameter Kompilasi, pilih Karakter Pemisah dan opsi huruf besar/kecil, seperti Paksakan Huruf Kecil.",
      "Pantau pratinjau Slug URL yang Dihasilkan yang diperbarui langsung di bawah kolom teks.",
      "Gunakan Salin Slug untuk menyalin slug yang selesai atau ekspor konfigurasi Anda lewat file .txt.",
    ],
    examples: [
      {
        title: "Konversi judul artikel",
        desc: "Mengubah judul blog yang deskriptif menjadi slug URL yang dioptimalkan.",
        code: "10 Essential Developer Tools for React in 2026!",
      },
    ],
    mistakes: [
      "Menyertakan kata henti seperti 'yang', 'dan', atau 'di' yang tidak perlu memperpanjang URL.",
      "Lupa mengganti karakter non-ASCII atau membiarkan tanda hubung di awal utuh.",
    ],
    privacyExplanation:
      "Semua parsing, konversi, dan rendering berjalan di memori lokal browser Anda. Alat ini tidak mengirimkan file Anda ke server GainUtility; pemrosesan eksternal apa pun diungkapkan di dalam alat itu sendiri.",
    faqs: [
      {
        question: "Apa itu Slug SEO?",
        answer:
          "Slug SEO adalah bagian URL yang mengidentifikasi halaman tertentu dalam format yang mudah dibaca, biasanya ditulis huruf kecil, dengan kata-kata dipisahkan tanda hubung.",
      },
      {
        question: "Apakah alat ini mendukung karakter non-Inggris?",
        answer:
          "Ya. Mode normalisasi Unicode mempertahankan dan menerjemahkan karakter dari set bahasa beraksen atau beragam, alih-alih membuangnya sepenuhnya.",
      },
      {
        question: "Bagaimana cara mengubah judul menjadi slug ramah SEO?",
        answer:
          "Ketik atau tempel judul Anda dan generator mengubahnya ke huruf kecil, menghapus tanda baca, mengganti spasi dengan tanda hubung, dan memangkas pemisah yang tersisa — siap ditempel ke kolom URL CMS.",
      },
      {
        question: "Apakah alat ini menangani karakter beraksen dan non-Latin?",
        answer:
          "Huruf Latin beraksen ditransliterasi ke bentuk dasarnya (é menjadi e). Aksara lain ditangani sesuai aturan pemisah dan pembersihan yang dipilih agar hasil tetap aman untuk URL.",
      },
      {
        question: "Seberapa panjang slug URL yang ideal?",
        answer:
          "Lebih pendek umumnya lebih baik untuk keterbacaan di hasil pencarian — bidik beberapa kata deskriptif alih-alih judul penuh, dan buang kata pengisi yang tidak menambah arti.",
      },
    ],
  },
  "es-mx": {
    desc: "Convierte un título de página en un slug limpio, en minúsculas y apto para URL.",
    whatText:
      "Un generador de slug que convierte titulares de artículos o nombres de software en slug limpios y aptos para URL.",
    whyText:
      "Las URL limpias y amigables con los buscadores son una métrica central del SEO en la página. Esta herramienta te permite redactar slug localmente, sin tráfico de red.",
    features: [
      "Compilación instantánea del slug en vivo mientras escribes",
      "Transliteración de caracteres acentuados y compatibilidad con Unicode",
      "Opciones para forzar minúsculas, quitar caracteres especiales y eliminar guiones al inicio y al final",
      "Indicador de recuento de caracteres para auditar la longitud óptima del slug",
      "Simulación de vista previa del dominio en vivo",
    ],
    steps: [
      "Escribe o pega tu titular en la Entrada de titular fuente.",
      "En Parámetros de compilación, elige el Carácter separador y las opciones de mayúsculas, como Forzar minúsculas.",
      "Observa la vista previa del Slug de URL generado, actualizada en vivo debajo del campo de texto.",
      "Usa Copiar slug para copiar el slug terminado o exporta tu configuración con el archivo .txt.",
    ],
    examples: [
      {
        title: "Conversión de titular de artículo",
        desc: "Convierte un título de blog descriptivo en un slug de URL optimizado.",
        code: "10 Essential Developer Tools for React in 2026!",
      },
    ],
    mistakes: [
      "Incluir palabras vacías como 'el', 'la' o 'y' que alargan las URL sin necesidad.",
      "Olvidar reemplazar caracteres no ASCII o dejar intactos los guiones iniciales.",
    ],
    privacyExplanation:
      "Todo el parsing, la conversión y el renderizado ocurren en la memoria local de tu navegador. Esta herramienta no envía tus archivos a los servidores de GainUtility; cualquier procesamiento externo se indica en la propia herramienta.",
    faqs: [
      {
        question: "¿Qué es un slug de SEO?",
        answer:
          "Un slug de SEO es la parte de una URL que identifica una página concreta en un formato fácil de leer, escrito normalmente en minúsculas y separando las palabras con guiones.",
      },
      {
        question: "¿Esta herramienta admite caracteres no ingleses?",
        answer:
          "Sí. El modo de normalización Unicode conserva y traduce caracteres de conjuntos acentuados o de diversos idiomas en lugar de descartarlos por completo.",
      },
      {
        question: "¿Cómo convierto un título en un slug apto para SEO?",
        answer:
          "Escribe o pega tu titular y el generador lo pasa a minúsculas, elimina la puntuación, reemplaza los espacios por guiones y recorta separadores sueltos — listo para pegar en un campo de URL de un CMS.",
      },
      {
        question: "¿Maneja caracteres acentuados y no latinos?",
        answer:
          "Las letras latinas acentuadas se transliteran a sus formas base (é se convierte en e). Las demás escrituras se tratan según las reglas de separador y limpieza seleccionadas para que el resultado siga siendo apto para URL.",
      },
      {
        question: "¿De qué longitud debe ser un slug de URL?",
        answer:
          "Más corto suele ser mejor para la legibilidad en los resultados de búsqueda: apunta a unas pocas palabras descriptivas en lugar del titular completo, descartando palabras de relleno que no aportan nada.",
      },
    ],
  },
  de: {
    desc: "Verwandeln Sie einen Seitentitel in einen sauberen, klein geschriebenen, URL-freundlichen Slug.",
    whatText:
      "Ein Slug-Generator, der Artikelschlagzeilen oder Softwarenamen in saubere, URL-sichere Slugs verwandelt.",
    whyText:
      "Saubere, suchmaschinenfreundliche URLs sind eine zentrale Metrik der Onpage-Suchmaschinenoptimierung. Dieses Tool ermöglicht das Entwerfen von Slugs lokal, ohne Netzwerkverkehr.",
    features: [
      "Sofortige Live-Kompilierung des Slugs beim Tippen",
      "Umwandlung akzentuierter Zeichen und Unicode-Unterstützung",
      "Optionen zur Kleinschreibung, zum Entfernen von Sonderzeichen und zum Streichen von Anfangs- und End-Bindestrichen",
      "Zeichenzähler zur Prüfung der optimalen Slug-Länge",
      "Live-Simulation der Domain-Vorschau",
    ],
    steps: [
      "Geben Sie Ihre Schlagzeile in die Quell-Schlagzeilen-Eingabe ein oder fügen Sie sie dort ein.",
      "Wählen Sie unter Kompilierungsparameter das Trennzeichen und die Groß-/Kleinschreibungsoptionen, z. B. Kleinschreibung erzwingen.",
      "Beobachten Sie die Live-Vorschau des Generierten URL-Slugs unterhalb des Textfelds.",
      "Verwenden Sie Slug kopieren, um den fertigen Slug zu kopieren, oder exportieren Sie Ihre Konfiguration als .txt-Datei.",
    ],
    examples: [
      {
        title: "Konvertierung einer Artikelschlagzeile",
        desc: "Wandelt einen aussagekräftigen Blogbeitragstitel in einen optimierten URL-Slug um.",
        code: "10 Essential Developer Tools for React in 2026!",
      },
    ],
    mistakes: [
      "Füllwörter wie 'der', 'die' oder 'und' einbeziehen, die URLs unnötig verlängern.",
      "Nicht-ASCII-Zeichen nicht ersetzen oder führende Bindestriche stehen lassen.",
    ],
    privacyExplanation:
      "Sämtliches Parsing, Konvertieren und Rendern läuft im lokalen Arbeitsspeicher Ihres Browsers. Dieses Tool sendet Ihre Dateien nicht an die Server von GainUtility; externe Verarbeitung wird im Tool selbst offengelegt.",
    faqs: [
      {
        question: "Was ist ein SEO-Slug?",
        answer:
          "Ein SEO-Slug ist der Teil einer URL, der eine bestimmte Seite in leicht lesbarer Form identifiziert, typischerweise klein geschrieben und mit Bindestrichen zwischen den Wörtern.",
      },
      {
        question: "Unterstützt dieses Tool Nicht-Englische Zeichen?",
        answer:
          "Ja. Der Unicode-Normalisierungsmodus bewahrt und übersetzt Zeichen aus akzentuierten oder vielfältigen Sprachsets, anstatt sie vollständig zu verwerfen.",
      },
      {
        question: "Wie mache ich aus einem Titel einen SEO-freundlichen Slug?",
        answer:
          "Geben Sie Ihre Schlagzeile ein oder fügen Sie sie ein — der Generator kleinschreibt sie, entfernt Satzzeichen, ersetzt Leerzeichen durch Bindestriche und trimmt übrig gebliebene Trennzeichen. Danach ist der Slug bereit zum Einfügen in ein CMS-URL-Feld.",
      },
      {
        question: "Werden akzentuierte und nicht-lateinische Zeichen verarbeitet?",
        answer:
          "Akzentuierte lateinische Buchstaben werden in ihre Grundformen transliteriert (é wird zu e). Weitere Schriftzeichen werden gemäß den gewählten Trenn- und Bereinigungsregeln behandelt, damit das Ergebnis URL-sicher bleibt.",
      },
      {
        question: "Wie lang sollte ein URL-Slug sein?",
        answer:
          "Kürzer ist für die Lesbarkeit in Suchergebnissen meist besser — zielen Sie auf ein paar beschreibende Wörter statt auf die ganze Schlagzeile und lassen Sie Füllwörter weg, wenn sie nichts beitragen.",
      },
    ],
  },
  fr: {
    desc: "Convertissez un titre de page en slug propre, en minuscules et adapté aux URL.",
    whatText:
      "Un générateur de slug qui transforme les titres d'articles ou les noms de logiciels en slugs propres et adaptés aux URL.",
    whyText:
      "Des URL propres et adaptées aux moteurs de recherche sont une métrique centrale du référencement on-page. Cet outil vous permet de rédiger des slug localement, sans trafic réseau.",
    features: [
      "Compilation instantanée du slug en direct pendant la frappe",
      "Translittération des caractères accentués et prise en charge d'Unicode",
      "Options pour forcer les minuscules, supprimer les caractères spéciaux et retirer les tirets de début et de fin",
      "Indicateur de nombre de caractères pour vérifier la longueur optimale du slug",
      "Simulation d'aperçu du domaine en direct",
    ],
    steps: [
      "Saisissez ou collez votre titre dans la Saisie du titre source.",
      "Dans les Paramètres de compilation, choisissez le Caractère de séparation et les options de casse, comme Forcer les minuscules.",
      "Suivez l'aperçu en direct du Slug d'URL généré, mis à jour sous le champ de texte.",
      "Utilisez Copier le slug pour copier le slug finalisé ou exportez votre configuration via le fichier .txt.",
    ],
    examples: [
      {
        title: "Conversion d'un titre d'article",
        desc: "Convertissez un titre de blog descriptif en slug d'URL optimisé.",
        code: "10 Essential Developer Tools for React in 2026!",
      },
    ],
    mistakes: [
      "Inclure des mots vides comme « le », « la » ou « et » qui allongent inutilement les URL.",
      "Oublier de remplacer les caractères non ASCII ou de laisser les tirets initiaux intacts.",
    ],
    privacyExplanation:
      "Toutes les analyses, les conversions et les rendus s'exécutent dans la mémoire locale de votre navigateur. Cet outil n'envoie jamais vos fichiers vers les serveurs de GainUtility ; tout traitement externe est indiqué dans l'outil lui-même.",
    faqs: [
      {
        question: "Qu'est-ce qu'un slug SEO ?",
        answer:
          "Un slug SEO est la partie d'une URL qui identifie une page précise dans un format facile à lire, généralement en minuscules, avec les mots séparés par des tirets.",
      },
      {
        question: "Cet outil prend-il en charge les caractères non anglais ?",
        answer:
          "Oui. Le mode de normalisation Unicode conserve et traduit les caractères provenant de jeux accentués ou de langues diverses au lieu de les écarter complètement.",
      },
      {
        question: "Comment convertir un titre en slug adapté au SEO ?",
        answer:
          "Saisissez ou collez votre titre : le générateur le met en minuscules, supprime la ponctuation, remplace les espaces par des tirets et écarte les séparateurs résiduels — prêt à coller dans un champ d'URL de CMS.",
      },
      {
        question: "Gère-t-elle les caractères accentués et non latins ?",
        answer:
          "Les lettres latines accentuées sont translittérées vers leur forme de base (é devient e). Les autres alphabets sont traités selon les règles de séparation et de nettoyage choisies afin que le résultat reste adapté aux URL.",
      },
      {
        question: "Quelle longueur doit avoir un slug d'URL ?",
        answer:
          "Plus court se lit généralement mieux dans les résultats de recherche — visez quelques mots descriptifs plutôt que le titre entier, en laissant tomber les mots de remplissage qui n'apportent rien.",
      },
    ],
  },
  it: {
    desc: "Trasforma un titolo di pagina in uno slug pulito, minuscolo e adatto alle URL.",
    whatText:
      "Un generatore di slug che trasforma i titoli di articoli o i nomi di software in slug puliti e sicuri per le URL.",
    whyText:
      "URL pulite e amichevoli per i motori di ricerca sono una metrica centrale della SEO on-page. Questo strumento ti permette di bozzare gli slug in locale, senza traffico di rete.",
    features: [
      "Compilazione istantanea dello slug in tempo reale mentre scrivi",
      "Conversione dei caratteri accentati e supporto di Unicode",
      "Opzioni per forzare le minuscole, rimuovere i caratteri speciali e togliere i trattini iniziali e finali",
      "Indicatore del conteggio caratteri per verificare la lunghezza ottimale dello slug",
      "Simulazione di anteprima del dominio in tempo reale",
    ],
    steps: [
      "Digita o incolla il tuo titolo nell'Input titolo sorgente.",
      "Nei Parametri di compilazione, scegli il Carattere separatore e le opzioni di maiuscole/minuscole, come Forza minuscole.",
      "Osserva l'anteprima dello Slug URL generato, aggiornata in tempo reale sotto il campo di testo.",
      "Usa Copia slug per copiare lo slug finito o esporta la tua configurazione nel file .txt.",
    ],
    examples: [
      {
        title: "Conversione del titolo di articolo",
        desc: "Converte un titolo di blog descrittivo in uno slug URL ottimizzato.",
        code: "10 Essential Developer Tools for React in 2026!",
      },
    ],
    mistakes: [
      "Includere parole vuote come «il», «la» o «e» che allungano inutilmente le URL.",
      "Dimenticare di sostituire i caratteri non ASCII o lasciare intatti i trattini iniziali.",
    ],
    privacyExplanation:
      "Tutte le analisi, le conversioni e il rendering avvengono nella memoria locale del tuo browser. Questo strumento non invia i tuoi file ai server di GainUtility; qualsiasi elaborazione esterna è indicata nello strumento stesso.",
    faqs: [
      {
        question: "Cos'è uno slug SEO?",
        answer:
          "Uno slug SEO è la parte di una URL che identifica una pagina specifica in un formato facile da leggere, solitamente in minuscole, con le parole separate da trattini.",
      },
      {
        question: "Questo strumento supporta caratteri non inglesi?",
        answer:
          "Sì. La modalità di normalizzazione Unicode conserva e traduce i caratteri di set accentati o di lingue diverse invece di scartarli del tutto.",
      },
      {
        question: "Come trasformo un titolo in uno slug SEO-friendly?",
        answer:
          "Digita o incolla il tuo titolo e il generatore lo converte in minuscole, rimuove la punteggiatura, sostituisce gli spazi con i trattini e rifinisce i separatori superflui — pronto da incollare in un campo URL di un CMS.",
      },
      {
        question: "Gestisce caratteri accentati e non latini?",
        answer:
          "Le lettere latine accentate sono trasliterate nelle loro forme base (é diventa e). Gli altri alfabeti sono gestiti secondo le regole di separatore e pulizia scelte, così il risultato resta sicuro per le URL.",
      },
      {
        question: "Quanto deve essere lungo uno slug URL?",
        answer:
          "Più breve si legge generalmente meglio nei risultati di ricerca: punta a qualche parola descrittiva invece dell'intero titolo, scartando le parole riempitive che non aggiungono nulla.",
      },
    ],
  },
};
