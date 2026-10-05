/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Per-tool UI dictionary for the YouTube Keyword Explorer
 * (youtube-keyword-explorer). The tool is wired for the 7 supported locales
 * (en, pt-br, id, es-mx, es-co, fr, it). German (de) is intentionally not
 * included — the project owner has not chosen to localize this tool in
 * German — so German pages keep the English fallthrough and are gated out of
 * the sitemap/hreflang by isLocalizedView.
 *
 * Wording rule: this tool reports only what YouTube autocomplete actually
 * returns. Labels say "relative signal", "surfaced in N lists" and "source:
 * YouTube autocomplete" — never volumes, difficulty or invented scores.
 */
import { registerToolUI } from "../toolUi";

registerToolUI("youtube-keyword-explorer", {
  eyebrow: { en: "Creator Studio", "pt-br": "Estúdio de Criação", id: "Studio Kreator", "es-mx": "Estudio de creadores", "es-co": "Estudio de creadores", fr: "Studio de création", it: "Studio Creator" },
  heading: { en: "YouTube Keyword Explorer", "pt-br": "Explorador de palavras-chave do YouTube", id: "Penjelajah Kata Kunci YouTube", "es-mx": "Explorador de palabras clave de YouTube", "es-co": "Explorador de palabras clave de YouTube", fr: "Explorateur de mots-clés YouTube", it: "Esploratore di parole chiave YouTube" },
  sub: {
    en: "Find real phrases YouTube suggests for your video topic.",
    "pt-br": "Encontre frases reais que o YouTube sugere para o seu tópico de vídeo.",
    id: "Temukan frasa nyata yang disarankan YouTube untuk topik video Anda.",
    "es-mx": "Encuentra frases reales que YouTube sugiere para el tema de tu video.",
    "es-co": "Encuentra frases reales que YouTube sugiere para el tema de tu video.",
    fr: "Trouvez les vraies phrases que YouTube suggère pour votre sujet de vidéo.",
    it: "Trova le vere frasi che YouTube suggerisce per l'argomento del tuo video.",
  },

  // First screen
  firstScreenQuestion: { en: "What are you making a video about?", "pt-br": "Sobre o que é o seu vídeo?", id: "Tentang apa video Anda?", "es-mx": "¿Sobre qué va tu video?", "es-co": "¿Sobre qué va tu video?", fr: "De quoi parle votre vidéo ?", it: "Di cosa parla il tuo video?" },
  videoTopicLabel: { en: "Video topic", "pt-br": "Tópico do vídeo", id: "Topik video", "es-mx": "Tema del video", "es-co": "Tema del video", fr: "Sujet de la vidéo", it: "Argomento del video" },
  placeholder: { en: "e.g. how to make sourdough bread", "pt-br": "ex.: como fazer pão de fermentação natural", id: "mis.: cara membuat roti sourdough", "es-mx": "ej.: cómo hacer pan de masa madre", "es-co": "ej.: cómo hacer pan de masa madre", fr: "ex. : comment faire du pain au levain", it: "es.: come fare il pane al lievito madre" },
  exampleChips: { en: "YouTube Shorts ideas|home workout|SSC preparation", "pt-br": "Ideias para YouTube Shorts|treino em casa|preparação para SSC", id: "Ide YouTube Shorts|latihan di rumah|persiapan SSC", "es-mx": "Ideas para YouTube Shorts|entrenamiento en casa|preparación SSC", "es-co": "Ideas para YouTube Shorts|entrenamiento en casa|preparación SSC", fr: "Idées pour YouTube Shorts|entraînement à la maison|préparation SSC", it: "Idee per YouTube Shorts|allenamento a casa|preparazione SSC" },
  findKeywordsBtn: { en: "Find YouTube Keywords", "pt-br": "Encontrar palavras-chave do YouTube", id: "Temukan Kata Kunci YouTube", "es-mx": "Buscar palabras clave de YouTube", "es-co": "Buscar palabras clave de YouTube", fr: "Trouver les mots-clés YouTube", it: "Trova le parole chiave YouTube" },

  // Market settings
  marketLabel: { en: "Market", "pt-br": "Mercado", id: "Pasar", "es-mx": "Mercado", "es-co": "Mercado", fr: "Marché", it: "Mercato" },
  marketSelect: { en: "{country} • {language}", "pt-br": "{country} • {language}", id: "{country} • {language}", "es-mx": "{country} • {language}", "es-co": "{country} • {language}", fr: "{country} • {language}", it: "{country} • {language}" },
  marketAdvanced: { en: "Advanced market settings", "pt-br": "Configurações avançadas de mercado", id: "Pengaturan pasar lanjutan", "es-mx": "Configuración avanzada de mercado", "es-co": "Configuración avanzada de mercado", fr: "Paramètres avancés du marché", it: "Impostazioni avanzate mercato" },
  marketLanguage: { en: "Language", "pt-br": "Idioma", id: "Bahasa", "es-mx": "Idioma", "es-co": "Idioma", fr: "Langue", it: "Lingua" },
  marketRegion: { en: "Region", "pt-br": "Região", id: "Wilayah", "es-mx": "Región", "es-co": "Región", fr: "Région", it: "Regione" },

  // Output explanation
  outputExplanation: { en: "You'll get phrases currently returned by YouTube autocomplete for this topic.", "pt-br": "Você receberá frases atualmente retornadas pelo autocomplete do YouTube para este tópico.", id: "Anda akan mendapatkan frasa yang saat ini dikembalikan oleh autocomplete YouTube untuk topik ini.", "es-mx": "Obtendrás frases que actualmente devuelve el autocompletado de YouTube para este tema.", "es-co": "Obtendrás frases que actualmente devuelve el autocompletado de YouTube para este tema.", fr: "Vous obtiendrez les phrases actuellement renvoyées par l'autocomplétion YouTube pour ce sujet.", it: "Otterrai le frasi attualmente restituite dal completamento automatico di YouTube per questo argomento." },
  trustNote: { en: "These are autocomplete suggestions, not estimated monthly search volume.", "pt-br": "Estas são sugestões de autocomplete, não volume de busca mensal estimado.", id: "Ini adalah saran autocomplete, bukan perkiraan volume pencarian bulanan.", "es-mx": "Son sugerencias de autocompletado, no volumen de búsqueda mensual estimado.", "es-co": "Son sugerencias de autocompletado, no volumen de búsqueda mensual estimado.", fr: "Ce sont des suggestions d'autocomplétion, pas un volume de recherche mensuel estimé.", it: "Sono suggerimenti di completamento automatico, non un volume di ricerca mensile stimato." },

  // Empty state
  emptyStateTry: { en: "Try a topic like:", "pt-br": "Experimente um tópico como:", id: "Coba topik seperti:", "es-mx": "Prueba un tema como:", "es-co": "Prueba un tema como:", fr: "Essayez un sujet comme :", it: "Prova un argomento come:" },
  emptyStateExample: { en: "home workout", "pt-br": "treino em casa", id: "latihan di rumah", "es-mx": "entrenamiento en casa", "es-co": "entrenamiento en casa", fr: "entraînement à la maison", it: "allenamento a casa" },
  emptyStateDiscover: { en: "You may discover:", "pt-br": "Você pode descobrir:", id: "Anda mungkin menemukan:", "es-mx": "Podrías descubrir:", "es-co": "Podrías descubrir:", fr: "Vous pourriez découvrir :", it: "Potresti scoprire:" },
  emptyStateExamples: { en: "home workout for beginners|home workout without equipment|home workout for weight loss|home workout 10 minutes", "pt-br": "treino em casa para iniciantes|treino em casa sem equipamentos|treino em casa para perda de peso|treino em casa 10 minutos", id: "latihan di rumah untuk pemula|latihan di rumah tanpa alat|latihan di rumah untuk penurunan berat badan|latihan di rumah 10 menit", "es-mx": "entrenamiento en casa para principiantes|entrenamiento en casa sin equipamiento|entrenamiento en casa para bajar de peso|entrenamiento en casa 10 minutos", "es-co": "entrenamiento en casa para principiantes|entrenamiento en casa sin equipamiento|entrenamiento en casa para bajar de peso|entrenamiento en casa 10 minutos", fr: "entraînement à la maison pour débutants|entraînement à la maison sans équipement|entraînement à la maison pour perte de poids|entraînement à la maison 10 minutes", it: "allenamento a casa per principianti|allenamento a casa senza attrezzi|allenamento a casa per dimagrire|allenamento a casa 10 minuti" },

  // Results header
  resultsHeader: { en: "Results for:", "pt-br": "Resultados para:", id: "Hasil untuk:", "es-mx": "Resultados para:", "es-co": "Resultados para:", fr: "Résultats pour :", it: "Risultati per:" },
  suggestionsCount: { en: "{n} suggestions", "pt-br": "{n} sugestões", id: "{n} saran", "es-mx": "{n} sugerencias", "es-co": "{n} sugerencias", fr: "{n} suggestions", it: "{n} suggerimenti" },
  tabs: { en: "All|Questions|Long-tail|A–Z|Title Ideas", "pt-br": "Todas|Perguntas|Cauda longa|A–Z|Ideias de títulos", id: "Semua|Pertanyaan|Long-tail|A–Z|Ide judul", "es-mx": "Todas|Preguntas|Long-tail|A–Z|Ideas de títulos", "es-co": "Todas|Preguntas|Long-tail|A–Z|Ideas de títulos", fr: "Toutes|Questions|Long-tail|A–Z|Idées de titres", it: "Tutte|Domande|Long-tail|A–Z|Idee per titoli" },

  // Result row
  resultSignalLabel: { en: "Suggestion signal", "pt-br": "Sinal de sugestão", id: "Sinyal saran", "es-mx": "Señal de sugerencia", "es-co": "Señal de sugerencia", fr: "Signal de suggestion", it: "Segnale di suggerimento" },
  resultSignalTooltip: { en: "How often this phrase appeared across the autocomplete expansions used for this search. It is not search volume.", "pt-br": "Com que frequência esta frase apareceu nas expansões de autocomplete usadas nesta busca. Não é volume de busca.", id: "Seberapa sering frasa ini muncul di seluruh ekspansi autocomplete yang digunakan untuk pencarian ini. Ini bukan volume pencarian.", "es-mx": "Con qué frecuencia apareció esta frase en las expansiones de autocompletado usadas en esta búsqueda. No es volumen de búsqueda.", "es-co": "Con qué frecuencia apareció esta frase en las expansiones de autocompletado usadas en esta búsqueda. No es volumen de búsqueda.", fr: "À quelle fréquence cette phrase est apparue dans les expansions d'autocomplétion utilisées pour cette recherche. Ce n'est pas un volume de recherche.", it: "Quanto spesso questa frase è apparsa nelle espansioni di completamento automatico usate per questa ricerca. Non è volume di ricerca." },
  resultAppearsIn: { en: "Appears in YouTube suggestions", "pt-br": "Aparece nas sugestões do YouTube", id: "Muncul di saran YouTube", "es-mx": "Aparece en sugerencias de YouTube", "es-co": "Aparece en sugerencias de YouTube", fr: "Apparaît dans les suggestions YouTube", it: "Appare nei suggerimenti YouTube" },
  resultCopy: { en: "Copy", "pt-br": "Copiar", id: "Salin", "es-mx": "Copiar", "es-co": "Copiar", fr: "Copier", it: "Copia" },
  resultExplore: { en: "Explore", "pt-br": "Explorar", id: "Jelajahi", "es-mx": "Explorar", "es-co": "Explorar", fr: "Explorer", it: "Esplora" },
  resultYouTube: { en: "YouTube", "pt-br": "YouTube", id: "YouTube", "es-mx": "YouTube", "es-co": "YouTube", fr: "YouTube", it: "YouTube" },

  // A-Z Expansion
  expandLabel: { en: "Find more variations", "pt-br": "Encontrar mais variações", id: "Temukan lebih banyak variasi", "es-mx": "Encontrar más variaciones", "es-co": "Encontrar más variaciones", fr: "Trouver plus de variations", it: "Trova più variazioni" },
  expandDescription: { en: "Check what YouTube suggests when each letter is added to your topic.", "pt-br": "Veja o que o YouTube sugere quando cada letra é adicionada ao seu tópico.", id: "Lihat apa yang disarankan YouTube saat setiap huruf ditambahkan ke topik Anda.", "es-mx": "Mira lo que sugiere YouTube cuando se añade cada letra a tu tema.", "es-co": "Mira lo que sugiere YouTube cuando se añade cada letra a tu tema.", fr: "Voyez ce que YouTube suggère quand chaque lettre est ajoutée à votre sujet.", it: "Vedi cosa suggerisce YouTube quando si aggiunge ogni lettera al tuo argomento." },
  expandBtn: { en: "Expand A–Z", "pt-br": "Expandir A–Z", id: "Perluas A–Z", "es-mx": "Expandir A–Z", "es-co": "Expandir A–Z", fr: "Étendre A–Z", it: "Espandi A–Z" },

  // Question discovery
  questionFromAutocomplete: { en: "YouTube suggestion", "pt-br": "Sugestão do YouTube", id: "Saran YouTube", "es-mx": "Sugerencia de YouTube", "es-co": "Sugerencia de YouTube", fr: "Suggestion YouTube", it: "Suggerimento YouTube" },
  questionPatternIdea: { en: "Pattern idea", "pt-br": "Ideia de padrão", id: "Ide pola", "es-mx": "Idea de patrón", "es-co": "Idea de patrón", fr: "Idée de motif", it: "Idea di pattern" },

  // Long-tail classification
  classificationBroad: { en: "Broad", "pt-br": "Amplo", id: "Umum", "es-mx": "Amplio", "es-co": "Amplio", fr: "Large", it: "Ampio" },
  classificationSpecific: { en: "Specific", "pt-br": "Específico", id: "Spesifik", "es-mx": "Específico", "es-co": "Específico", fr: "Spécifique", it: "Specifico" },
  classificationLongTail: { en: "Long-tail", "pt-br": "Cauda longa", id: "Long-tail", "es-mx": "Long-tail", "es-co": "Long-tail", fr: "Long-tail", it: "Long-tail" },
  classificationQuestion: { en: "Question", "pt-br": "Pergunta", id: "Pertanyaan", "es-mx": "Pregunta", "es-co": "Pregunta", fr: "Question", it: "Domanda" },

  // Title Ideas
  titleIdeasLabel: { en: "Title patterns", "pt-br": "Padrões de título", id: "Pola judul", "es-mx": "Patrones de título", "es-co": "Patrones de título", fr: "Modèles de titre", it: "Modelli di titolo" },
  titleIdeasNote: { en: "These are title patterns, not performance predictions.", "pt-br": "Estes são padrões de título, não previsões de desempenho.", id: "Ini adalah pola judul, bukan prediksi performa.", "es-mx": "Son patrones de título, no predicciones de rendimiento.", "es-co": "Son patrones de título, no predicciones de rendimiento.", fr: "Ce sont des modèles de titre, pas des prédictions de performance.", it: "Sono modelli di titolo, non previsioni di performance." },
  titleIdeasUseInAnalyzer: { en: "Use in Title Analyzer", "pt-br": "Usar no Analisador de Títulos", id: "Gunakan di Analisis Judul", "es-mx": "Usar en Analizador de Títulos", "es-co": "Usar en Analizador de Títulos", fr: "Utiliser dans l'analyseur de titres", it: "Usa nell'analizzatore titoli" },

  // Tool chain
  useInTitleAnalyzer: { en: "Use in Title Analyzer", "pt-br": "Usar no Analisador de Títulos", id: "Gunakan di Analisis Judul", "es-mx": "Usar en Analizador de Títulos", "es-co": "Usar en Analizador de Títulos", fr: "Utiliser dans l'analyseur de titres", it: "Usa nell'analizzatore titoli" },
  useInDescriptionFormatter: { en: "Use in Description Formatter", "pt-br": "Usar no Formatador de Descrições", id: "Gunakan di Pemformat Deskripsi", "es-mx": "Usar en Formateador de Descripciones", "es-co": "Usar en Formateador de Descripciones", fr: "Utiliser dans le formateur de descriptions", it: "Usa nel formatore descrizioni" },
  previewThumbnail: { en: "Preview Thumbnail", "pt-br": "Pré-visualizar Miniatura", id: "Pratinjau Thumbnail", "es-mx": "Vista previa de miniatura", "es-co": "Vista previa de miniatura", fr: "Aperçu miniature", it: "Anteprima miniatura" },

  // Export
  exportToolbar: { en: "Copy selected|Download CSV", "pt-br": "Copiar selecionadas|Baixar CSV", id: "Salin yang dipilih|Unduh CSV", "es-mx": "Copiar seleccionadas|Descargar CSV", "es-co": "Copiar seleccionadas|Descargar CSV", fr: "Copier la sélection|Télécharger CSV", it: "Copia selezionate|Scarica CSV" },
  selectAll: { en: "Select all", "pt-br": "Selecionar todas", id: "Pilih semua", "es-mx": "Seleccionar todas", "es-co": "Seleccionar todas", fr: "Tout sélectionner", it: "Seleziona tutte" },
  clearSelection: { en: "Clear selection", "pt-br": "Limpar seleção", id: "Hapus pilihan", "es-mx": "Borrar selección", "es-co": "Borrar selección", fr: "Vider la sélection", it: "Svuota selezione" },
  selectedCount: { en: "{n} keywords selected", "pt-br": "{n} palavras-chave selecionadas", id: "{n} kata kunci dipilih", "es-mx": "{n} palabras clave seleccionadas", "es-co": "{n} palabras clave seleccionadas", fr: "{n} mots-clés sélectionnés", it: "{n} parole chiave selezionate" },
  noSelection: { en: "Select keywords", "pt-br": "Selecione palavras-chave", id: "Pilih kata kunci", "es-mx": "Selecciona palabras clave", "es-co": "Selecciona palabras clave", fr: "Sélectionnez des mots-clés", it: "Seleziona parole chiave" },

  // Tag builder
  tagBuilderTitle: { en: "Optional: Build YouTube tags", "pt-br": "Opcional: Criar tags do YouTube", id: "Opsional: Buat tag YouTube", "es-mx": "Opcional: Crear etiquetas de YouTube", "es-co": "Opcional: Crear etiquetas de YouTube", fr: "Optionnel : Créer des balises YouTube", it: "Opzionale: Crea tag YouTube" },
  tagBuilderNote: { en: "YouTube tags are mainly useful for misspellings and clarification. They are not a replacement for a strong topic, title or thumbnail.", "pt-br": "As tags do YouTube servem principalmente para erros de digitação e esclarecimento. Não substituem um tema, título ou miniatura fortes.", id: "Tag YouTube terutama berguna untuk kesalahan ketik dan klarifikasi. Bukan pengganti untuk topik, judul, atau thumbnail yang kuat.", "es-mx": "Las etiquetas de YouTube sirven principalmente para errores ortográficos y aclaraciones. No sustituyen un tema, título o miniatura fuertes.", "es-co": "Las etiquetas de YouTube sirven principalmente para errores ortográficos y aclaraciones. No sustituyen un tema, título o miniatura fuertes.", fr: "Les balises YouTube servent surtout pour les fautes de frappe et les clarifications. Elles ne remplacent pas un sujet, titre ou miniature forts.", it: "I tag di YouTube servono principalmente per errori di battitura e chiarificazioni. Non sostituiscono un argomento, titolo o miniatura forti." },
  tagCharCount: { en: "{count} / 500 characters", "pt-br": "{count} / 500 caracteres", id: "{count} / 500 karakter", "es-mx": "{count} / 500 caracteres", "es-co": "{count} / 500 caracteres", fr: "{count} / 500 caractères", it: "{count} / 500 caratteri" },
  copyTags: { en: "Copy tags", "pt-br": "Copiar tags", id: "Salin tag", "es-mx": "Copiar etiquetas", "es-co": "Copiar etiquetas", fr: "Copier les balises", it: "Copia i tag" },

  // Trust / Data source
  trustTitle: { en: "Data source", "pt-br": "Fonte dos dados", id: "Sumber data", "es-mx": "Fuente de datos", "es-co": "Fuente de datos", fr: "Source de données", it: "Fonte dati" },
  trustSourceLine: { en: "YouTube autocomplete", "pt-br": "Autocomplete do YouTube", id: "Autocomplete YouTube", "es-mx": "Autocompletado de YouTube", "es-co": "Autocompletado de YouTube", fr: "Autocomplétion YouTube", it: "Completamento automatico YouTube" },
  trustProxyNote: { en: "GainUtility requests live suggestions through its API proxy. Searches are not stored.", "pt-br": "O GainUtility solicita sugestões ao vivo através do seu proxy de API. Buscas não são armazenadas.", id: "GainUtility meminta saran langsung melalui proxy API-nya. Pencarian tidak disimpan.", "es-mx": "GainUtility solicita sugerencias en vivo a través de su proxy API. Las búsquedas no se guardan.", "es-co": "GainUtility solicita sugerencias en vivo a través de su proxy API. Las búsquedas no se guardan.", fr: "GainUtility récupère les suggestions en direct via son proxy API. Les recherches ne sont pas stockées.", it: "GainUtility richiede suggerimenti live tramite il suo proxy API. Le ricerche non vengono salvate." },

  // Error states
  errorTitle: { en: "Couldn't get YouTube suggestions", "pt-br": "Não foi possível obter sugestões do YouTube", id: "Tidak dapat mendapatkan saran YouTube", "es-mx": "No se pudieron obtener sugerencias de YouTube", "es-co": "No se pudieron obtener sugerencias de YouTube", fr: "Impossible d'obtenir les suggestions YouTube", it: "Impossibile ottenere suggerimenti YouTube" },
  errorBody: { en: "YouTube autocomplete is temporarily unavailable. Try again in a moment.", "pt-br": "O autocomplete do YouTube está temporariamente indisponível. Tente novamente em um momento.", id: "Autocomplete YouTube sementara tidak tersedia. Coba lagi sebentar.", "es-mx": "El autocompletado de YouTube no está disponible temporalmente. Inténtalo de nuevo en un momento.", "es-co": "El autocompletado de YouTube no está disponible temporalmente. Inténtalo de nuevo en un momento.", fr: "L'autocomplétion YouTube est temporairement indisponible. Réessayez dans un instant.", it: "Il completamento automatico di YouTube è temporaneamente non disponibile. Riprova tra un momento." },
  retryBtn: { en: "Try again", "pt-br": "Tentar novamente", id: "Coba lagi", "es-mx": "Reintentar", "es-co": "Reintentar", fr: "Réessayer", it: "Riprova" },

  // Market options
  marketEn: { en: "English (US)", "pt-br": "Inglês (EUA)", id: "Inggris (AS)", "es-mx": "Inglés (EE. UU.)", "es-co": "Inglés (EE. UU.)", fr: "Anglais (États-Unis)", it: "Inglese (USA)" },
  marketPt: { en: "Português (Brasil)", "pt-br": "Português (Brasil)", id: "Portugis (Brasil)", "es-mx": "Portugués (Brasil)", "es-co": "Portugués (Brasil)", fr: "Portugais (Brésil)", it: "Portoghese (Brasile)" },
  marketId: { en: "Bahasa Indonesia", "pt-br": "Indonésio", id: "Bahasa Indonesia", "es-mx": "Indonesio", "es-co": "Indonesio", fr: "Indonésien", it: "Indonesiano" },
  marketEsMx: { en: "Español (México)", "pt-br": "Espanhol (México)", id: "Spanyol (Meksiko)", "es-mx": "Español (México)", "es-co": "Español (México)", fr: "Espagnol (Mexique)", it: "Spagnolo (Messico)" },
  marketEsCo: { en: "Español (Colombia)", "pt-br": "Espanhol (Colômbia)", id: "Spanyol (Kolombia)", "es-mx": "Español (Colombia)", "es-co": "Español (Colombia)", fr: "Espagnol (Colombie)", it: "Spagnolo (Colombia)" },
  marketFr: { en: "Français", "pt-br": "Francês", id: "Prancis", "es-mx": "Francés", "es-co": "Francés", fr: "Français", it: "Francese" },
  marketIt: { en: "Italiano", "pt-br": "Italiano", id: "Italia", "es-mx": "Italiano", "es-co": "Italiano", fr: "Italien", it: "Italiano" },
});