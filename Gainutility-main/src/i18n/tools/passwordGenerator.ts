/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Per-tool UI dictionary for Password Generator (password-generator).
 */
import { registerToolUI } from "../toolUi";

registerToolUI("password-generator", {
  settingsTitle: { en: "Password Settings", "pt-br": "Configurações da senha", id: "Pengaturan kata sandi", "es-mx": "Configuración de la contraseña", "es-co": "Configuración de la contraseña", de: "Passwort-Einstellungen", fr: "Paramètres du mot de passe", it: "Impostazioni della password" },
  settingsSubtitle: { en: "Configure complexity constraints", "pt-br": "Configure os requisitos de complexidade", id: "Atur batasan kompleksitas", "es-mx": "Configura los requisitos de complejidad", "es-co": "Configura los requisitos de complejidad", de: "Komplexitätsanforderungen festlegen", fr: "Définissez les exigences de complexité", it: "Configura i vincoli di complessità" },
  lengthLabel: { en: "Length ({length})", "pt-br": "Comprimento ({length})", id: "Panjang ({length})", "es-mx": "Longitud ({length})", "es-co": "Longitud ({length})", de: "Länge ({length})", fr: "Longueur ({length})", it: "Lunghezza ({length})" },
  charSets: { en: "Character Sets", "pt-br": "Conjuntos de caracteres", id: "Set karakter", "es-mx": "Conjuntos de caracteres", "es-co": "Conjuntos de caracteres", de: "Zeichensätze", fr: "Jeux de caractères", it: "Set di caratteri" },
  uppercase: { en: "Uppercase (A-Z)", "pt-br": "Maiúsculas (A-Z)", id: "Huruf besar (A-Z)", "es-mx": "Mayúsculas (A-Z)", "es-co": "Mayúsculas (A-Z)", de: "Großbuchstaben (A-Z)", fr: "Majuscules (A-Z)", it: "Maiuscole (A-Z)" },
  lowercase: { en: "Lowercase (a-z)", "pt-br": "Minúsculas (a-z)", id: "Huruf kecil (a-z)", "es-mx": "Minúsculas (a-z)", "es-co": "Minúsculas (a-z)", de: "Kleinbuchstaben (a-z)", fr: "Minuscules (a-z)", it: "Minuscole (a-z)" },
  numbers: { en: "Numbers (0-9)", "pt-br": "Números (0-9)", id: "Angka (0-9)", "es-mx": "Números (0-9)", "es-co": "Números (0-9)", de: "Zahlen (0-9)", fr: "Chiffres (0-9)", it: "Numeri (0-9)" },
  symbols: { en: "Symbols (!@#...)", "pt-br": "Símbolos (!@#...)", id: "Simbol (!@#...)", "es-mx": "Símbolos (!@#...)", "es-co": "Símbolos (!@#...)", de: "Sonderzeichen (!@#...)", fr: "Symboles (!@#...)", it: "Simboli (!@#...)" },
  exclusionRules: { en: "Exclusion Rules", "pt-br": "Regras de exclusão", id: "Aturan pengecualian", "es-mx": "Reglas de exclusión", "es-co": "Reglas de exclusión", de: "Ausschlussregeln", fr: "Règles d'exclusion", it: "Regole di esclusione" },
  avoidSimilar: { en: "Avoid similar (i, l, 1, o, 0)", "pt-br": "Evitar semelhantes (i, l, 1, o, 0)", id: "Hindari mirip (i, l, 1, o, 0)", "es-mx": "Evitar similares (i, l, 1, o, 0)", "es-co": "Evitar similares (i, l, 1, o, 0)", de: "Ähnliche vermeiden (i, l, 1, o, 0)", fr: "Éviter les similaires (i, l, 1, o, 0)", it: "Evita simili (i, l, 1, o, 0)" },
  avoidBraces: { en: "Avoid braces/slashes", "pt-br": "Evitar chaves/barras", id: "Hindari tanda kurung/garis miring", "es-mx": "Evitar llaves/barras", "es-co": "Evitar llaves/barras", de: "Klammern/Slashes vermeiden", fr: "Éviter accolades/barres", it: "Evita graffe/barre" },
  regenerate: { en: "Regenerate", "pt-br": "Gerar novamente", id: "Buat ulang", "es-mx": "Regenerar", "es-co": "Regenerar", de: "Neu generieren", fr: "Régénérer", it: "Rigenera" },
  generatedTitle: { en: "Generated Password", "pt-br": "Senha gerada", id: "Kata sandi yang dihasilkan", "es-mx": "Contraseña generada", "es-co": "Contraseña generada", de: "Generiertes Passwort", fr: "Mot de passe généré", it: "Password generata" },
  generatedSubtitle: { en: "Highly secure generated string payload", "pt-br": "Senha altamente segura e gerada com segurança", id: "String hasil yang sangat aman", "es-mx": "Contraseña generada de alta seguridad", "es-co": "Contraseña generada de alta seguridad", de: "Hochsicheres generiertes Passwort", fr: "Mot de passe généré très sécurisé", it: "Password generata altamente sicura" },
  copyPassword: { en: "Copy Password", "pt-br": "Copiar senha", id: "Salin kata sandi", "es-mx": "Copiar contraseña", "es-co": "Copiar contraseña", de: "Passwort kopieren", fr: "Copier le mot de passe", it: "Copia password" },
  securityRating: { en: "Security Rating", "pt-br": "Classificação de segurança", id: "Peringkat keamanan", "es-mx": "Nivel de seguridad", "es-co": "Nivel de seguridad", de: "Sicherheitsstufe", fr: "Niveau de sécurité", it: "Livello di sicurezza" },
  entropyLabel: { en: "Calculated Entropy", "pt-br": "Entropia calculada", id: "Entropi terhitung", "es-mx": "Entropía calculada", "es-co": "Entropía calculada", de: "Berechnete Entropie", fr: "Entropie calculée", it: "Entropia calcolata" },
  bits: { en: "bits", "pt-br": "bits", id: "bit", "es-mx": "bits", "es-co": "bits", de: "Bit", fr: "bits", it: "bit" },
  bruteForceLabel: { en: "Brute-Force Estimate", "pt-br": "Estimativa de força bruta", id: "Perkiraan serangan brute force", "es-mx": "Estimación por fuerza bruta", "es-co": "Estimación por fuerza bruta", de: "Brute-Force-Schätzung", fr: "Estimation par force brute", it: "Stima a forza bruta" },
  estimateCenturies: { en: "Over 1,000 centuries", "pt-br": "Mais de 1.000 séculos", id: "Lebih dari 1.000 abad", "es-mx": "Más de 1.000 siglos", "es-co": "Más de 1.000 siglos", de: "Über 1.000 Jahrhunderte", fr: "Plus de 1 000 siècles", it: "Oltre 1.000 secoli" },
  estimateYears: { en: "A few years", "pt-br": "Alguns anos", id: "Beberapa tahun", "es-mx": "Unos cuantos años", "es-co": "Unos cuantos años", de: "Einige Jahre", fr: "Quelques années", it: "Alcuni anni" },
  estimateMinutes: { en: "A few minutes", "pt-br": "Alguns minutos", id: "Beberapa menit", "es-mx": "Unos minutos", "es-co": "Unos minutos", de: "Einige Minuten", fr: "Quelques minutes", it: "Alcuni minuti" },
  strengthNone: { en: "None", "pt-br": "Nenhum", id: "Tidak ada", "es-mx": "Ninguna", "es-co": "Ninguna", de: "Keine", fr: "Aucun", it: "Nessuna" },
  strengthWeak: { en: "Weak", "pt-br": "Fraca", id: "Lemah", "es-mx": "Débil", "es-co": "Débil", de: "Schwach", fr: "Faible", it: "Debole" },
  strengthMedium: { en: "Medium", "pt-br": "Média", id: "Sedang", "es-mx": "Media", "es-co": "Media", de: "Mittel", fr: "Moyenne", it: "Media" },
  strengthStrong: { en: "Strong", "pt-br": "Forte", id: "Kuat", "es-mx": "Fuerte", "es-co": "Fuerte", de: "Stark", fr: "Forte", it: "Forte" },
  strengthExcellent: { en: "Excellent", "pt-br": "Excelente", id: "Sangat baik", "es-mx": "Excelente", "es-co": "Excelente", de: "Ausgezeichnet", fr: "Excellente", it: "Eccellente" },
  toastCharset: { en: "Please enable at least one character set", "pt-br": "Ative pelo menos um conjunto de caracteres", id: "Aktifkan setidaknya satu set karakter", "es-mx": "Activa al menos un conjunto de caracteres", "es-co": "Activa al menos un conjunto de caracteres", de: "Aktivieren Sie mindestens einen Zeichensatz", fr: "Activez au moins un jeu de caractères", it: "Attiva almeno un set di caratteri" },
  toastCrypto: { en: "Web Crypto is not available in this browser context.", "pt-br": "O Web Crypto não está disponível neste contexto do navegador.", id: "Web Crypto tidak tersedia di konteks browser ini.", "es-mx": "Web Crypto no está disponible en este contexto del navegador.", "es-co": "Web Crypto no está disponible en este contexto del navegador.", de: "Web Crypto ist in diesem Browser-Kontext nicht verfügbar.", fr: "Web Crypto n'est pas disponible dans ce contexte de navigateur.", it: "Web Crypto non è disponibile in questo contesto del browser." },
  toastCopied: { en: "Password copied!", "pt-br": "Senha copiada!", id: "Kata sandi disalin!", "es-mx": "¡Contraseña copiada!", "es-co": "¡Contraseña copiada!", de: "Passwort kopiert!", fr: "Mot de passe copié !", it: "Password copiata!" },
});