/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlay for youtube-keyword-explorer (5 locales —
 * pt-br, id, es-mx, fr, it; NO German, matching the tool's UI dictionary
 * and localized-name coverage), 4 FAQs each. Source:
 * src/seo/extraCreator.ts CREATOR_SEO "youtube-keyword-explorer"
 * (steps/what/why/features/limitations/faqs/privacy), registry desc from
 * src/toolsRegistry.tsx. No examples in the English entry, so omitted;
 * mistakes is empty because the English source has none.
 */

import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";

export const overlay: Partial<Record<LocaleCode, ToolBodyOverlay>> = {
  "pt-br": {
    desc: "Encontre frases reais de busca para o seu tópico com o autocomplete ao vivo do YouTube.",
    whatText:
      "Para cada pesquisa, um proxy do Cloudflare consulta o autocomplete do YouTube por sugestões ao vivo usando o idioma e a região selecionados, e depois combina os resultados do termo inicial com as expansões opcionais de A–Z. As palavras-chave são agrupadas por padrão textual, ordenadas por um sinal relativo baseado em quão cedo e com que frequência cada uma apareceu, e exportadas para a área de transferência ou CSV.",
    whyText:
      "O autocomplete do YouTube reflete frases que as pessoas realmente pesquisam. Ancorar seu título, sua descrição e suas tags nessas frases observadas mantém você próximo da linguagem real dos espectadores — sem depender de volumes estimados que nenhuma ferramenta pode reportar com honestidade.",
    features: [
      "Sugestões ao vivo do autocomplete do YouTube — reais, não estimadas",
      "Seletor de mercado com segmentação por idioma/região",
      "Expansão de A–Z que mostra com que frequência as palavras-chave aparecem",
      "Filtros por padrão e um ranking transparente de sinal relativo",
      "Seleção, cópia, exportação em CSV e construtor de tags de 500 caracteres",
    ],
    steps: [
      "Digite um termo inicial para o tópico do seu vídeo.",
      "Escolha um mercado (o idioma/região cujas sugestões de busca você quer).",
      "Opcionalmente, expanda de A–Z para revelar mais palavras-chave e ver quais aparecem com mais frequência.",
      "Filtre por padrão, compare o sinal relativo e selecione as palavras-chave desejadas.",
      "Copie como lista, baixe um CSV ou monte uma lista de tags de 500 caracteres.",
    ],
    mistakes: [],
    privacyExplanation:
      "Os termos iniciais são enviados ao proxy de API da GainUtility para buscar sugestões ao vivo do autocomplete do YouTube. Buscas e resultados não são armazenados, e nenhuma conta nem chave de API é necessária.",
    limitations: [
      "Sugere apenas frases — não mostra volumes de busca, dificuldade nem estimativas de ranking",
      "As sugestões são um instantâneo no momento da consulta e podem mudar",
      "Tags têm peso pequeno no ranking — títulos e miniaturas importam mais",
    ],
    faqs: [
      {
        question: "De onde vêm os dados das palavras-chave?",
        answer:
          "Do autocomplete ao vivo do YouTube: em cada pesquisa, a ferramenta consulta o endpoint de sugestões do YouTube pelo proxy de API da GainUtility, usando o idioma e a região que você selecionou. As respostas são sugestões reais vistas na busca do YouTube.",
      },
      {
        question: "Vocês mostram o volume de busca exato de uma palavra-chave?",
        answer:
          "Não — e isso é deliberado. Volumes de busca públicos são estimativas e números inventados te induziriam a erro. A coluna Sinal relativo compara cada palavra-chave dentro do seu conjunto de resultados usando a posição e em quantas listas ela apareceu.",
      },
      {
        question: "Minha pesquisa é armazenada ou enviada para algum lugar inesperado?",
        answer:
          "Apenas o termo inicial que você digitou é enviado ao proxy da GainUtility para buscar sugestões do YouTube. Buscas e resultados não são armazenados e nenhuma conta está envolvida.",
      },
      {
        question: "Tags ainda são importantes para o YouTube?",
        answer:
          "Moderadamente. Tags ajudam na desambiguação e em erros de digitação, mas pesam muito menos que títulos, miniaturas e tempo de exibição. O construtor de tags respeita o campo de 500 caracteres do YouTube.",
      },
    ],
  },
  id: {
    desc: "Temukan frasa pencarian nyata untuk topik Anda dengan autocomplete YouTube langsung.",
    whatText:
      "Untuk setiap pencarian, proxy Cloudflare menanyakan autocomplete YouTube untuk saran langsung menggunakan bahasa dan wilayah yang dipilih, lalu menggabungkan hasil kata kunci awal dengan ekspansi A–Z opsional. Kata kunci dikelompokkan berdasarkan pola teks, diurutkan berdasarkan sinyal relatif dari seberapa awal dan seberapa sering masing-masing muncul, dan dikeluarkan ke papan klip atau CSV.",
    whyText:
      "Autocomplete YouTube mencerminkan frasa yang benar-benar dicari orang. Menjangkar judul, deskripsi, dan tag Anda pada frasa yang teramati itu menjaga Anda tetap dekat dengan bahasa penonton yang sebenarnya — tanpa bergantung pada volume perkiraan yang tidak bisa dilaporkan dengan jujur oleh alat mana pun.",
    features: [
      "Saran autocomplete YouTube langsung — nyata, bukan perkiraan",
      "Pemilih pasar dengan penargetan bahasa/wilayah",
      "Ekspansi A–Z yang menunjukkan seberapa sering kata kunci muncul",
      "Filter pola dan peringkat sinyal relatif yang transparan",
      "Pemilihan, salin, ekspor CSV, dan pembuat tag 500 karakter",
    ],
    steps: [
      "Masukkan kata kunci awal untuk topik video Anda.",
      "Pilih pasar (bahasa/wilayah yang saran pencariannya Anda inginkan).",
      "Opsionalnya, ekspansi A–Z untuk mengungkap lebih banyak kata kunci dan melihat mana yang paling sering muncul.",
      "Filter berdasarkan pola, bandingkan sinyal relatif, dan pilih kata kunci yang Anda inginkan.",
      "Salin sebagai daftar, unduh CSV, atau susun daftar tag 500 karakter.",
    ],
    mistakes: [],
    privacyExplanation:
      "Kata kunci awal dikirim ke proxy API GainUtility untuk mengambil saran autocomplete YouTube langsung. Pencarian dan hasil tidak disimpan, dan tidak diperlukan akun maupun kunci API.",
    limitations: [
      "Hanya menyarankan frasa — tidak menampilkan volume pencarian, kesulitan, maupun perkiraan peringkat",
      "Saran adalah snapshot pada saat pengambilan dan bisa berubah",
      "Tag hanya masukan peringkat kecil — judul dan thumbnail lebih penting",
    ],
    faqs: [
      {
        question: "Dari mana data kata kunci ini berasal?",
        answer:
          "Dari autocomplete YouTube yang langsung: setiap pencarian menanyakan endpoint saran YouTube melalui proxy API GainUtility, dengan bahasa dan wilayah yang Anda pilih. Jawabannya adalah saran nyata yang muncul di pencarian YouTube.",
      },
      {
        question: "Apakah Anda menampilkan volume pencarian persis untuk sebuah kata kunci?",
        answer:
          "Tidak — dan itu disengaja. Volume pencarian publik adalah perkiraan, dan angka karangan akan menyesatkan Anda. Kolom Sinyal relatif membandingkan setiap kata kunci dalam kumpulan hasil Anda berdasarkan posisi dan di berapa daftar kata kunci itu muncul.",
      },
      {
        question: "Apakah pencarian saya disimpan atau dikirim ke tempat yang tidak terduga?",
        answer:
          "Hanya kata kunci awal yang Anda ketik yang dikirim ke proxy GainUtility untuk mengambil saran dari YouTube. Pencarian dan hasil tidak disimpan, dan tidak ada akun yang terlibat.",
      },
      {
        question: "Apakah tag masih penting untuk YouTube?",
        answer:
          "Secukupnya. Tag membantu mengatasi ambiguitas dan salah ketik, tetapi bobotnya jauh lebih kecil daripada judul, thumbnail, dan waktu tonton. Pembuat tag tetap berada dalam batas 500 karakter YouTube.",
      },
    ],
  },
  "es-mx": {
    desc: "Encuentra frases de búsqueda reales para tu tema con el autocompletado en vivo de YouTube.",
    whatText:
      "En cada búsqueda, un proxy de Cloudflare consulta el autocompletado de YouTube por sugerencias en vivo usando el idioma y la región seleccionados, y luego combina los resultados del término inicial con las expansiones opcionales de A–Z. Las palabras clave se agrupan por patrón de texto, se ordenan por una señal relativa basada en qué tan pronto y con qué frecuencia apareció cada una, y se exportan al portapapeles o a CSV.",
    whyText:
      "El autocompletado de YouTube refleja frases que la gente realmente busca. Anclar tu título, tu descripción y tus etiquetas a esas frases observadas te mantiene cerca del lenguaje real de los espectadores — sin depender de volúmenes estimados que ninguna herramienta puede reportar con honestidad.",
    features: [
      "Sugerencias en vivo del autocompletado de YouTube — reales, no estimadas",
      "Selector de mercado con segmentación por idioma/región",
      "Expansión de A–Z que muestra con qué frecuencia aparecen las palabras clave",
      "Filtros por patrón y un ranking transparente de señal relativa",
      "Selección, copia, exportación a CSV y constructor de etiquetas de 500 caracteres",
    ],
    steps: [
      "Escribe un término inicial para el tema de tu video.",
      "Elige un mercado (el idioma/región cuyas sugerencias de búsqueda quieres).",
      "Opcionalmente expande de A–Z para descubrir más palabras clave y ver cuáles aparecen más.",
      "Filtra por patrón, compara la señal relativa y selecciona las palabras clave que quieras.",
      "Cópialas como lista, descarga un CSV o arma una lista de etiquetas de 500 caracteres.",
    ],
    mistakes: [],
    privacyExplanation:
      "Los términos iniciales se envían al proxy de API de GainUtility para obtener sugerencias en vivo del autocompletado de YouTube. Las búsquedas y los resultados no se guardan, y no se necesita ninguna cuenta ni clave de API.",
    limitations: [
      "Solo sugiere frases — no muestra volúmenes de búsqueda, dificultad ni estimaciones de posicionamiento",
      "Las sugerencias son una instantánea al momento de la consulta y pueden cambiar",
      "Las etiquetas son un factor de posicionamiento menor — títulos y miniaturas importan más",
    ],
    faqs: [
      {
        question: "¿De dónde provienen los datos de palabras clave?",
        answer:
          "Del autocompletado en vivo de YouTube: en cada búsqueda la herramienta consulta el endpoint de sugerencias de YouTube a través del proxy de API de GainUtility, con el idioma y la región que elegiste. Las respuestas son sugerencias reales vistas en la búsqueda de YouTube.",
      },
      {
        question: "¿Muestran el volumen de búsqueda exacto de una palabra clave?",
        answer:
          "No — y es deliberado. Los volúmenes de búsqueda públicos son estimaciones y los números inventados te inducirían a error. La columna Señal relativa compara cada palabra clave dentro de tu conjunto de resultados usando la posición y en cuántas listas apareció.",
      },
      {
        question: "¿Se guarda mi búsqueda o se envía a algún lugar inesperado?",
        answer:
          "Solo el término inicial que escribiste se envía al proxy de GainUtility para poder obtener sugerencias de YouTube. Las búsquedas y los resultados no se guardan, y no está involucrada ninguna cuenta.",
      },
      {
        question: "¿Siguen siendo importantes las etiquetas en YouTube?",
        answer:
          "Moderadamente. Las etiquetas ayudan con la ambigüedad y los errores de escritura, pero pesan mucho menos que los títulos, las miniaturas y el tiempo de reproducción. El constructor de etiquetas se mantiene dentro del campo de 500 caracteres de YouTube.",
      },
    ],
  },
  fr: {
    desc: "Trouvez de vraies expressions de recherche pour votre sujet grâce à l'autocomplétion YouTube en direct.",
    whatText:
      "Pour chaque recherche, un proxy Cloudflare interroge l'autocomplétion YouTube pour obtenir des suggestions en direct dans la langue et la région sélectionnées, puis fusionne les résultats du terme de départ avec les expansions facultatives de A–Z. Les mots-clés sont regroupés par motif textuel, classés par un signal relatif fondé sur leur apparition précoce et leur fréquence, puis exportés vers le presse-papiers ou en CSV.",
    whyText:
      "L'autocomplétion YouTube reflète les expressions réellement recherchées. Ancrer votre titre, votre description et vos balises sur ces expressions observées vous garde proche du langage réel des spectateurs — sans dépendre de volumes estimés qu'aucun outil ne peut honnêtement rapporter.",
    features: [
      "Suggestions en direct de l'autocomplétion YouTube — réelles, pas estimées",
      "Sélecteur de marché avec ciblage langue/région",
      "Expansion A–Z indiquant la fréquence d'apparition des mots-clés",
      "Filtres par motif et classement transparent du signal relatif",
      "Sélection, copie, export CSV et constructeur de balises de 500 caractères",
    ],
    steps: [
      "Saisissez un terme de départ pour le sujet de votre vidéo.",
      "Choisissez un marché (la langue/région dont vous voulez les suggestions de recherche).",
      "Le cas échéant, développez de A à Z pour faire émerger plus de mots-clés et voir lesquels apparaissent le plus.",
      "Filtrez par motif, comparez le signal relatif et sélectionnez les mots-clés souhaités.",
      "Copiez-les en liste, téléchargez un CSV ou construisez une liste de balises de 500 caractères.",
    ],
    mistakes: [],
    privacyExplanation:
      "Les termes de départ sont envoyés au proxy API de GainUtility pour récupérer les suggestions en direct de l'autocomplétion YouTube. Recherches et résultats ne sont pas stockés, et aucun compte ni clé API n'est nécessaire.",
    limitations: [
      "Ne suggère que des expressions — n'affiche aucun volume de recherche, aucune difficulté ni estimation de classement",
      "Les suggestions sont un instantané au moment de la récupération et peuvent changer",
      "Les balises n'ont qu'un poids mineur dans le classement — titres et miniatures comptent davantage",
    ],
    faqs: [
      {
        question: "D'où viennent les données de mots-clés ?",
        answer:
          "De l'autocomplétion YouTube en direct : à chaque recherche, l'outil interroge le point de terminaison de suggestions de YouTube, via le proxy API de GainUtility, avec la langue et la région choisies. Les réponses sont de vraies suggestions visibles dans la recherche YouTube.",
      },
      {
        question: "Affichez-vous le volume de recherche exact d'un mot-clé ?",
        answer:
          "Non — et c'est délibéré. Les volumes de recherche publics sont des estimations, et des chiffres inventés vous induiraient en erreur. La colonne Signal relatif compare chaque mot-clé à l'intérieur de votre ensemble de résultats grâce à sa position et aux listes où il est apparu.",
      },
      {
        question: "Ma recherche est-elle stockée ou envoyée quelque part d'inattendu ?",
        answer:
          "Seul le terme de départ que vous avez saisi est envoyé au proxy de GainUtility afin de récupérer les suggestions de YouTube. Recherches et résultats ne sont pas stockés, et aucun compte n'est impliqué.",
      },
      {
        question: "Les balises sont-elles encore importantes pour YouTube ?",
        answer:
          "Modérément. Les balises aident à lever les ambiguïtés et les fautes de frappe, mais pèsent bien moins que les titres, les miniatures et le temps de visionnage. Le constructeur de balises reste dans le champ de 500 caractères de YouTube.",
      },
    ],
  },
  it: {
    desc: "Trova frasi di ricerca reali per il tuo argomento con il completamento automatico live di YouTube.",
    whatText:
      "A ogni ricerca, un proxy Cloudflare interroga il completamento automatico di YouTube per suggerimenti live usando lingua e regione selezionate, poi fonde i risultati del termine iniziale con le espansioni opzionali da A–Z. Le parole chiave vengono raggruppate per schema testuale, ordinate da un segnale relativo basato su quanto presto e quanto spesso ciascuna è comparsa, e inserite negli appunti o in CSV.",
    whyText:
      "Il completamento automatico di YouTube riflette le frasi che le persone cercano davvero. Ancorare titolo, descrizione e tag a quelle frasi osservate ti tiene vicino al linguaggio reale degli spettatori — senza affidarti a volumi stimati che nessuno strumento può riportare onestamente.",
    features: [
      "Suggerimenti live del completamento automatico di YouTube — reali, non stimati",
      "Selettore di mercato con targeting lingua/regione",
      "Espansione A–Z che mostra quanto spesso emergono le parole chiave",
      "Filtri per schema e classifica trasparente del segnale relativo",
      "Selezione, copia, esportazione CSV e costruttore di tag da 500 caratteri",
    ],
    steps: [
      "Inserisci un termine iniziale per l'argomento del tuo video.",
      "Scegli un mercato (la lingua/regione di cui vuoi i suggerimenti di ricerca).",
      "Opzionalmente espandi da A a Z per far emergere più parole chiave e vedere quali compaiono più spesso.",
      "Filtra per schema, confronta il segnale relativo e seleziona le parole chiave che vuoi.",
      "Copianle in un elenco, scarica un CSV o costruisci un elenco di tag da 500 caratteri.",
    ],
    mistakes: [],
    privacyExplanation:
      "I termini iniziali vengono inviati al proxy API di GainUtility per recuperare i suggerimenti live del completamento automatico di YouTube. Ricerche e risultati non vengono salvati, e non servono né account né chiave API.",
    limitations: [
      "Suggerisce solo frasi — non mostra volumi di ricerca, difficoltà né stime di ranking",
      "I suggerimenti sono uno snapshot al momento del recupero e possono cambiare",
      "I tag sono un contributo minore al ranking — titoli e miniature contano di più",
    ],
    faqs: [
      {
        question: "Da dove provengono i dati delle parole chiave?",
        answer:
          "Dal completamento automatico live di YouTube: a ogni ricerca lo strumento interroga l'endpoint di suggerimenti di YouTube, tramite il proxy API di GainUtility, con la lingua e la regione che hai scelto. Le risposte sono suggerimenti reali visti nella ricerca di YouTube.",
      },
      {
        question: "Mostrate il volume di ricerca esatto di una parola chiave?",
        answer:
          "No — ed è voluto. I volumi di ricerca pubblici sono stime e numeri inventati vi induirebbero in errore. La colonna Segnale relativo confronta ogni parola chiave all'interno del vostro set di risultati usando la posizione e in quanti elenchi è comparsa.",
      },
      {
        question: "La mia ricerca viene salvata o inviata da qualche parte inaspettata?",
        answer:
          "Solo il termine iniziale che hai digitato viene inviato al proxy di GainUtility per recuperare i suggerimenti da YouTube. Ricerche e risultati non vengono salvati e non è coinvolto alcun account.",
      },
      {
        question: "I tag sono ancora importanti per YouTube?",
        answer:
          "Moderatamente. I tag aiutano con i significati ambiguhi e gli errori di battitura, ma pesano molto meno di titoli, miniature e tempo di visualizzazione. Il costruttore di tag resta nel campo di 500 caratteri di YouTube.",
      },
    ],
  },
};
