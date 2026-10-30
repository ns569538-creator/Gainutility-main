/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized tool display names and URL slugs, plus localized naming for
 * categories, studios and static pages.
 *
 * Every tool resolves to a localized name + slug for every supported locale,
 * so the entire tool library is indexable in every language. Priority tools
 * carry hand-written natural localized slugs; the rest fall back to a safe
 * slug built from the localized display name (never the raw English slug), so
 * no localization ends up with an English-only URL.
 */

import { ToolId } from "../types";
import { DEFAULT_LOCALE, isSupportedLocale } from "./locales";

export type LocaleCode =
  | "en"
  | "pt-br"
  | "id"
  | "es-mx"
  | "es-co"
  | "de"
  | "fr"
  | "it";

/** Slugify a localized display name into a URL-safe slug. */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents for URL slugs
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ------------------------------------------------------------------ */
/* Localized display names                                             */
/* ------------------------------------------------------------------ */

/** Map toolId -> locale -> localized display name. */
export const TOOL_LOCALE_NAMES: Partial<Record<ToolId, Partial<Record<LocaleCode, string>>>> = {
  "jpg-to-pdf": {
    "pt-br": "JPG para PDF",
    id: "JPG ke PDF",
    "es-mx": "JPG a PDF",
    "es-co": "JPG a PDF",
    de: "JPG in PDF",
    fr: "JPG en PDF",
    it: "JPG in PDF",
  },
  "pdf-to-jpg": {
    "pt-br": "PDF para JPG",
    id: "PDF ke JPG",
    "es-mx": "PDF a JPG",
    "es-co": "PDF a JPG",
    de: "PDF in JPG",
    fr: "PDF en JPG",
    it: "PDF in JPG",
  },
  "merge-pdf": {
    "pt-br": "Juntar PDF",
    id: "Gabung PDF",
    "es-mx": "Unir PDF",
    "es-co": "Combinar PDF",
    de: "PDF zusammenfügen",
    fr: "Fusionner PDF",
    it: "Unire PDF",
  },
  "split-pdf": {
    "pt-br": "Dividir PDF",
    id: "Pisah PDF",
    "es-mx": "Dividir PDF",
    "es-co": "Dividir PDF",
    de: "PDF teilen",
    fr: "Diviser PDF",
    it: "Dividere PDF",
  },
  "pdf-to-word": {
    "pt-br": "PDF para Word",
    id: "PDF ke Word",
    "es-mx": "PDF a Word",
    "es-co": "PDF a Word",
    de: "PDF in Word",
    fr: "PDF en Word",
    it: "PDF in Word",
  },
  "word-to-pdf": {
    "pt-br": "Word para PDF",
    id: "Word ke PDF",
    "es-mx": "Word a PDF",
    "es-co": "Word a PDF",
    de: "Word in PDF",
    fr: "Word en PDF",
    it: "Word in PDF",
  },
  "image-resizer": {
    "pt-br": "Redimensionar Imagem",
    id: "Ubah Ukuran Gambar",
    "es-mx": "Redimensionar Imagen",
    "es-co": "Redimensionar Imagen",
    de: "Bildgröße ändern",
    fr: "Redimensionner une image",
    it: "Ridimensionare immagine",
  },
  "image-converter": {
    "pt-br": "Conversor de Imagem",
    id: "Konversi Gambar",
    "es-mx": "Convertir Imagen",
    "es-co": "Convertir Imagen",
    de: "Bild konvertieren",
    fr: "Convertir une image",
    it: "Convertire immagine",
  },
  "pdf-translator": {
    "pt-br": "Tradutor de PDF",
    id: "Penerjemah PDF",
    "es-mx": "Traductor PDF",
    "es-co": "Traductor PDF",
    de: "PDF übersetzen",
    fr: "Traducteur PDF",
    it: "Traduttore PDF",
  },
  "json-formatter": {
    "pt-br": "Formatador JSON",
    id: "Formatter JSON",
    "es-mx": "Formateador JSON",
    "es-co": "Formateador JSON",
    de: "JSON formatieren",
    fr: "Formater JSON",
    it: "Formattare JSON",
  },
  "json-validator": {
    "pt-br": "Validador JSON",
    id: "Validator JSON",
    "es-mx": "Validador JSON",
    "es-co": "Validador JSON",
    de: "JSON validieren",
    fr: "Valider JSON",
    it: "Validatore JSON",
  },
  "password-generator": {
    "pt-br": "Gerador de Senha",
    id: "Generator Kata Sandi",
    "es-mx": "Generador de Contraseñas",
    "es-co": "Generador de Contraseñas",
    de: "Passwort-Generator",
    fr: "Générateur de mot de passe",
    it: "Generatore di password",
  },
  "qr-code-generator": {
    "pt-br": "Gerador de QR Code",
    id: "Generator QR Code",
    "es-mx": "Generador de Código QR",
    "es-co": "Generador de Código QR",
    de: "QR-Code-Generator",
    fr: "Générateur de QR code",
    it: "Generatore QR code",
  },
  "image-cropper": {
    "pt-br": "Cortar Imagem",
    id: "Crop Gambar",
    "es-mx": "Recortar Imagen",
    "es-co": "Recortar Imagen",
    de: "Bild zuschneiden",
    fr: "Recadrer une image",
    it: "Ritagliare immagine",
  },
  "rotate-pdf": {
    "pt-br": "Girar PDF",
    id: "Putar PDF",
    "es-mx": "Rotar PDF",
    "es-co": "Rotar PDF",
    de: "PDF drehen",
    fr: "Pivoter PDF",
    it: "Ruota PDF",
  },
  "extract-pdf": {
    "pt-br": "Extrair páginas PDF",
    id: "Ekstrak PDF",
    "es-mx": "Extraer PDF",
    "es-co": "Extraer PDF",
    de: "PDF-Seiten extrahieren",
    fr: "Extraire PDF",
    it: "Estrarre PDF",
  },
  "delete-pdf": {
    "pt-br": "Excluir páginas PDF",
    id: "Hapus Halaman PDF",
    "es-mx": "Eliminar páginas PDF",
    "es-co": "Eliminar páginas PDF",
    de: "PDF-Seiten löschen",
    fr: "Supprimer des pages PDF",
    it: "Eliminare pagine PDF",
  },
  "rearrange-pdf": {
    "pt-br": "Reorganizar PDF",
    id: "Susun Ulang PDF",
    "es-mx": "Reordenar PDF",
    "es-co": "Reordenar PDF",
    de: "PDF neu anordnen",
    fr: "Réorganiser PDF",
    it: "Riordinare PDF",
  },
  "protect-pdf": {
    "pt-br": "Proteger PDF",
    id: "Lindungi PDF",
    "es-mx": "Proteger PDF",
    "es-co": "Proteger PDF",
    de: "PDF schützen",
    fr: "Protéger PDF",
    it: "Proteggere PDF",
  },
  "unlock-pdf": {
    "pt-br": "Desbloquear PDF",
    id: "Buka Kunci PDF",
    "es-mx": "Desbloquear PDF",
    "es-co": "Desbloquear PDF",
    de: "PDF entsperren",
    fr: "Déverrouiller PDF",
    it: "Sbloccare PDF",
  },
  "remove-pdf-password": {
    "pt-br": "Remover senha do PDF",
    id: "Hapus Kata Sandi PDF",
    "es-mx": "Quitar contraseña PDF",
    "es-co": "Quitar contraseña PDF",
    de: "PDF-Passwort entfernen",
    fr: "Retirer le mot de passe PDF",
    it: "Rimuovere password PDF",
  },
  "add-pdf-watermark": {
    "pt-br": "Adicionar marca d'água em PDF",
    id: "Tambah Watermark PDF",
    "es-mx": "Añadir marca de agua PDF",
    "es-co": "Añadir marca de agua PDF",
    de: "PDF-Wasserzeichen hinzufügen",
    fr: "Ajouter un filigrane PDF",
    it: "Aggiungere filigrana PDF",
  },
  "flatten-pdf": {
    "pt-br": "Achatar PDF",
    id: "Flatten PDF",
    "es-mx": "Aplanar PDF",
    "es-co": "Aplanar PDF",
    de: "PDF vereinfachen",
    fr: "Aplatir PDF",
    it: "Appiattire PDF",
  },
  "pdf-to-excel": {
    "pt-br": "PDF para Excel",
    id: "PDF ke Excel",
    "es-mx": "PDF a Excel",
    "es-co": "PDF a Excel",
    de: "PDF in Excel",
    fr: "PDF en Excel",
    it: "PDF in Excel",
  },
  "excel-to-pdf": {
    "pt-br": "Excel para PDF",
    id: "Excel ke PDF",
    "es-mx": "Excel a PDF",
    "es-co": "Excel a PDF",
    de: "Excel in PDF",
    fr: "Excel en PDF",
    it: "Excel in PDF",
  },
  "pdf-to-text": {
    "pt-br": "PDF para Texto",
    id: "PDF ke Teks",
    "es-mx": "PDF a Texto",
    "es-co": "PDF a Texto",
    de: "PDF in Text",
    fr: "PDF en texte",
    it: "PDF in testo",
  },
  "text-to-pdf": {
    "pt-br": "Texto para PDF",
    id: "Teks ke PDF",
    "es-mx": "Texto a PDF",
    "es-co": "Texto a PDF",
    de: "Text in PDF",
    fr: "Texte en PDF",
    it: "Testo in PDF",
  },
  "html-to-pdf": {
    "pt-br": "HTML para PDF",
    id: "HTML ke PDF",
    "es-mx": "HTML a PDF",
    "es-co": "HTML a PDF",
    de: "HTML in PDF",
    fr: "HTML en PDF",
    it: "HTML in PDF",
  },
  "base64-tool": {
    "pt-br": "Ferramenta Base64",
    id: "Alat Base64",
    "es-mx": "Herramienta Base64",
    "es-co": "Herramienta Base64",
    de: "Base64-Tool",
    fr: "Outil Base64",
    it: "Strumento Base64",
  },
  "uuid-generator": {
    "pt-br": "Gerador de UUID",
    id: "Generator UUID",
    "es-mx": "Generador de UUID",
    "es-co": "Generador de UUID",
    de: "UUID-Generator",
    fr: "Générateur UUID",
    it: "Generatore UUID",
  },
  "image-to-palette": {
    "pt-br": "Imagem para Paleta",
    id: "Gambar ke Palet",
    "es-mx": "Imagen a Paleta",
    "es-co": "Imagen a Paleta",
    de: "Bild in Palette",
    fr: "Image en palette",
    it: "Immagine in paletta",
  },
  "color-palette-generator": {
    "pt-br": "Gerador de Paleta de Cores",
    id: "Generator Palet Warna",
    "es-mx": "Generador de Paletas de Color",
    "es-co": "Generador de Paletas de Color",
    de: "Farbpaletten-Generator",
    fr: "Générateur de palettes de couleurs",
    it: "Generatore di palette colori",
  },
  "color-picker": {
    "pt-br": "Seletor de Cores",
    id: "Pemilih Warna",
    "es-mx": "Selector de Color",
    "es-co": "Selector de Color",
    de: "Farbwähler",
    fr: "Sélecteur de couleur",
    it: "Selettore colore",
  },
  "video-downloader": {
    "pt-br": "Baixar Vídeo",
    id: "Pengunduh Video",
    "es-mx": "Descargar Video",
    "es-co": "Descargar Video",
    de: "Video-Downloader",
    fr: "Téléchargeur de Vidéos",
    it: "Scaricatore di Video",
  },
  "video-audio-extractor": {
    "pt-br": "Extrair Áudio de Vídeo",
    id: "Ekstrak Audio dari Video",
    "es-mx": "Extraer Audio de Video",
    "es-co": "Extraer Audio de Video",
    de: "Audio aus Video extrahieren",
    fr: "Extraire l'audio d'une vidéo",
    it: "Estrai audio da video",
  },
  "video-compressor": {
    "pt-br": "Compressor de Vídeo",
    id: "Kompresor Video",
    "es-mx": "Compresor de Video",
    "es-co": "Compresor de Video",
    de: "Videokompressor",
    fr: "Compresseur vidéo",
    it: "Compressore video",
  },
  "video-resizer": {
    "pt-br": "Redimensionar Vídeo",
    id: "Ubah Ukuran Video",
    "es-mx": "Redimensionar Video",
    "es-co": "Redimensionar Video",
    de: "Videogröße anpassen",
    fr: "Redimensionner une vidéo",
    it: "Ridimensiona video",
  },
  "video-trimmer": {
    "pt-br": "Cortar Vídeo",
    id: "Pemotong Video",
    "es-mx": "Cortar Video",
    "es-co": "Cortar Video",
    de: "Video schneiden",
    fr: "Couper une vidéo",
    it: "Taglia video",
  },
  "video-converter": {
    "pt-br": "Conversor de Vídeo",
    id: "Pengonversi Video",
    "es-mx": "Convertidor de Video",
    "es-co": "Convertidor de Video",
    de: "Videokonverter",
    fr: "Convertisseur vidéo",
    it: "Convertitore video",
  },
  "video-to-gif": {
    "pt-br": "Vídeo para GIF",
    id: "Video ke GIF",
    "es-mx": "Video a GIF",
    "es-co": "Video a GIF",
    de: "Video zu GIF",
    fr: "Vidéo en GIF",
    it: "Video in GIF",
  },
  "photos-to-video": {
    "pt-br": "Fotos para Vídeo",
    id: "Foto ke Video",
    "es-mx": "Fotos a Video",
    "es-co": "Fotos a Video",
    de: "Fotos zu Video",
    fr: "Photos en vidéo",
    it: "Foto in video",
  },
  "add-music-to-photo": {
    "pt-br": "Adicionar Música à Foto",
    id: "Tambah Musik ke Foto",
    "es-mx": "Añadir Música a Foto",
    "es-co": "Añadir Música a Foto",
    de: "Musik zum Foto hinzufügen",
    fr: "Ajouter de la musique à la photo",
    it: "Aggiungere musica alla foto",
  },
  "json-beautifier": {
    "pt-br": "Formatador JSON",
    id: "Formatter JSON",
    "es-mx": "Formateador JSON",
    "es-co": "Formateador JSON",
    de: "JSON-Formatter",
    fr: "Formateur JSON",
    it: "Formattatore JSON",
  },
  "logo-maker": {
    "pt-br": "Criador de Logo",
    id: "Pembuat Logo",
    "es-mx": "Creador de Logos",
    "es-co": "Creador de Logos",
    de: "Logo-Ersteller",
    fr: "Créateur de logo",
    it: "Crea Logo",
  },
  "contrast-checker": {
    "pt-br": "Verificador de Contraste",
    id: "Kontras Checker",
    "es-mx": "Verificador de Contraste",
    "es-co": "Verificador de Contraste",
    de: "Kontrast-Checker",
    fr: "Vérificateur de contraste",
    it: "Verifica Contrasto",
  },
  "slug-generator": {
    "pt-br": "Gerador de Slug",
    id: "Generator Slug",
    "es-mx": "Generador de Slug",
    "es-co": "Generador de Slug",
    de: "Slug-Generator",
    fr: "Générateur de slug",
    it: "Generatore di slug",
  },
  "youtube-thumbnail-preview": {
    "pt-br": "Miniatura YouTube",
    id: "Thumbnail YouTube",
    "es-mx": "Miniatura YouTube",
    "es-co": "Miniatura YouTube",
    de: "YouTube Thumbnail",
    fr: "Miniature YouTube",
    it: "Anteprima YouTube",
  },
  "youtube-keyword-explorer": {
    "pt-br": "Explorador de Palavras-Chave YouTube",
    id: "Penjelajah Kata Kunci YouTube",
    "es-mx": "Explorador de Palabras Clave YouTube",
    "es-co": "Explorador de Palabras Clave YouTube",
    de: "YouTube Keyword Explorer",
    fr: "Explorateur de Mots-Clés YouTube",
    it: "Esploratore di Parole Chiave YouTube",
  },
  "box-shadow-generator": {
    "pt-br": "Gerador de Sombra CSS",
    id: "Pembuat Bayangan CSS",
    "es-mx": "Generador de Sombras CSS",
    "es-co": "Generador de Sombras CSS",
    de: "CSS-Schatten-Generator",
    fr: "Générateur d'ombre CSS",
    it: "Generatore di Ombre CSS",
  },
  "gradient-generator": {
    "pt-br": "Gerador de Gradiente CSS",
    id: "Generator Gradien CSS",
    "es-mx": "Generador de Degradados CSS",
    "es-co": "Generador de Degradados CSS",
    de: "CSS-Farbverlauf-Generator",
    fr: "Générateur de dégradé CSS",
    it: "Generatore di Gradienti CSS",
  },
  "border-radius-generator": {
    "pt-br": "Gerador de Border Radius",
    id: "Generator Border Radius",
    "es-mx": "Generador de Border Radius",
    "es-co": "Generador de Border Radius",
    de: "Border-Radius Generator",
    fr: "Générateur de border-radius",
    it: "Generatore di Border Radius",
  },
  "favicon-generator": {
    "pt-br": "Gerador de Favicon",
    id: "Generator Favicon",
    "es-mx": "Generador de Favicon",
    "es-co": "Generador de Favicon",
    de: "Favicon-Generator",
    fr: "Générateur de favicon",
    it: "Generatore di Favicon",
  },
  "stylish-name-generator": {
    "pt-br": "Gerador de Nomes Estilosos",
    id: "Generator Nama Keren",
    "es-mx": "Generador de Nombres Estilosos",
    "es-co": "Generador de Nombres Estilosos",
    de: "Stylischer Namen-Generator",
    fr: "Générateur de Noms Stylés",
    it: "Generatore di Nomi Stilosi",
  },
  "linkedin-carousel-maker": {
    "pt-br": "Criador de Carrossel LinkedIn",
    id: "Pembuat Carousel LinkedIn",
    "es-mx": "Creador de Carrusel LinkedIn",
    "es-co": "Creador de Carrusel LinkedIn",
    de: "LinkedIn Karussell-Ersteller",
    fr: "Créateur de Carrousel LinkedIn",
    it: "Creatore di Carousel LinkedIn",
  },
  "font-detector": {
    "pt-br": "Detector de Fontes",
    id: "Detektor Font",
    "es-mx": "Detector de Fuentes",
    "es-co": "Detector de Fuentes",
    de: "Schriftart-Erkennung",
    fr: "Détecteur de Polices",
    it: "Rilevatore di Font",
  },
};

