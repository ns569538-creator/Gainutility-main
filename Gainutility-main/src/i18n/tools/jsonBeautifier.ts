/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * JsonBeautifier UI dictionary, registered under the "json-beautifier"
 * namespace. Import this module for its side effect (registration) from the
 * component.
 */

import { registerToolUI } from "../toolUi";

registerToolUI("json-beautifier", {
  clearedWorkspace: { en: "Cleared Beautifier workspace", "pt-br": "Workspace do Beautifier limpo", id: "Workspace Beautifier dibersihkan", "es-mx": "Espacio de trabajo de Beautifier limpiado", "es-co": "Espacio de trabajo de Beautifier limpiado", de: "Beautifier-Arbeitsbereich geleert", fr: "Espace Beautifier effacé", it: "Workspace del Beautifier cancellato" },
  fileLoaded: { en: "File loaded and beautified", "pt-br": "Arquivo carregado e formatado", id: "File dimuat dan dirapikan", "es-mx": "Archivo cargado y formateado", "es-co": "Archivo cargado y formateado", de: "Datei geladen und formatiert", fr: "Fichier chargé et formaté", it: "File caricato e formattato" },
  nothingToCopy: { en: "Nothing to copy", "pt-br": "Nada para copiar", id: "Tidak ada yang disalin", "es-mx": "Nada para copiar", "es-co": "Nada para copiar", de: "Nichts zu kopieren", fr: "Rien à copier", it: "Niente da copiare" },
  nothingToDownload: { en: "Nothing to download", "pt-br": "Nada para baixar", id: "Tidak ada yang diunduh", "es-mx": "Nada para descargar", "es-co": "Nada para descargar", de: "Nichts zum Herunterladen", fr: "Rien à télécharger", it: "Niente da scaricare" },
  downloaded: { en: "Beautified JSON downloaded!", "pt-br": "JSON formatado baixado!", id: "JSON yang dirapikan diunduh!", "es-mx": "¡JSON formateado descargado!", "es-co": "¡JSON formateado descargado!", de: "Formatiertes JSON heruntergeladen!", fr: "JSON formaté téléchargé !", it: "JSON formattato scaricato!" },
  rawInputTitle: { en: "Raw JSON Input", "pt-br": "Entrada JSON Bruto", id: "Masukan JSON Mentah", "es-mx": "Entrada JSON sin procesar", "es-co": "Entrada JSON sin procesar", de: "Roh-JSON-Eingabe", fr: "Saisie JSON brute", it: "Input JSON grezzo" },
  rawInputSubtitle: { en: "Paste compressed, minified, or disorganized JSON text.", "pt-br": "Cole texto JSON comprimido, minificado ou desorganizado.", id: "Tempel teks JSON yang terkompresi, diminifikasi, atau tidak teratur.", "es-mx": "Pega texto JSON comprimido, minificado o desordenado.", "es-co": "Pega texto JSON comprimido, minificado o desordenado.", de: "Fügen Sie komprimierten, minifizierten oder unsortierten JSON-Text ein.", fr: "Collez un texte JSON compressé, minifié ou désordonné.", it: "Incolla testo JSON compresso, minificato o disordinato." },
  loadSample: { en: "Load Sample", "pt-br": "Carregar Exemplo", id: "Muat Contoh", "es-mx": "Cargar Ejemplo", "es-co": "Cargar Ejemplo", de: "Beispiel laden", fr: "Charger un exemple", it: "Carica esempio" },
  uploadLabel: { en: "or upload raw .json payload", "pt-br": "ou carregue um payload .json bruto", id: "atau unggah payload .json mentah", "es-mx": "o carga un payload .json sin procesar", "es-co": "o carga un payload .json sin procesar", de: "oder Roh-.json-Datei hochladen", fr: "ou chargez un fichier .json brut", it: "o carica un payload .json grezzo" },
  formattedTitle: { en: "Formatted Result", "pt-br": "Resultado Formatado", id: "Hasil yang Diformat", "es-mx": "Resultado Formateado", "es-co": "Resultado Formateado", de: "Formatiertes Ergebnis", fr: "Résultat formaté", it: "Risultato formattato" },
  formattedSubtitle: { en: "Clean structural spacing and pretty print visualization.", "pt-br": "Espaçamento estrutural limpo e visualização em impressão bonita.", id: "Spasi struktural yang rapi dan visualisasi pretty print.", "es-mx": "Espaciado estructural limpio y visualización de impresión ordenada.", "es-co": "Espaciado estructural limpio y visualización de impresión ordenada.", de: "Saubere strukturelle Abstände und Pretty-Print-Visualisierung.", fr: "Espacement structurel propre et impression jolie.", it: "Spaziatura strutturale pulita e visualizzazione pretty print." },
  exportFile: { en: "Export File", "pt-br": "Exportar Arquivo", id: "Ekspor File", "es-mx": "Exportar Archivo", "es-co": "Exportar Archivo", de: "Datei exportieren", fr: "Exporter le fichier", it: "Esporta file" },
  indentationStyle: { en: "Indentation Style", "pt-br": "Estilo de Indentação", id: "Gaya Indentasi", "es-mx": "Estilo de sangría", "es-co": "Estilo de sangría", de: "Einzugsstil", fr: "Style d'indentation", it: "Stile di indentazione" },
  twoSpaces: { en: "2 Spaces", "pt-br": "2 Espaços", id: "2 Spasi", "es-mx": "2 Espacios", "es-co": "2 Espacios", de: "2 Leerzeichen", fr: "2 espaces", it: "2 spazi" },
  fourSpaces: { en: "4 Spaces", "pt-br": "4 Espaços", id: "4 Spasi", "es-mx": "4 Espacios", "es-co": "4 Espacios", de: "4 Leerzeichen", fr: "4 espaces", it: "4 spazi" },
  tabs: { en: "Tabs", "pt-br": "Abas", id: "Tab", "es-mx": "Tabulaciones", "es-co": "Tabulaciones", de: "Tabs", fr: "Onglets", it: "Tabulazioni" },
  syntaxMismatch: { en: "Syntax Parse Mismatch", "pt-br": "Incompatibilidade de Sintaxe", id: "Ketidakcocokan Penguraian Sintaks", "es-mx": "Desajuste de sintaxis", "es-co": "Desajuste de sintaxis", de: "Syntax-Interpretationsfehler", fr: "Erreur d'analyse de syntaxe", it: "Errore di sintassi" },
  awaiting: { en: "Awaiting pretty print parsing...", "pt-br": "Aguardando análise de impressão bonita...", id: "Menunggu penguraian pretty print...", "es-mx": "Esperando el análisis de impresión ordenada...", "es-co": "Esperando el análisis de impresión ordenada...", de: "Warte auf Pretty-Print-Analyse...", fr: "En attente de l'analyse pretty print...", it: "In attesa dell'analisi pretty print..." },
  invalidSyntax: { en: "Invalid JSON syntax detected.", "pt-br": "Sintaxe JSON inválida detectada.", id: "Sintaks JSON tidak valid terdeteksi.", "es-mx": "Se detectó sintaxis JSON no válida.", "es-co": "Se detectó sintaxis JSON no válida.", de: "Ungültige JSON-Syntax erkannt.", fr: "Syntaxe JSON invalide détectée.", it: "Sintassi JSON non valida rilevata." },
});