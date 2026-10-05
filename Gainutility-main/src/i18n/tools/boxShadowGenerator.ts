/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BoxShadowGenerator UI dictionary, registered under the "box-shadow-generator"
 * namespace. Import this module for its side effect (registration) from the
 * component. Localized for the 7 core locales; German intentionally ships no
 * keys here (it falls back to English), matching the site's "leave German in
 * place" policy for this launch.
 */

import { registerToolUI } from "../toolUi";

/* Helper: a color/a11y string identical in every locale (names like "CSS",
   "Tailwind", or code placeholders don't need translation). */
const SHARED = (s: string) => ({ en: s, "pt-br": s, id: s, "es-mx": s, "es-co": s, fr: s, it: s });

registerToolUI("box-shadow-generator", {
  /* --- presets row --------------------------------------------------- */
  presetAria: { en: "Shadow presets", "pt-br": "Predefinições de sombra", id: "Praset bayangan", "es-mx": "Preajustes de sombra", "es-co": "Preajustes de sombra", fr: "Préréglages d'ombre", it: "Preimpostazioni ombra" },
  presetsLabel: { en: "Presets", "pt-br": "Predefinições", id: "Praset", "es-mx": "Preajustes", "es-co": "Preajustes", fr: "Préréglages", it: "Preimpostazioni" },
  resetLabel: { en: "Reset", "pt-br": "Redefinir", id: "Reset", "es-mx": "Restablecer", "es-co": "Restablecer", fr: "Réinitialiser", it: "Reimposta" },
  resetToast: { en: "Shadow reset to default", "pt-br": "Sombra redefinida para o padrão", id: "Bayangan diatur ulang ke default", "es-mx": "Sombra restablecida al valor predeterminado", "es-co": "Sombra restablecida al valor predeterminado", fr: "Ombre réinitialisée par défaut", it: "Ombra reimpostata al default" },

  /* --- presets ------------------------------------------------------- */
  presetSubtle: { en: "Subtle", "pt-br": "Sutil", id: "Samar", "es-mx": "Sutil", "es-co": "Sutil", fr: "Subtile", it: "Sottile" },
  presetSubtleNote: { en: "A faint lift for dividers and small elements", "pt-br": "Um leve destaque para divisores e elementos pequenos", id: "Angkat halus untuk pembatas dan elemen kecil", "es-mx": "Un realce sutil para divisores y elementos pequeños", "es-co": "Un realce sutil para divisores y elementos pequeños", fr: "Un léger relief pour les séparateurs et petits éléments", it: "Un leggero sollevamento per divisori e piccoli elementi" },
  presetCard: { en: "Soft Card", "pt-br": "Cartão suave", id: "Kartu lembut", "es-mx": "Tarjeta suave", "es-co": "Tarjeta suave", fr: "Carte douce", it: "Scheda morbida" },
  presetCardNote: { en: "Tight contact shadow with a wide ambient layer", "pt-br": "Sombra de contato justa com uma camada ambiente ampla", id: "Bayangan kontak rapat dengan lapisan lingkungan lebar", "es-mx": "Sombra de contacto ajustada con una capa ambiental amplia", "es-co": "Sombra de contacto ajustada con una capa ambiental amplia", fr: "Ombre de contact serrée avec une large couche ambiante", it: "Ombra di contatto stretta con un'ampia colonna ambiente" },
  presetElevated: { en: "Elevated", "pt-br": "Elevado", id: "Terangkat", "es-mx": "Elevado", "es-co": "Elevado", fr: "Surélevée", it: "Elevata" },
  presetElevatedNote: { en: "Medium lift for menus and popovers", "pt-br": "Destaque médio para menus e popovers", id: "Angkat sedang untuk menu dan popover", "es-mx": "Elevación media para menús y popovers", "es-co": "Elevación media para menús y popovers", fr: "Surélévation moyenne pour menus et popovers", it: "Sollevamento medio per menu e popover" },
  presetFloating: { en: "Floating", "pt-br": "Flutuante", id: "Melayang", "es-mx": "Flotante", "es-co": "Flotante", fr: "Flottante", it: "Fluttuante" },
  presetFloatingNote: { en: "Deep lift for popovers and FABs", "pt-br": "Destaque profundo para popovers e FABs", id: "Angkat dalam untuk popover dan FAB", "es-mx": "Elevación profunda para popovers y FAB", "es-co": "Elevación profunda para popovers y FAB", fr: "Relief profond pour popovers et FAB", it: "Sollevamento profondo per popover e FAB" },
  presetModal: { en: "Modal", "pt-br": "Modal", id: "Modal", "es-mx": "Modal", "es-co": "Modal", fr: "Modale", it: "Finestre" },
  presetModalNote: { en: "Deep, wide shadow for dialogs", "pt-br": "Sombra profunda e ampla para diálogos", id: "Bayangan dalam dan lebar untuk dialog", "es-mx": "Sombra profunda y amplia para diálogos", "es-co": "Sombra profunda y amplia para diálogos", fr: "Ombre profonde et large pour les boîtes de dialogue", it: "Ombra profonda e ampia per i dialoghi" },
  presetButton: { en: "Button", "pt-br": "Botão", id: "Tombol", "es-mx": "Botón", "es-co": "Botón", fr: "Bouton", it: "Pulsante" },
  presetButtonNote: { en: "Low press-ready shadow for buttons", "pt-br": "Sombra leve pronta para botões", id: "Bayangan rendah siap pakai untuk tombol", "es-mx": "Sombra ligera para botones", "es-co": "Sombra ligera para botones", fr: "Ombre légère prête pour les boutons", it: "Ombra leggera pronta per i pulsanti" },
  presetStrong: { en: "Strong", "pt-br": "Forte", id: "Tegas", "es-mx": "Fuerte", "es-co": "Fuerte", fr: "Forte", it: "Forte" },
  presetStrongNote: { en: "Bold, crisp shadow", "pt-br": "Sombra nítida e marcante", id: "Bayangan tegas dan tajam", "es-mx": "Sombra marcada y nítida", "es-co": "Sombra marcada y nítida", fr: "Ombre franche et nette", it: "Ombra decisa e nitida" },
  presetInset: { en: "Inset", "pt-br": "Interna", id: "Dalam", "es-mx": "Interior", "es-co": "Interior", fr: "Interne", it: "Interna" },
  presetInsetNote: { en: "Recessed inner shadow for wells and inputs", "pt-br": "Sombra interna rebaixada para campos e inputs", id: "Bayangan dalam tersembunyi untuk bidang dan input", "es-mx": "Sombra interior hundida para campos e inputs", "es-co": "Sombra interior hundida para campos e inputs", fr: "Ombre intérieure creusée pour les champs et inputs", it: "Ombra interna incassata per campi e input" },
  presetGlow: { en: "Glow", "pt-br": "Brilho", id: "Cahaya", "es-mx": "Resplandor", "es-co": "Resplandor", fr: "Lueur", it: "Bagliore" },
  presetGlowNote: { en: "Brand-colored outer glow", "pt-br": "Brilho externo colorido", id: "Cahaya luar berwarna", "es-mx": "Resplandor exterior de color", "es-co": "Resplandor exterior de color", fr: "Lueur externe colorée", it: "Bagliore esterno colorato" },
  presetNeumorphism: { en: "Neumorphism", "pt-br": "Neumorfismo", id: "Neumorfisme", "es-mx": "Neomorfismo", "es-co": "Neomorfismo", fr: "Neumorphisme", it: "Neomorfismo" },
  presetNeumorphismNote: { en: "Soft extruded light-and-dark blend", "pt-br": "Mistura suave de luz e sombra em relevo", id: "Campuran terang dan gelap yang lembut", "es-mx": "Mezcla suave de luz y oscuridad en relieve", "es-co": "Mezcla suave de luz y oscuridad en relieve", fr: "Mélange doux de lumière et d'ombre en relief", it: "Miscela morbida di luce e ombra in rilievo" },
  presetTitleOne: { en: "{note} ({n} layer)", "pt-br": "{note} ({n} camada)", id: "{note} ({n} lapisan)", "es-mx": "{note} ({n} capa)", "es-co": "{note} ({n} capa)", fr: "{note} ({n} couche)", it: "{note} ({n} livello)" },
  presetTitleOther: { en: "{note} ({n} layers)", "pt-br": "{note} ({n} camadas)", id: "{note} ({n} lapisan)", "es-mx": "{note} ({n} capas)", "es-co": "{note} ({n} capas)", fr: "{note} ({n} couches)", it: "{note} ({n} livelli)" },

  /* --- text-shadow presets -------------------------------------------- */
  presetSoft: { en: "Soft", "pt-br": "Suave", id: "Lembut", "es-mx": "Suave", "es-co": "Suave", fr: "Douce", it: "Morbida" },
  presetSoftNote: { en: "Single diffuse drop that stays readable on busy backgrounds", "pt-br": "Uma queda difusa única que continua legível em fundos cheios", id: "Satu tetesan diffus tetap terbaca di latar ramai", "es-mx": "Caída difusa única que sigue legible sobre fondos cargados", "es-co": "Caída difusa única que sigue legible sobre fondos cargados", fr: "Une chute diffuse unique qui reste lisible sur les fonds chargés", it: "Singola caduta diffusa che resta legibile su sfondi affollati" },
  presetCrisp: { en: "Crisp", "pt-br": "Nítida", id: "Tajam", "es-mx": "Nítida", "es-co": "Nítida", fr: "Nette", it: "Nitida" },
  presetCrispNote: { en: "Hard offset with zero blur — sharp label shadow", "pt-br": "Deslocamento duro sem desfoque — sombra nítida de rótulo", id: "Offset keras tanpa blur — bayangan label tajam", "es-mx": "Desplazamiento duro sin desenfoque — sombra nítida de etiqueta", "es-co": "Desplazamiento duro sin desenfoque — sombra nítida de etiqueta", fr: "Décalage dur sans flou — ombre nette d'étiquette", it: "Scostamento netto senza sfocatura — ombra nitida di etichetta" },
  presetNeon: { en: "Neon", "pt-br": "Neon", id: "Neon", "es-mx": "Neón", "es-co": "Neón", fr: "Néon", it: "Neon" },
  presetNeonNote: { en: "White core with a colored halo — use on dark backgrounds", "pt-br": "Núcleo branco com halo colorido — use em fundos escuros", id: "Inti putih dengan halo berwarna — gunakan di latar gelap", "es-mx": "Núcleo blanco con halo de color — úsalo sobre fondos oscuros", "es-co": "Núcleo blanco con halo de color — úsalo sobre fondos oscuros", fr: "Noyau blanc avec halo coloré — à utiliser sur fond foncé", it: "Nucleo bianco con alone colorato — usarlo su sfondi scuri" },
  presetEmboss: { en: "Emboss", "pt-br": "Relevo", id: "Timbul", "es-mx": "Relieve", "es-co": "Relieve", fr: "Relief", it: "Rilievo" },
  presetEmbossNote: { en: "Light and dark micro-shadows — raised lettering", "pt-br": "Microsombras claras e escuras — letras em relevo", id: "Microbayangan terang dan gelap — huruf timbul", "es-mx": "Microsombras claras y oscuras — letras en relieve", "es-co": "Microsombras claras y oscuras — letras en relieve", fr: "Micro-ombres claires et sombres — lettres en relief", it: "Micro-ombre chiare e scure — lettere in rilievo" },
  presetRetro: { en: "Retro", "pt-br": "Retrô", id: "Retro", "es-mx": "Retro", "es-co": "Retro", fr: "Rétro", it: "Retro" },
  presetRetroNote: { en: "Solid offset colors with no blur — poster style", "pt-br": "Cores de deslocamento sólidas sem desfoque — estilo pôster", id: "Offset warna padat tanpa blur — gaya poster", "es-mx": "Colores de desplazamiento sólidos sin desenfoque — estilo póster", "es-co": "Colores de desplazamiento sólidos sin desenfoque — estilo póster", fr: "Couleurs de décalage pleines sans flou — style affiche", it: "Colori di scostamento pieni senza sfocatura — stile manifesto" },
  preset3d: { en: "3D", "pt-br": "3D", id: "3D", "es-mx": "3D", "es-co": "3D", fr: "3D", it: "3D" },
  preset3dNote: { en: "Stepped layers that extrude the glyphs", "pt-br": "Camadas em degraus que extrudam os glifos", id: "Lapisan bertingkat yang mengekstrusi glif", "es-mx": "Capas escalonadas que extruyen los glifos", "es-co": "Capas escalonadas que extruyen los glifos", fr: "Couches en gradins qui extrudent les glyphes", it: "Livelli a gradini che estrudono i glifi" },
  presetLongShadow: { en: "Long Shadow", "pt-br": "Sombra Longa", id: "Bayangan Panjang", "es-mx": "Sombra larga", "es-co": "Sombra larga", fr: "Longue ombre", it: "Ombra lunga" },
  presetLongShadowNote: { en: "Tapering strip that runs off the text", "pt-br": "Faixa afilada que se estende para fora do texto", id: "Pita meruncing menjauh dari teks", "es-mx": "Franja afilada que se aleja del texto", "es-co": "Franja afilada que se aleja del texto", fr: "Bande effilée qui file hors du texte", it: "Striscia appuntita che esce dal testo" },
  presetOutline: { en: "Outline", "pt-br": "Contorno", id: "Garis luar", "es-mx": "Contorno", "es-co": "Contorno", fr: "Contour", it: "Contorno" },
  presetOutlineNote: { en: "Eight 1px offsets — a true outline, since text-shadow has no spread", "pt-br": "Oito deslocamentos de 1px — um contorno real, pois text-shadow não tem propagação", id: "Delapan offset 1px — garis luar sungguhan, karena text-shadow tanpa spread", "es-mx": "Ocho desplazamientos de 1px — un contorno real, ya que text-shadow no tiene extensión", "es-co": "Ocho desplazamientos de 1px — un contorno real, ya que text-shadow no tiene extensión", fr: "Huit décalages d'1px — un vrai contour, text-shadow n'ayant pas d'étendue", it: "Otto scostamenti da 1px — un vero contorno, dato che text-shadow non ha espansione" },

  /* --- adjust panel --------------------------------------------------- */
  adjustTitle: { en: "Adjust the shadow", "pt-br": "Ajustar a sombra", id: "Sesuaikan bayangan", "es-mx": "Ajustar la sombra", "es-co": "Ajustar la sombra", fr: "Ajuster l'ombre", it: "Regola l'ombra" },
  adjustHint: { en: "Drag the slider or type a precise value.", "pt-br": "Arraste o controle ou digite um valor preciso.", id: "Geser penggeser atau ketik nilai yang tepat.", "es-mx": "Arrastra el control o escribe un valor exacto.", "es-co": "Arrastra el control o escribe un valor exacto.", fr: "Faites glisser le curseur ou saisissez une valeur précise.", it: "Trascina il cursore o digita un valore preciso." },
  layerBadgeOne: { en: "{n} layer", "pt-br": "{n} camada", id: "{n} lapisan", "es-mx": "{n} capa", "es-co": "{n} capa", fr: "{n} couche", it: "{n} livello" },
  layerBadgeOther: { en: "{n} layers", "pt-br": "{n} camadas", id: "{n} lapisan", "es-mx": "{n} capas", "es-co": "{n} capas", fr: "{n} couches", it: "{n} livelli" },
  xOffset: { en: "X offset", "pt-br": "Deslocamento X", id: "Offset X", "es-mx": "Desplazamiento X", "es-co": "Desplazamiento X", fr: "Décalage X", it: "Offset X" },
  yOffset: { en: "Y offset", "pt-br": "Deslocamento Y", id: "Offset Y", "es-mx": "Desplazamiento Y", "es-co": "Desplazamiento Y", fr: "Décalage Y", it: "Offset Y" },
  blur: { en: "Blur", "pt-br": "Desfoque", id: "Blur", "es-mx": "Desenfoque", "es-co": "Desenfoque", fr: "Flou", it: "Sfocatura" },
  spread: { en: "Spread", "pt-br": "Propagação", id: "Sebaran", "es-mx": "Extensión", "es-co": "Extensión", fr: "Étendue", it: "Espansione" },
  opacity: { en: "Opacity", "pt-br": "Opacidade", id: "Opasitas", "es-mx": "Opacidad", "es-co": "Opacidad", fr: "Opacité", it: "Opacità" },
  sliderAria: { en: "{label} slider", "pt-br": "Controle de {label}", id: "Penggeser {label}", "es-mx": "Control de {label}", "es-co": "Control de {label}", fr: "Curseur {label}", it: "Cursore {label}" },
  valueAria: { en: "{label} value", "pt-br": "Valor de {label}", id: "Nilai {label}", "es-mx": "Valor de {label}", "es-co": "Valor de {label}", fr: "Valeur {label}", it: "Valore {label}" },
  shadowColor: { en: "Shadow color", "pt-br": "Cor da sombra", id: "Warna bayangan", "es-mx": "Color de la sombra", "es-co": "Color de la sombra", fr: "Couleur de l'ombre", it: "Colore dell'ombra" },
  shadowColorPickerAria: { en: "Shadow color picker", "pt-br": "Seletor de cor da sombra", id: "Pemilih warna bayangan", "es-mx": "Selector de color de la sombra", "es-co": "Selector de color de la sombra", fr: "Sélecteur de couleur de l'ombre", it: "Selettore colore dell'ombra" },
  shadowColorHexAria: { en: "Shadow color hex", "pt-br": "Hex da cor da sombra", id: "Hex warna bayangan", "es-mx": "Hex del color de la sombra", "es-co": "Hex del color de la sombra", fr: "Hex de la couleur de l'ombre", it: "Hex del colore dell'ombra" },
  position: { en: "Position", "pt-br": "Posição", id: "Posisi", "es-mx": "Posición", "es-co": "Posición", fr: "Position", it: "Posizione" },
  positionAria: { en: "Shadow position", "pt-br": "Posição da sombra", id: "Posisi bayangan", "es-mx": "Posición de la sombra", "es-co": "Posición de la sombra", fr: "Position de l'ombre", it: "Posizione dell'ombra" },
  outer: { en: "Outer", "pt-br": "Externa", id: "Luar", "es-mx": "Exterior", "es-co": "Exterior", fr: "Externe", it: "Esterna" },
  inset: { en: "Inset", "pt-br": "Interna", id: "Dalam", "es-mx": "Interior", "es-co": "Interior", fr: "Interne", it: "Interna" },
  advancedShow: { en: "Show advanced", "pt-br": "Mostrar opções avançadas", id: "Tampilkan lanjutan", "es-mx": "Mostrar avanzado", "es-co": "Mostrar avanzado", fr: "Afficher avancé", it: "Mostra opzioni avanzate" },
  advancedHide: { en: "Hide advanced", "pt-br": "Ocultar opções avançadas", id: "Sembunyikan lanjutan", "es-mx": "Ocultar avanzado", "es-co": "Ocultar avanzado", fr: "Masquer avancé", it: "Nascondi opzioni avanzate" },
  addAnotherShadow: { en: "Add another shadow", "pt-br": "Adicionar outra sombra", id: "Tambah bayangan lain", "es-mx": "Añadir otra sombra", "es-co": "Agregar otra sombra", fr: "Ajouter une autre ombre", it: "Aggiungi un'altra ombra" },
  hideLayerList: { en: "Hide layer list", "pt-br": "Ocultar lista de camadas", id: "Sembunyikan daftar lapisan", "es-mx": "Ocultar lista de capas", "es-co": "Ocultar lista de capas", fr: "Masquer la liste des couches", it: "Nascondi elenco livelli" },
  manageLayers: { en: "Manage layers", "pt-br": "Gerenciar camadas", id: "Kelola lapisan", "es-mx": "Administrar capas", "es-co": "Administrar capas", fr: "Gérer les couches", it: "Gestisci livelli" },
  shadowLayersAria: { en: "Shadow layers", "pt-br": "Camadas de sombra", id: "Lapisan bayangan", "es-mx": "Capas de sombra", "es-co": "Capas de sombra", fr: "Couches d'ombre", it: "Livelli dell'ombra" },
  editShadowAria: { en: "Edit shadow {n}", "pt-br": "Editar sombra {n}", id: "Edit bayangan {n}", "es-mx": "Editar sombra {n}", "es-co": "Editar sombra {n}", fr: "Modifier l'ombre {n}", it: "Modifica ombra {n}" },
  shadowLabel: { en: "Shadow {n}", "pt-br": "Sombra {n}", id: "Bayangan {n}", "es-mx": "Sombra {n}", "es-co": "Sombra {n}", fr: "Ombre {n}", it: "Ombra {n}" },
  insetSuffix: { en: " · inset", "pt-br": " · interna", id: " · dalam", "es-mx": " · interior", "es-co": " · interior", fr: " · interne", it: " · interna" },
  muteShadowAria: { en: "Mute shadow {n}", "pt-br": "Ocultar sombra {n}", id: "Bisukan bayangan {n}", "es-mx": "Silenciar sombra {n}", "es-co": "Silenciar sombra {n}", fr: "Masquer l'ombre {n}", it: "Disattiva ombra {n}" },
  showShadowAria: { en: "Show shadow {n}", "pt-br": "Mostrar sombra {n}", id: "Tampilkan bayangan {n}", "es-mx": "Mostrar sombra {n}", "es-co": "Mostrar sombra {n}", fr: "Afficher l'ombre {n}", it: "Mostra ombra {n}" },
  muteTitle: { en: "Mute", "pt-br": "Ocultar", id: "Bisukan", "es-mx": "Silenciar", "es-co": "Silenciar", fr: "Masquer", it: "Disattiva" },
  showTitle: { en: "Show", "pt-br": "Mostrar", id: "Tampilkan", "es-mx": "Mostrar", "es-co": "Mostrar", fr: "Afficher", it: "Mostra" },
  moveShadowUpAria: { en: "Move shadow {n} up", "pt-br": "Mover sombra {n} para cima", id: "Pindahkan bayangan {n} ke atas", "es-mx": "Mover sombra {n} hacia arriba", "es-co": "Mover sombra {n} hacia arriba", fr: "Déplacer l'ombre {n} vers le haut", it: "Sposta ombra {n} in alto" },
  moveShadowDownAria: { en: "Move shadow {n} down", "pt-br": "Mover sombra {n} para baixo", id: "Pindahkan bayangan {n} ke bawah", "es-mx": "Mover sombra {n} hacia abajo", "es-co": "Mover sombra {n} hacia abajo", fr: "Déplacer l'ombre {n} vers le bas", it: "Sposta ombra {n} in basso" },
  deleteShadowAria: { en: "Delete shadow {n}", "pt-br": "Excluir sombra {n}", id: "Hapus bayangan {n}", "es-mx": "Eliminar sombra {n}", "es-co": "Eliminar sombra {n}", fr: "Supprimer l'ombre {n}", it: "Elimina ombra {n}" },
  deleteShadow: { en: "Delete shadow", "pt-br": "Excluir sombra", id: "Hapus bayangan", "es-mx": "Eliminar sombra", "es-co": "Eliminar sombra", fr: "Supprimer l'ombre", it: "Elimina ombra" },
  keepOneShadowToast: { en: "Keep at least one shadow", "pt-br": "Mantenha pelo menos uma sombra", id: "Pertahankan setidaknya satu bayangan", "es-mx": "Mantén al menos una sombra", "es-co": "Mantén al menos una sombra", fr: "Conservez au moins une ombre", it: "Mantieni almeno un'ombra" },

  /* --- live preview --------------------------------------------------- */
  livePreviewTitle: { en: "Live preview", "pt-br": "Pré-visualização ao vivo", id: "Pratinjau langsung", "es-mx": "Vista previa en vivo", "es-co": "Vista previa en vivo", fr: "Aperçu en direct", it: "Anteprima dal vivo" },
  livePreviewHint: { en: "The shadow updates as you adjust.", "pt-br": "A sombra atualiza enquanto você ajusta.", id: "Bayangan diperbarui saat Anda menyesuaikan.", "es-mx": "La sombra se actualiza mientras ajustas.", "es-co": "La sombra se actualiza mientras ajustas.", fr: "L'ombre se met à jour pendant vos réglages.", it: "L'ombra si aggiorna mentre regoli." },
  previewElementAria: { en: "Preview element", "pt-br": "Elemento de pré-visualização", id: "Elemen pratinjau", "es-mx": "Elemento de vista previa", "es-co": "Elemento de vista previa", fr: "Élément d'aperçu", it: "Elemento di anteprima" },
  previewBg: { en: "Preview background", "pt-br": "Fundo da pré-visualização", id: "Latar pratinjau", "es-mx": "Fondo de la vista previa", "es-co": "Fondo de la vista previa", fr: "Arrière-plan de l'aperçu", it: "Sfondo anteprima" },
  previewBgAria: { en: "Preview background {label}", "pt-br": "Fundo da pré-visualização {label}", id: "Latar pratinjau {label}", "es-mx": "Fondo de la vista previa {label}", "es-co": "Fondo de la vista previa {label}", fr: "Arrière-plan de l'aperçu {label}", it: "Sfondo anteprima {label}" },
  customPreviewBgAria: { en: "Custom preview background", "pt-br": "Fundo personalizado da pré-visualização", id: "Latar pratinjau kustom", "es-mx": "Fondo personalizado de la vista previa", "es-co": "Fondo personalizado de la vista previa", fr: "Arrière-plan d'aperçu personnalisé", it: "Sfondo anteprima personalizzato" },
  boxColor: { en: "Box color", "pt-br": "Cor da caixa", id: "Warna kotak", "es-mx": "Color de la caja", "es-co": "Color de la caja", fr: "Couleur de la boîte", it: "Colore della scatola" },
  boxRadius: { en: "Box radius", "pt-br": "Raio da caixa", id: "Radius kotak", "es-mx": "Radio de la caja", "es-co": "Radio de la caja", fr: "Rayon de la boîte", it: "Raggio della scatola" },
  previewShapeLabel: { en: "Preview style", "pt-br": "Estilo da pré-visualização", id: "Gaya pratinjau", "es-mx": "Estilo de la vista previa", "es-co": "Estilo de la vista previa", fr: "Style de l'aperçu", it: "Stile anteprima" },
  previewShapeAria: { en: "Preview shape", "pt-br": "Forma da pré-visualização", id: "Bentuk pratinjau", "es-mx": "Forma de la vista previa", "es-co": "Forma de la vista previa", fr: "Forme de l'aperçu", it: "Forma dell'anteprima" },
  shapeCard: { en: "Card", "pt-br": "Cartão", id: "Kartu", "es-mx": "Tarjeta", "es-co": "Tarjeta", fr: "Carte", it: "Scheda" },
  shapeButton: { en: "Button", "pt-br": "Botão", id: "Tombol", "es-mx": "Botón", "es-co": "Botón", fr: "Bouton", it: "Pulsante" },
  shapePanel: { en: "Panel", "pt-br": "Painel", id: "Panel", "es-mx": "Panel", "es-co": "Panel", fr: "Panneau", it: "Pannello" },
  bgLight: { en: "Light", "pt-br": "Claro", id: "Terang", "es-mx": "Claro", "es-co": "Claro", fr: "Clair", it: "Chiaro" },
  bgWhite: { en: "White", "pt-br": "Branco", id: "Putih", "es-mx": "Blanco", "es-co": "Blanco", fr: "Blanc", it: "Bianco" },
  bgWarm: { en: "Warm", "pt-br": "Acolhedor", id: "Hangat", "es-mx": "Cálido", "es-co": "Cálido", fr: "Chaud", it: "Caldo" },
  bgGray: { en: "Gray", "pt-br": "Cinza", id: "Abu-abu", "es-mx": "Gris", "es-co": "Gris", fr: "Gris", it: "Grigio" },
  bgDark: { en: "Dark", "pt-br": "Escuro", id: "Gelap", "es-mx": "Oscuro", "es-co": "Oscuro", fr: "Foncé", it: "Scuro" },

  /* --- generated CSS output ------------------------------------------ */
  generatedCssTitle: { en: "Generated CSS", "pt-br": "CSS gerado", id: "CSS yang dihasilkan", "es-mx": "CSS generado", "es-co": "CSS generado", fr: "CSS généré", it: "CSS generato" },
  generatedCssHint: { en: "Copy the declaration, a CSS variable, or a Tailwind class.", "pt-br": "Copie a declaração, uma variável CSS ou uma classe Tailwind.", id: "Salin deklarasi, variabel CSS, atau kelas Tailwind.", "es-mx": "Copia la declaración, una variable CSS o una clase Tailwind.", "es-co": "Copia la declaración, una variable CSS o una clase Tailwind.", fr: "Copiez la déclaration, une variable CSS ou une classe Tailwind.", it: "Copia la dichiarazione, una variabile CSS o una classe Tailwind." },
  copied: { en: "Copied", "pt-br": "Copiado", id: "Tersalin", "es-mx": "Copiado", "es-co": "Copiado", fr: "Copié", it: "Copiato" },
  copyCss: { en: "Copy CSS", "pt-br": "Copiar CSS", id: "Salin CSS", "es-mx": "Copiar CSS", "es-co": "Copiar CSS", fr: "Copier le CSS", it: "Copia CSS" },
  formatAria: { en: "Output format", "pt-br": "Formato da saída", id: "Format keluaran", "es-mx": "Formato de salida", "es-co": "Formato de salida", fr: "Format de sortie", it: "Formato di output" },
  formatCss: SHARED("CSS"),
  formatCssVariable: { en: "CSS variable", "pt-br": "Variável CSS", id: "Variabel CSS", "es-mx": "Variable CSS", "es-co": "Variable CSS", fr: "Variable CSS", it: "Variabile CSS" },
  formatTailwind: SHARED("Tailwind"),

  /* --- import existing box-shadow ------------------------------------- */
  importHint: { en: "Paste an existing box-shadow", "pt-br": "Cole uma box-shadow existente", id: "Tempel box-shadow yang ada", "es-mx": "Pega una box-shadow existente", "es-co": "Pega una box-shadow existente", fr: "Collez une box-shadow existante", it: "Incolla una box-shadow esistente" },
  importPlaceholder: SHARED("0 8px 24px -4px rgba(0,0,0,0.15)"),
  importButton: { en: "Import", "pt-br": "Importar", id: "Impor", "es-mx": "Importar", "es-co": "Importar", fr: "Importer", it: "Importa" },
  importError: { en: "Couldn't read this shadow. Check the CSS syntax and try again.", "pt-br": "Não foi possível ler esta sombra. Verifique a sintaxe do CSS e tente novamente.", id: "Tidak dapat membaca bayangan ini. Periksa sintaks CSS dan coba lagi.", "es-mx": "No se pudo leer esta sombra. Revisa la sintaxis de CSS e inténtalo de nuevo.", "es-co": "No se pudo leer esta sombra. Revisa la sintaxis de CSS y vuelve a intentarlo.", fr: "Impossible de lire cette ombre. Vérifiez la syntaxe CSS et réessayez.", it: "Impossibile leggere quest'ombra. Controlla la sintassi CSS e riprova." },
  importSuccessOne: { en: "Imported {n} shadow", "pt-br": "{n} sombra importada", id: "{n} bayangan diimpor", "es-mx": "{n} sombra importada", "es-co": "{n} sombra importada", fr: "{n} ombre importée", it: "{n} ombra importata" },
  importSuccessOther: { en: "Imported {n} shadows", "pt-br": "{n} sombras importadas", id: "{n} bayangan diimpor", "es-mx": "{n} sombras importadas", "es-co": "{n} sombras importadas", fr: "{n} ombres importées", it: "{n} ombre importate" },

  /* --- shadow type switch (box / text) --------------------------------- */
  shadowType: { en: "Shadow type", "pt-br": "Tipo de sombra", id: "Jenis bayangan", "es-mx": "Tipo de sombra", "es-co": "Tipo de sombra", fr: "Type d'ombre", it: "Tipo di ombra" },
  shadowTypeAria: { en: "Shadow type: box or text", "pt-br": "Tipo de sombra: caixa ou texto", id: "Jenis bayangan: kotak atau teks", "es-mx": "Tipo de sombra: caja o texto", "es-co": "Tipo de sombra: caja o texto", fr: "Type d'ombre : boîte ou texte", it: "Tipo di ombra: riquadro o testo" },
  modeBox: { en: "Box shadow", "pt-br": "Sombra de caixa", id: "Bayangan kotak", "es-mx": "Sombra de caja", "es-co": "Sombra de caja", fr: "Ombre de boîte", it: "Ombra del riquadro" },
  modeText: { en: "Text shadow", "pt-br": "Sombra de texto", id: "Bayangan teks", "es-mx": "Sombra de texto", "es-co": "Sombra de texto", fr: "Ombre de texte", it: "Ombra del testo" },
  randomize: { en: "Randomize", "pt-br": "Aleatorizar", id: "Acak", "es-mx": "Aleatorizar", "es-co": "Aleatorizar", fr: "Randomiser", it: "Genera a caso" },
  randomizeAria: { en: "Create a random shadow for this type", "pt-br": "Criar uma sombra aleatória para este tipo", id: "Buat bayangan acak untuk jenis ini", "es-mx": "Crear una sombra aleatoria para este tipo", "es-co": "Crear una sombra aleatoria para este tipo", fr: "Créer une ombre aléatoire pour ce type", it: "Crea un'ombra casuale per questo tipo" },

  /* --- mode-aware adjust hints ----------------------------------------- */
  adjustHintText: { en: "text-shadow takes X, Y, blur and color — no spread, no inset.", "pt-br": "text-shadow usa X, Y, desfoque e cor — sem propagação, sem interna.", id: "text-shadow memakai X, Y, blur, dan warna — tanpa spread, tanpa inset.", "es-mx": "text-shadow usa X, Y, desenfoque y color — sin extensión ni interior.", "es-co": "text-shadow usa X, Y, desenfoque y color — sin extensión ni interior.", fr: "text-shadow prend X, Y, le flou et la couleur — pas d'étendue, pas d'interne.", it: "text-shadow usa X, Y, sfocatura e colore — niente espansione, niente inset." },
  textModeNote: { en: "Spread and inset belong to box-shadow; this text shadow uses offsets, blur, color and opacity only.", "pt-br": "Propagação e interna pertencem a box-shadow; esta sombra de texto usa apenas deslocamentos, desfoque, cor e opacidade.", id: "Spread dan inset milik box-shadow; bayangan teks ini hanya memakai offset, blur, warna, dan opasitas.", "es-mx": "La extensión y el interior pertenecen a box-shadow; esta sombra de texto usa solo desplazamientos, desenfoque, color y opacidad.", "es-co": "La extensión y el interior pertenecen a box-shadow; esta sombra de texto usa solo desplazamientos, desenfoque, color y opacidad.", fr: "L'étendue et le mode interne relèvent de box-shadow ; cette ombre de texte n'utilise que décalages, flou, couleur et opacité.", it: "Espansione e inset appartengono a box-shadow; questa ombra di testo usa solo scostamenti, sfocatura, colore e opacità." },

  /* --- text preview typography ------------------------------------------ */
  previewTextLabel: { en: "Preview text", "pt-br": "Texto de pré-visualização", id: "Teks pratinjau", "es-mx": "Texto de vista previa", "es-co": "Texto de vista previa", fr: "Texte de l'aperçu", it: "Testo anteprima" },
  previewTextAria: { en: "Preview text", "pt-br": "Texto de pré-visualização", id: "Teks pratinjau", "es-mx": "Texto de vista previa", "es-co": "Texto de vista previa", fr: "Texte de l'aperçu", it: "Testo anteprima" },
  sampleAria: { en: "Use preview text: {label}", "pt-br": "Usar texto: {label}", id: "Gunakan teks pratinjau: {label}", "es-mx": "Usar texto de vista previa: {label}", "es-co": "Usar texto de vista previa: {label}", fr: "Utiliser le texte d'aperçu : {label}", it: "Usa il testo d'anteprima: {label}" },
  fontFamily: { en: "Font", "pt-br": "Fonte", id: "Huruf", "es-mx": "Fuente", "es-co": "Fuente", fr: "Police", it: "Carattere" },
  fontFamilyAria: { en: "Preview font", "pt-br": "Fonte da pré-visualização", id: "Huruf pratinjau", "es-mx": "Fuente de la vista previa", "es-co": "Fuente de la vista previa", fr: "Police de l'aperçu", it: "Carattere dell'anteprima" },
  fontSize: { en: "Font size", "pt-br": "Tamanho da fonte", id: "Ukuran huruf", "es-mx": "Tamaño de fuente", "es-co": "Tamaño de fuente", fr: "Taille du texte", it: "Dimensione carattere" },
  fontWeight: { en: "Weight", "pt-br": "Peso", id: "Tebal", "es-mx": "Peso", "es-co": "Peso", fr: "Graisse", it: "Peso" },
  fontWeightAria: { en: "Font weight", "pt-br": "Peso da fonte", id: "Tebal huruf", "es-mx": "Peso de la fuente", "es-co": "Peso de la fuente", fr: "Graisse du texte", it: "Peso del carattere" },
  lineHeight: { en: "Line height", "pt-br": "Altura da linha", id: "Tinggi baris", "es-mx": "Altura de línea", "es-co": "Altura de línea", fr: "Hauteur de ligne", it: "Altezza riga" },
  textColor: { en: "Text color", "pt-br": "Cor do texto", id: "Warna teks", "es-mx": "Color del texto", "es-co": "Color del texto", fr: "Couleur du texte", it: "Colore del testo" },
  textColorPickerAria: { en: "Text color picker", "pt-br": "Seletor de cor do texto", id: "Pemilih warna teks", "es-mx": "Selector de color del texto", "es-co": "Selector de color del texto", fr: "Sélecteur de couleur du texte", it: "Selettore colore del testo" },
  textColorHexAria: { en: "Text color hex", "pt-br": "Hex da cor do texto", id: "Hex warna teks", "es-mx": "Hex del color del texto", "es-co": "Hex del color del texto", fr: "Hex de la couleur du texte", it: "Hex del colore del testo" },
  textAlign: { en: "Alignment", "pt-br": "Alinhamento", id: "Perataan", "es-mx": "Alineación", "es-co": "Alineación", fr: "Alignement", it: "Allineamento" },
  textAlignAria: { en: "Text alignment", "pt-br": "Alinhamento do texto", id: "Perataan teks", "es-mx": "Alineación del texto", "es-co": "Alineación del texto", fr: "Alignement du texte", it: "Allineamento del testo" },
  alignLeft: { en: "Left", "pt-br": "Esquerda", id: "Kiri", "es-mx": "Izquierda", "es-co": "Izquierda", fr: "Gauche", it: "Sinistra" },
  alignCenter: { en: "Center", "pt-br": "Centro", id: "Tengah", "es-mx": "Centro", "es-co": "Centro", fr: "Centre", it: "Centro" },
  alignRight: { en: "Right", "pt-br": "Direita", id: "Kanan", "es-mx": "Derecha", "es-co": "Derecha", fr: "Droite", it: "Destra" },
  fontInter: SHARED("Inter"),
  fontSystem: { en: "System UI", "pt-br": "UI do sistema", id: "UI sistem", "es-mx": "UI del sistema", "es-co": "UI del sistema", fr: "UI système", it: "UI di sistema" },
  fontArial: SHARED("Arial"),
  fontVerdana: SHARED("Verdana"),
  fontTrebuchet: SHARED("Trebuchet MS"),
  fontGeorgia: SHARED("Georgia"),
  fontTimes: SHARED("Times New Roman"),
  fontPalatino: SHARED("Palatino"),
  fontRobotoMono: SHARED("Roboto Mono"),
  fontCourier: SHARED("Courier New"),
  sampleAa: SHARED("Aa"),
  sampleShadow: SHARED("Shadow"),
  sampleBrand: SHARED("GainUtility"),
  sampleCreate: SHARED("Create something"),
  sampleHello: SHARED("Hello World"),

  /* --- output actions ---------------------------------------------------- */
  copyValue: { en: "Copy value", "pt-br": "Copiar valor", id: "Salin nilai", "es-mx": "Copiar valor", "es-co": "Copiar valor", fr: "Copier la valeur", it: "Copia valore" },
  copyVariable: { en: "Copy variable", "pt-br": "Copiar variável", id: "Salin variabel", "es-mx": "Copiar variable", "es-co": "Copiar variable", fr: "Copier la variable", it: "Copia variabile" },
  copyTailwind: { en: "Copy Tailwind", "pt-br": "Copiar Tailwind", id: "Salin Tailwind", "es-mx": "Copiar Tailwind", "es-co": "Copiar Tailwind", fr: "Copier Tailwind", it: "Copia Tailwind" },
  shareLabel: { en: "Share", "pt-br": "Compartilhar", id: "Bagikan", "es-mx": "Compartir", "es-co": "Compartir", fr: "Partager", it: "Condividi" },
  shareAria: { en: "Copy a share link with these settings", "pt-br": "Copiar um link de compartilhamento com estas configurações", id: "Salin tautan berbagi dengan pengaturan ini", "es-mx": "Copiar un enlace para compartir con estos ajustes", "es-co": "Copiar un enlace para compartir con estos ajustes", fr: "Copier un lien de partage avec ces réglages", it: "Copia un link di condivisione con queste impostazioni" },
  downloadCss: { en: "Download .css", "pt-br": "Baixar .css", id: "Unduh .css", "es-mx": "Descargar .css", "es-co": "Descargar .css", fr: "Télécharger .css", it: "Scarica .css" },
  shareErrorToast: { en: "Couldn't create a share link", "pt-br": "Não foi possível criar um link de compartilhamento", id: "Tidak dapat membuat tautan berbagi", "es-mx": "No se pudo crear el enlace para compartir", "es-co": "No se pudo crear el enlace para compartir", fr: "Impossible de créer le lien de partage", it: "Impossibile creare il link di condivisione" },
  downloadErrorToast: { en: "Couldn't download the file", "pt-br": "Não foi possível baixar o arquivo", id: "Tidak dapat mengunduh berkas", "es-mx": "No se pudo descargar el archivo", "es-co": "No se pudo descargar el archivo", fr: "Impossible de télécharger le fichier", it: "Impossibile scaricare il file" },
  shareLoadedToast: { en: "Shared shadow settings loaded", "pt-br": "Configurações de sombra compartilhadas carregadas", id: "Pengaturan bayangan bers dimuat", "es-mx": "Ajustes de sombra compartidos cargados", "es-co": "Ajustes de sombra compartidos cargados", fr: "Réglages d'ombre partagés chargés", it: "Impostazioni di ombra condivise caricate" },
  shareInvalidToast: { en: "Couldn't load these share settings", "pt-br": "Não foi possível carregar estas configurações compartilhadas", id: "Tidak dapat memuat pengaturan berbagi ini", "es-mx": "No se pudieron cargar estos ajustes compartidos", "es-co": "No se pudieron cargar estos ajustes compartidos", fr: "Impossible de charger ces réglages partagés", it: "Impossibile caricare queste impostazioni condivise" },

  /* --- import (mode-aware) ------------------------------------------------ */
  importHintText: { en: "Paste an existing text-shadow", "pt-br": "Cole um text-shadow existente", id: "Tempel text-shadow yang ada", "es-mx": "Pega un text-shadow existente", "es-co": "Pega un text-shadow existente", fr: "Collez un text-shadow existant", it: "Incolla un text-shadow esistente" },
  importPlaceholderText: SHARED("0 2px 8px rgba(0,0,0,0.35)"),
  importErrorShort: { en: "Couldn't fully parse this value.", "pt-br": "Não foi possível analisar totalmente este valor.", id: "Tidak dapat mengurai sepenuhnya nilai ini.", "es-mx": "No se pudo analizar por completo este valor.", "es-co": "No se pudo analizar por completo este valor.", fr: "Impossible d'analyser complètement cette valeur.", it: "Impossibile analizzare completamente questo valore." },
  importHelp: { en: "Supported: box-shadow (2–4 lengths, optional inset) and text-shadow (2–3 lengths), comma-separated layers, hex, rgb() and hsl() colors.", "pt-br": "Suportado: box-shadow (2–4 comprimentos, interna opcional) e text-shadow (2–3 comprimentos), camadas separadas por vírgula, cores hex, rgb() e hsl().", id: "Didukung: box-shadow (2–4 panjang, inset opsional) dan text-shadow (2–3 panjang), lapisan dipisah koma, warna hex, rgb(), dan hsl().", "es-mx": "Compatible: box-shadow (2–4 longitudes, interior opcional) y text-shadow (2–3 longitudes), capas separadas por comas, colores hex, rgb() y hsl().", "es-co": "Compatible: box-shadow (2–4 longitudes, interior opcional) y text-shadow (2–3 longitudes), capas separadas por comas, colores hex, rgb() y hsl().", fr: "Pris en charge : box-shadow (2–4 longueurs, interne facultatif) et text-shadow (2–3 longueurs), couches séparées par des virgules, couleurs hex, rgb() et hsl().", it: "Supportati: box-shadow (2–4 lunghezze, inset opzionale) e text-shadow (2–3 lunghezze), livelli separati da virgole, colori hex, rgb() e hsl()." },

  /* --- layers extras ------------------------------------------------------ */
  duplicateLayer: { en: "Duplicate", "pt-br": "Duplicar", id: "Duplikat", "es-mx": "Duplicar", "es-co": "Duplicar", fr: "Dupliquer", it: "Duplica" },
  duplicateLayerAria: { en: "Duplicate shadow {n}", "pt-br": "Duplicar sombra {n}", id: "Duplikat bayangan {n}", "es-mx": "Duplicar sombra {n}", "es-co": "Duplicar sombra {n}", fr: "Dupliquer l'ombre {n}", it: "Duplica ombra {n}" },
  layerLimitToast: { en: "Up to 8 layers per shadow", "pt-br": "Até 8 camadas por sombra", id: "Hingga 8 lapisan per bayangan", "es-mx": "Hasta 8 capas por sombra", "es-co": "Hasta 8 capas por sombra", fr: "Jusqu'à 8 couches par ombre", it: "Fino a 8 livelli per ombra" },
  shapeInput: { en: "Input", "pt-br": "Campo", id: "Kolom isian", "es-mx": "Campo", "es-co": "Campo", fr: "Champ", it: "Campo" },
  shapeFloating: { en: "Floating", "pt-br": "Flutuante", id: "Melayang", "es-mx": "Flotante", "es-co": "Flotante", fr: "Flottante", it: "Fluttuante" },
  previewOnlyNote: { en: "Preview only — these settings change what you see here, not the copied CSS.", "pt-br": "Somente pré-visualização — estas configurações mudam o que você vê aqui, não o CSS copiado.", id: "Hanya pratinjau — pengaturan ini mengubah yang Anda lihat di sini, bukan CSS yang disalin.", "es-mx": "Solo vista previa — estos ajustes cambian lo que ves aquí, no el CSS copiado.", "es-co": "Solo vista previa — estos ajustes cambian lo que ves aquí, no el CSS copiado.", fr: "Aperçu uniquement — ces réglages modifient ce que vous voyez ici, pas le CSS copié.", it: "Solo anteprima — queste impostazioni cambiano ciò che vedi qui, non il CSS copiato." },
  boxColorPickerAria: { en: "Preview element color picker", "pt-br": "Seletor de cor do elemento de pré-visualização", id: "Pemilih warna elemen pratinjau", "es-mx": "Selector de color del elemento de vista previa", "es-co": "Selector de color del elemento de vista previa", fr: "Sélecteur de couleur de l'élément d'aperçu", it: "Selettore colore dell'elemento di anteprima" },
  boxColorHexAria: { en: "Preview element color hex", "pt-br": "Hex da cor do elemento de pré-visualização", id: "Hex warna elemen pratinjau", "es-mx": "Hex del color del elemento de vista previa", "es-co": "Hex del color del elemento de vista previa", fr: "Hex de la couleur de l'élément d'aperçu", it: "Hex del colore dell'elemento di anteprima" },

  /* --- below-the-tool content actions -------------------------------------- */
  copyLabel: { en: "Copy", "pt-br": "Copiar", id: "Salin", "es-mx": "Copiar", "es-co": "Copiar", fr: "Copier", it: "Copia" },
  editShadowBtn: { en: "Edit this shadow", "pt-br": "Editar esta sombra", id: "Edit bayangan ini", "es-mx": "Editar esta sombra", "es-co": "Editar esta sombra", fr: "Modifier cette ombre", it: "Modifica quest'ombra" },
  loadBtn: { en: "Load", "pt-br": "Carregar", id: "Muat", "es-mx": "Cargar", "es-co": "Cargar", fr: "Charger", it: "Carica" },
  tryTextModeBtn: { en: "Try text shadow mode", "pt-br": "Experimente o modo de sombra de texto", id: "Coba mode bayangan teks", "es-mx": "Prueba el modo de sombra de texto", "es-co": "Prueba el modo de sombra de texto", fr: "Essayer le mode ombre de texte", it: "Prova la modalità ombra del testo" },
});