/* ------------------------------------------------------------------ */
/* Localized URL slugs                                                 */
/* ------------------------------------------------------------------ */

/** Map toolId -> locale -> localized slug (default English uses the tool id). */
export const TOOL_LOCALE_SLUGS: Partial<Record<ToolId, Partial<Record<LocaleCode, string>>>> = {
  "jpg-to-pdf": {
    "pt-br": "jpg-para-pdf",
    id: "jpg-ke-pdf",
    "es-mx": "jpg-a-pdf",
    "es-co": "jpg-a-pdf",
    de: "jpg-in-pdf-umwandeln",
    fr: "jpg-en-pdf",
    it: "jpg-in-pdf",
  },
  "pdf-to-jpg": {
    "pt-br": "pdf-para-jpg",
    id: "pdf-ke-jpg",
    "es-mx": "pdf-a-jpg",
    "es-co": "pdf-a-jpg",
    de: "pdf-in-jpg-umwandeln",
    fr: "pdf-en-jpg",
    it: "pdf-in-jpg",
  },
  "merge-pdf": {
    "pt-br": "juntar-pdf",
    id: "gabung-pdf",
    "es-mx": "unir-pdf",
    "es-co": "combinar-pdf",
    de: "pdf-zusammenfuegen",
    fr: "fusionner-pdf",
    it: "unire-pdf",
  },
  "split-pdf": {
    "pt-br": "dividir-pdf",
    id: "pisah-pdf",
    "es-mx": "dividir-pdf",
    "es-co": "dividir-pdf",
    de: "pdf-teilen",
    fr: "diviser-pdf",
    it: "dividere-pdf",
  },
  "pdf-to-word": {
    "pt-br": "pdf-para-word",
    id: "pdf-ke-word",
    "es-mx": "pdf-a-word",
    "es-co": "pdf-a-word",
    de: "pdf-in-word-umwandeln",
    fr: "pdf-en-word",
    it: "pdf-in-word",
  },
  "word-to-pdf": {
    "pt-br": "word-para-pdf",
    id: "word-ke-pdf",
    "es-mx": "word-a-pdf",
    "es-co": "word-a-pdf",
    de: "word-in-pdf-umwandeln",
    fr: "word-en-pdf",
    it: "word-in-pdf",
  },
  "image-resizer": {
    "pt-br": "redimensionar-imagem",
    id: "ubah-ukuran-gambar",
    "es-mx": "redimensionar-imagen",
    "es-co": "redimensionar-imagen",
    de: "bildgroesse-aendern",
    fr: "redimensionner-image",
    it: "ridimensionare-immagine",
  },
  "image-converter": {
    "pt-br": "converter-imagem",
    id: "konversi-gambar",
    "es-mx": "convertir-imagen",
    "es-co": "convertir-imagen",
    de: "bild-konvertieren",
    fr: "convertir-image",
    it: "convertire-immagine",
  },
  "image-cropper": {
    "pt-br": "cortar-imagem",
    id: "crop-gambar",
    "es-mx": "recortar-imagen",
    "es-co": "recortar-imagen",
    de: "bild-zuschneiden",
    fr: "recadrer-image",
    it: "ritagliare-immagine",
  },
  "pdf-translator": {
    "pt-br": "tradutor-pdf",
    id: "penerjemah-pdf",
    "es-mx": "traductor-pdf",
    "es-co": "traductor-pdf",
    de: "pdf-uebersetzen",
    fr: "traducteur-pdf",
    it: "traduttore-pdf",
  },
  "password-generator": {
    "pt-br": "gerador-de-senha",
    id: "generator-kata-sandi",
    "es-mx": "generador-de-contrasenas",
    "es-co": "generador-de-contrasenas",
    de: "passwort-generator",
    fr: "generateur-mdp",
    it: "generatore-password",
  },
  "qr-code-generator": {
    "pt-br": "gerador-qr-code",
    id: "generator-qr-code",
    "es-mx": "generador-codigo-qr",
    "es-co": "generador-codigo-qr",
    de: "qr-code-generator",
    fr: "generateur-qr-code",
    it: "generatore-qr-code",
  },
  "rotate-pdf": {
    "pt-br": "girar-pdf",
    id: "putar-pdf",
    "es-mx": "rotar-pdf",
    "es-co": "rotar-pdf",
    de: "pdf-drehen",
    fr: "pivoter-pdf",
    it: "ruota-pdf",
  },
  "video-downloader": {
    "pt-br": "video-downloader",
    id: "video-downloader",
    "es-mx": "video-downloader",
    "es-co": "video-downloader",
    de: "video-downloader",
    fr: "video-downloader",
    it: "video-downloader",
  },
  "add-music-to-photo": {
    "pt-br": "adicionar-musica-a-foto",
    id: "tambah-musik-ke-foto",
    "es-mx": "anadir-musica-a-foto",
    "es-co": "anadir-musica-a-foto",
    de: "musik-zu-foto-hinzufuegen",
    fr: "ajouter-musique-a-photo",
    it: "aggiungere-musica-a-foto",
  },
  "json-beautifier": {
    "pt-br": "json-beautifier",
    id: "json-beautifier",
    "es-mx": "json-beautifier",
    "es-co": "json-beautifier",
    de: "json-beautifier",
    fr: "json-beautifier",
    it: "json-beautifier",
  },
  "contrast-checker": {
    "pt-br": "contrast-checker",
    id: "contrast-checker",
    "es-mx": "contrast-checker",
    "es-co": "contrast-checker",
    de: "contrast-checker",
    fr: "contrast-checker",
    it: "contrast-checker",
  },
  "slug-generator": {
    "pt-br": "slug-generator",
    id: "slug-generator",
    "es-mx": "slug-generator",
    "es-co": "slug-generator",
    de: "slug-generator",
    fr: "slug-generator",
    it: "slug-generator",
  },
  "youtube-thumbnail-preview": {
    "pt-br": "youtube-thumbnail-preview",
    id: "youtube-thumbnail-preview",
    "es-mx": "youtube-thumbnail-preview",
    "es-co": "youtube-thumbnail-preview",
    de: "youtube-thumbnail-preview",
    fr: "youtube-thumbnail-preview",
    it: "youtube-thumbnail-preview",
  },
  "youtube-keyword-explorer": {
    "pt-br": "youtube-keyword-explorer",
    id: "youtube-keyword-explorer",
    "es-mx": "youtube-keyword-explorer",
    "es-co": "youtube-keyword-explorer",
    de: "youtube-keyword-explorer",
    fr: "youtube-keyword-explorer",
    it: "youtube-keyword-explorer",
  },
  "box-shadow-generator": {
    "pt-br": "gerador-de-sombra-css",
    id: "pembuat-bayangan-css",
    "es-mx": "generador-de-sombras-css",
    "es-co": "generador-de-sombras-css",
    de: "css-schatten-generator",
    fr: "generateur-d-ombre-css",
    it: "generatore-di-ombre-css",
  },
  "base64-tool": {
    "pt-br": "ferramenta-base64",
    id: "alat-base64",
    "es-mx": "herramienta-base64",
    "es-co": "herramienta-base64",
    de: "base64-tool",
    fr: "outil-base64",
    it: "strumento-base64",
  },
  "gradient-generator": {
    "pt-br": "gerador-de-gradiente-css",
    id: "generator-gradien-css",
    "es-mx": "generador-de-degradados-css",
    "es-co": "generador-de-degradados-css",
    de: "css-farbverlauf-generator",
    fr: "generateur-de-degrade-css",
    it: "generatore-di-gradienti-css",
  },
  "border-radius-generator": {
    "pt-br": "gerador-border-radius",
    id: "generator-border-radius",
    "es-mx": "generador-border-radius",
    "es-co": "generador-border-radius",
    de: "border-radius-generator",
    fr: "generateur-border-radius",
    it: "generatore-border-radius",
  },
  "favicon-generator": {
    "pt-br": "gerador-de-favicon",
    id: "generator-favicon",
    "es-mx": "generador-de-favicon",
    "es-co": "generador-de-favicon",
    de: "favicon-generator",
    fr: "generateur-de-favicon",
    it: "generatore-di-favicon",
  },
  "logo-maker": {
    "pt-br": "criador-de-logo",
    id: "pembuat-logo",
    "es-mx": "creador-de-logos",
    "es-co": "creador-de-logos",
    de: "logo-ersteller",
    fr: "createur-de-logo",
    it: "creatore-di-logo",
  },
  "stylish-name-generator": {
    "pt-br": "gerador-de-nomes-estilosos",
    id: "generator-nama-keren",
    "es-mx": "generador-de-nombres-estilosos",
    "es-co": "generador-de-nombres-estilosos",
    de: "stylischer-namen-generator",
    fr: "generateur-de-noms-styles",
    it: "generatore-di-nomi-stilosi",
  },
  "linkedin-carousel-maker": {
    "pt-br": "criador-de-carrossel-linkedin",
    id: "pembuat-carousel-linkedin",
    "es-mx": "creador-de-carrusel-linkedin",
    "es-co": "creador-de-carrusel-linkedin",
    de: "linkedin-karussell-ersteller",
    fr: "createur-de-carrousel-linkedin",
    it: "creatore-di-carousel-linkedin",
  },
  "font-detector": {
    "pt-br": "detector-de-fontes",
    id: "detektor-font",
    "es-mx": "detector-de-fuentes",
    "es-co": "detector-de-fuentes",
    de: "schriftart-erkennung",
    fr: "detecteur-de-polices",
    it: "rilevatore-di-font",
  },
};

/* ------------------------------------------------------------------ */
/* Category / studio localized names                                   */
/* ------------------------------------------------------------------ */

/** Localized category label used in breadcrumbs (e.g. "PDF Tools"). */
export const CATEGORY_LOCALE_NAMES: Record<LocaleCode, string> = {
  en: "Tools",
  "pt-br": "Ferramentas",
  id: "Alat",
  "es-mx": "Herramientas",
  "es-co": "Herramientas",
  de: "Tools",
  fr: "Outils",
  it: "Strumenti",
};

/** Localized studio names (keyed by studio id). */
export const STUDIO_LOCALE_NAMES: Record<string, Partial<Record<LocaleCode, string>>> = {
  pdf: {
    "pt-br": "Estúdio de PDF",
    id: "Studio PDF",
    "es-mx": "Estudio de PDF",
    "es-co": "Estudio de PDF",
    de: "PDF-Studio",
    fr: "Studio PDF",
    it: "Studio PDF",
  },
  image: {
    "pt-br": "Estúdio de Imagem",
    id: "Studio Gambar",
    "es-mx": "Estudio de Imagen",
    "es-co": "Estudio de Imagen",
    de: "Bild-Studio",
    fr: "Studio Image",
    it: "Studio Immagine",
  },
  json: {
    "pt-br": "Estúdio JSON",
    id: "Studio JSON",
    "es-mx": "Estudio JSON",
    "es-co": "Estudio JSON",
    de: "JSON-Studio",
    fr: "Studio JSON",
    it: "Studio JSON",
  },
  css: {
    "pt-br": "Estúdio CSS",
    id: "Studio CSS",
    "es-mx": "Estudio CSS",
    "es-co": "Estudio CSS",
    de: "CSS-Studio",
    fr: "Studio CSS",
    it: "Studio CSS",
  },
  seo: {
    "pt-br": "Estúdio SEO",
    id: "Studio SEO",
    "es-mx": "Estudio SEO",
    "es-co": "Estudio SEO",
    de: "SEO-Studio",
    fr: "Studio SEO",
    it: "Studio SEO",
  },
  developer: {
    "pt-br": "Estúdio do Desenvolvedor",
    id: "Studio Pengembang",
    "es-mx": "Estudio de Desarrollador",
    "es-co": "Estudio de Desarrollador",
    de: "Entwickler-Studio",
    fr: "Studio Développeur",
    it: "Studio Sviluppatore",
  },
  security: {
    "pt-br": "Estúdio de Segurança",
    id: "Studio Keamanan",
    "es-mx": "Estudio de Seguridad",
    "es-co": "Estudio de Seguridad",
    de: "Sicherheits-Studio",
    fr: "Studio Sécurité",
    it: "Studio Sicurezza",
  },
  creator: {
    "pt-br": "Estúdio do Criador",
    id: "Studio Kreator",
    "es-mx": "Estudio del Creador",
    "es-co": "Estudio del Creador",
    de: "Creator-Studio",
    fr: "Studio Créateur",
    it: "Studio Creatore",
  },
  converter: {
    "pt-br": "Conversor de Arquivos",
    id: "Konverter File",
    "es-mx": "Conversor de Archivos",
    "es-co": "Conversor de Archivos",
    de: "Dateikonverter",
    fr: "Convertisseur de fichiers",
    it: "Convertitore file",
  },
  color: {
    "pt-br": "Estúdio de Cores",
    id: "Studio Warna",
    "es-mx": "Estudio de Color",
    "es-co": "Estudio de Color",
    de: "Farb-Studio",
    fr: "Studio Couleur",
    it: "Studio Colore",
  },
};

/* ------------------------------------------------------------------ */
/* Resolvers (safe fallbacks for full coverage)                        */
/* ------------------------------------------------------------------ */

/** Localized display name for a tool; falls back to the registry name. */
export const localizedToolName = (
  toolId: ToolId,
  locale: string,
  fallbackName: string
): string => {
  if (locale === DEFAULT_LOCALE || !isSupportedLocale(locale)) return fallbackName;
  return TOOL_LOCALE_NAMES[toolId]?.[locale as LocaleCode] ?? fallbackName;
};

/**
 * Localized URL slug for a tool in a locale. Uses the hand-written slug when
 * available; otherwise derives one from the localized display name (or the
 * English name slugified as a final fallback) so every tool stays reachable
 * in every locale.
 */
export const localizedToolSlug = (
  toolId: string,
  locale: string,
  fallbackEnglishSlug: string
): string => {
  if (locale === DEFAULT_LOCALE || !isSupportedLocale(locale)) return fallbackEnglishSlug;
  const hand = TOOL_LOCALE_SLUGS[toolId as ToolId]?.[locale as LocaleCode];
  if (hand) return hand;
  const localized = TOOL_LOCALE_NAMES[toolId as ToolId]?.[locale as LocaleCode];
  if (localized) return slugify(localized);
  return slugify(fallbackEnglishSlug);
};

/** Localized label for a category name. */
export const localizedCategory = (locale: string): string =>
  CATEGORY_LOCALE_NAMES[(isSupportedLocale(locale) ? locale : "en") as LocaleCode];

/** Localized studio name. */
export const localizedStudioName = (studioId: string, locale: string, fallback: string): string => {
  if (locale === DEFAULT_LOCALE || !isSupportedLocale(locale)) return fallback;
  return STUDIO_LOCALE_NAMES[studioId]?.[locale as LocaleCode] ?? fallback;
};

/** Localized "Home" crumb label per locale. */
export const HOME_LABEL: Record<LocaleCode, string> = {
  en: "Home",
  "pt-br": "Início",
  id: "Beranda",
  "es-mx": "Inicio",
  "es-co": "Inicio",
  de: "Startseite",
  fr: "Accueil",
  it: "Home",
};

export const localizedHome = (locale: string): string =>
  HOME_LABEL[(isSupportedLocale(locale) ? locale : "en") as LocaleCode];
