/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized page-body overlay for box-shadow-generator (5 locales, 9 FAQs —
 * the original 6 base entries + 3 EXTRA_FAQS boost, all translated here).
 * English now ships 13 FAQs (base entries plus the Shadow Studio / copy-output
 * boosts); the localized set intentionally stays at the translated 9.
 * Source: src/data.ts "box-shadow-generator" and src/seo/extraFaqs.ts.
 * German intentionally ships no overlay (it falls back to English), matching
 * the UI dictionary's no-German policy for this tool.
 */

import type { LocaleCode } from "../slugs";
import type { ToolBodyOverlay } from "./types";

export const overlay: Partial<Record<LocaleCode, ToolBodyOverlay>> = {
  "pt-br": {
    desc: "Desenhe sombras box-shadow e text-shadow visualmente — predefinições em camadas, pré-visualização ao vivo e CSS pronto para copiar.",
    whatText:
      "Um gerador de box-shadow CSS que permite ajustar deslocamentos X/Y, desfoque, propagação, opacidade, cor e modo interno em uma ou mais camadas, com uma pré-visualização ao vivo que muda enquanto você ajusta. Aplique uma predefinição com um clique, cole uma sombra existente para editá-la e copie o resultado como declaração, variável CSS ou classe Tailwind.",
    whyText:
      "Escrever valores de box-shadow com várias camadas à mão é lento e sujeito a erros. Este gerador oferece controles deslizantes, campos numéricos editáveis e uma pré-visualização real para você prototipar sombras em segundos e copiar CSS limpo e pronto para produção quando terminar.",
    features: [
      "Dez predefinições box-shadow — Sutil, Cartão suave, Elevado, Flutuante, Modal, Botão, Forte, Interna, Brilho e Neumorfismo — e nove predefinições text-shadow",
      "Adicione, oculte, reordene e exclua várias camadas de sombra, com cor, opacidade, desfoque, propagação e modo interno por camada",
      "Copie a saída como uma declaração CSS simples, uma variável CSS (--shadow) ou uma classe Tailwind arbitrária de sombra",
      "Importe um valor de box-shadow existente e continue editando",
      "Estilos de pré-visualização Cartão, Botão e Painel, sobre fundos claro, branco, acolhedor, cinza e escuro",
      "Defina a cor da caixa e o raio das bordas para que a sombra pareça realista",
    ],
    steps: [
      "Escolha uma predefinição ou ajuste X, Y, desfoque e propagação com os controles deslizantes ou os campos numéricos.",
      "Altere a cor da sombra, a opacidade e o modo interno.",
      "Adicione outra camada de sombra quando quiser um efeito composto e em camadas.",
      "Escolha um estilo e um fundo de pré-visualização para que a sombra tenha aparência realista.",
      "Alterne entre saída CSS, variável CSS ou Tailwind e copie para a sua folha de estilos.",
    ],
    examples: [
      {
        title: "Cartão flutuante suave",
        desc: "Um efeito de elevação de UI comum que usa duas camadas de sombra suaves.",
        code: "box-shadow: 0px 8px 20px -4px rgba(0,0,0,0.12),\n  0px 4px 12px -2px rgba(0,0,0,0.08);",
      },
      {
        title: "Exportação em variável CSS",
        desc: "Token de sombra reutilizável para paletas de cores e temas.",
        code: "--shadow: 0 8px 20px -4px rgba(0,0,0,0.12),\n  0 4px 12px -2px rgba(0,0,0,0.08);",
      },
      {
        title: "Sombra arbitrária do Tailwind",
        desc: "Insira a classe direto em um projeto Tailwind.",
        code: 'class="shadow-[0_8px_20px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.08)]"',
      },
    ],
    mistakes: [
      "Usar uma sombra única, espessa e totalmente opaca em vez de várias camadas suaves.",
      "Depender apenas da propagação quando uma combinação de desfoque e menor opacidade fica mais natural.",
      "Copiar uma variável CSS sem declará-la, ou copiar uma classe Tailwind para um arquivo CSS simples.",
    ],
    privacyExplanation:
      "Todo o parsing, as conversões e a renderização acontecem na memória local do seu navegador. Esta ferramenta não envia seus arquivos para os servidores da GainUtility; qualquer processamento externo é informado na própria ferramenta.",
    faqs: [
      {
        question: "O que é uma sombra CSS box-shadow?",
        answer:
          "A propriedade box-shadow adiciona uma ou mais sombras projetadas a um elemento caixa. Cada camada usa um deslocamento X, um deslocamento Y, um raio de desfoque, um raio de propagação opcional, uma cor e uma opacidade, e pode ser externa ou interna.",
      },
      {
        question: "O que fazem o deslocamento X e o deslocamento Y?",
        answer:
          "O deslocamento X move a sombra para a direita (positivo) ou para a esquerda (negativo), e o deslocamento Y move para baixo (positivo) ou para cima (negativo). Zero, zero centraliza a sombra exatamente atrás da caixa, de modo que apenas desfoque e propagação ficam visíveis.",
      },
      {
        question: "O que faz o raio de desfoque?",
        answer:
          "O desfoque controla a suavidade da borda da sombra. Zero mantém a borda nítida, enquanto valores maiores espalham a cor e a esmaecem. Para sombras realistas, combine um desfoque moderado com uma cor de baixa opacidade como rgba(0,0,0,0.1).",
      },
      {
        question: "O que faz o raio de propagação?",
        answer:
          "Uma propagação positiva empurra a sombra para fora e a torna maior; uma negativa puxa para dentro, fazendo a sombra abraçar o elemento. Combinada com o desfoque, a propagação define se a sombra parece justa e afiada ou ampla e suave.",
      },
      {
        question: "Qual é a sintaxe do box-shadow?",
        answer:
          "Cada camada é escrita como deslocamentos desfoque propagação cor, por exemplo box-shadow: 0 8px 20px -4px rgba(0,0,0,0.12). Acrescente primeiro a palavra-chave inset para desenhar a sombra dentro do elemento e separe várias camadas com vírgulas.",
      },
      {
        question: "Como empilho várias sombras?",
        answer:
          "Abra a lista de camadas e adicione mais sombras. Cada camada pode ter seu próprio deslocamento, desfoque, propagação, cor e configuração de modo interno, e você pode ocultar, reordenar, silenciar ou excluir cada uma durante a edição — a pré-visualização atualiza ao vivo.",
      },
      {
        question: "Como crio sombras suaves em camadas como as de kits de UI modernos?",
        answer:
          "Adicione mais de uma camada de sombra e dê a cada uma baixa opacidade, com desfoque e deslocamento vertical crescentes. O gerador as combina em uma única regra box-shadow separada por vírgulas, pronta para colar direto no CSS.",
      },
      {
        question: "Posso criar sombras internas para efeitos pressionados?",
        answer:
          "Sim. Alterne uma camada para o modo interno para criar campos rebaixados, botões pressionados ou superfícies neumórficas, e o CSS gerado se atualiza ao vivo.",
      },
      {
        question: "A saída inclui prefixos de fornecedor?",
        answer:
          "Navegadores modernos suportam box-shadow sem prefixo de forma universal, então o gerador emite CSS padrão limpo, sem prefixos legados.",
      },
    ],
  },
  id: {
    desc: "Rancang bayangan box-shadow dan text-shadow secara visual — praset bertumpuk, pratinjau langsung, dan CSS siap salin.",
    whatText:
      "Generator box-shadow CSS yang memungkinkan Anda mengatur offset X/Y, blur, spread, opasitas, warna, dan mode inset untuk satu atau lebih lapisan, sambil melihat pratinjau langsung yang berubah saat Anda menyesuaikan. Terapkan praset sekali klik, tempel bayangan yang ada untuk mengeditnya, dan salin hasilnya sebagai deklarasi, variabel CSS, atau kelas Tailwind.",
    whyText:
      "Menulis nilai box-shadow multi-lapisan secara manual lambat dan rawan salah. Generator ini memberi Anda slider, kolom angka yang dapat diedit, dan pratinjau nyata sehingga Anda dapat membuat prototipe bayangan dalam hitungan detik dan menyalin CSS yang bersih dan siap produksi saat sudah siap.",
    features: [
      "Sepuluh praset box-shadow — Samar, Kartu lembut, Terangkat, Melayang, Modal, Tombol, Tegas, Dalam, Cahaya, dan Neumorfisme — dan sembilan praset text-shadow",
      "Tambah, sembunyikan, urutkan, dan hapus beberapa lapisan bayangan dengan warna, opasitas, blur, spread, dan inset per lapisan",
      "Salin keluaran sebagai deklarasi CSS biasa, variabel CSS (--shadow), atau kelas Tailwind bayangan arbitrer",
      "Impor nilai box-shadow yang ada dan lanjutkan mengeditnya",
      "Gaya pratinjau Kartu, Tombol, dan Panel di atas latar terang, putih, hangat, abu-abu, dan gelap",
      "Atur warna kotak dan radius sudut agar bayangan tampak realistis",
    ],
    steps: [
      "Pilih praset, atau atur X, Y, blur, dan spread dengan penggeser atau kolom angka.",
      "Ubah warna bayangan, opasitas, dan mode inset.",
      "Tambahkan lapisan bayangan lain saat Anda ingin efek bersusun yang komposit.",
      "Pilih gaya pratinjau dan latar agar bayangan terbaca realistis.",
      "Beralih antara keluaran CSS, variabel CSS, atau Tailwind dan salin ke stylesheet Anda.",
    ],
    examples: [
      {
        title: "Kartu melayang lembut",
        desc: "Efek angkat UI umum yang memakai dua lapisan bayangan lembut.",
        code: "box-shadow: 0px 8px 20px -4px rgba(0,0,0,0.12),\n  0px 4px 12px -2px rgba(0,0,0,0.08);",
      },
      {
        title: "Ekspor variabel CSS",
        desc: "Token bayangan yang dapat digunakan ulang untuk palet warna dan tema.",
        code: "--shadow: 0 8px 20px -4px rgba(0,0,0,0.12),\n  0 4px 12px -2px rgba(0,0,0,0.08);",
      },
      {
        title: "Bayangan arbitrer Tailwind",
        desc: "Letakkan kelasnya langsung ke proyek Tailwind.",
        code: 'class="shadow-[0_8px_20px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.08)]"',
      },
    ],
    mistakes: [
      "Memakai satu bayangan tebal yang sepenuhnya opak alih-alih beberapa lapisan lembut.",
      "Hanya mengandalkan spread ketika kombinasi blur dengan opasitas lebih rendah terlihat lebih alami.",
      "Menyalin variabel CSS tanpa mendeklarasikannya, atau menyalin kelas Tailwind ke file CSS biasa.",
    ],
    privacyExplanation:
      "Semua parsing, konversi, dan rendering berjalan di memori lokal browser Anda. Alat ini tidak mengirimkan file Anda ke server GainUtility; pemrosesan eksternal apa pun diungkapkan di dalam alat itu sendiri.",
    faqs: [
      {
        question: "Apa itu bayangan CSS box-shadow?",
        answer:
          "Properti box-shadow menambahkan satu atau lebih bayangan jatuh ke elemen kotak. Setiap lapisan menggunakan offset X, offset Y, radius blur, radius spread opsional, warna, dan opasitas, dan bisa luar atau inset.",
      },
      {
        question: "Apa fungsi offset X dan offset Y?",
        answer:
          "Offset X menggeser bayangan ke kanan (positif) atau kiri (negatif), dan offset Y menggesernya ke bawah (positif) atau ke atas (negatif). Nol, nol menempatkan bayangan tepat di belakang kotak, sehingga hanya blur dan spread yang terlihat.",
      },
      {
        question: "Apa fungsi radius blur?",
        answer:
          "Blur mengontrol kelembutan tepi bayangan. Nol menjaga tepi tetap tajam, sedangkan nilai lebih besar menyebarkan warna dan memudarkannya. Untuk bayangan realistis, gabungkan blur sedang dengan warna beropasitas rendah seperti rgba(0,0,0,0.1).",
      },
      {
        question: "Apa fungsi radius spread?",
        answer:
          "Spread positif mendorong bayangan ke luar dan membuatnya lebih besar; spread negatif menariknya ke dalam sehingga bayangan merangkul elemen. Dipadukan dengan blur, spread menentukan apakah bayangan terasa rapat dan tajam atau luas dan lembut.",
      },
      {
        question: "Apa sintaks box-shadow?",
        answer:
          "Setiap lapisan ditulis sebagai offset blur spread warna, misalnya box-shadow: 0 8px 20px -4px rgba(0,0,0,0.12). Tambahkan kata kunci inset di depan agar bayangan digambar di dalam elemen, dan pisahkan beberapa lapisan dengan koma.",
      },
      {
        question: "Bagaimana cara menumpuk beberapa bayangan?",
        answer:
          "Buka daftar lapisan dan tambahkan bayangan lain. Setiap lapisan bisa memiliki offset, blur, spread, warna, dan pengaturan inset sendiri, dan Anda dapat menyembunyikan, mengurutkan, membisukan, atau menghapusnya saat mengedit — pratinjau diperbarui langsung.",
      },
      {
        question: "Bagaimana cara membuat bayangan lembut berlapis seperti kit UI modern?",
        answer:
          "Tambahkan lebih dari satu lapisan bayangan dan beri masing-masing opasitas rendah dengan blur dan offset vertikal yang meningkat. Generator menggabungkannya menjadi satu aturan box-shadow yang dipisahkan koma dan bisa langsung Anda tempel ke CSS.",
      },
      {
        question: "Bisakah saya membuat bayangan inset untuk efek tertekan?",
        answer:
          "Bisa. Alihkan sebuah lapisan ke inset untuk membuat sumur input cekung, tombol yang ditekan, atau permukaan neumorfis, dan CSS yang dihasilkan diperbarui langsung.",
      },
      {
        question: "Apakah keluarannya menyertakan prefix vendor?",
        answer:
          "Browser modern mendukung box-shadow tanpa prefix secara universal, jadi generator mengeluarkan CSS standar yang bersih tanpa prefix lama.",
      },
    ],
  },
  "es-mx": {
    desc: "Diseña sombras box-shadow y text-shadow visualmente: preajustes por capas, vista previa en vivo y CSS listo para copiar.",
    whatText:
      "Un generador de box-shadow CSS que te permite ajustar los desplazamientos X/Y, el desenfoque, la extensión, la opacidad, el color y el modo interior en una o varias capas, mientras ves una vista previa en vivo que cambia mientras ajustas. Aplica un preajuste con un clic, pega una sombra existente para editarla y copia el resultado como declaración, variable CSS o clase Tailwind.",
    whyText:
      "Escribir valores box-shadow de varias capas a mano es lento y propenso a errores. Este generador te ofrece controles deslizantes, campos numéricos editables y una vista previa real para prototipar sombras en segundos y copiar CSS limpio y listo para producción cuando termines.",
    features: [
      "Diez preajustes box-shadow — Sutil, Tarjeta suave, Elevado, Flotante, Modal, Botón, Fuerte, Interior, Resplandor y Neomorfismo — y nueve preajustes text-shadow",
      "Añade, oculta, reordena y elimina varias capas de sombra con color, opacidad, desenfoque, extensión e interior por capa",
      "Copia la salida como una declaración CSS simple, una variable CSS (--shadow) o una clase Tailwind arbitraria de sombra",
      "Importa un valor box-shadow existente y sigue editándolo",
      "Estilos de vista previa Tarjeta, Botón y Panel, sobre fondos claro, blanco, cálido, gris y oscuro",
      "Define el color de la caja y el radio de las esquinas para que la sombra se vea realista",
    ],
    steps: [
      "Elige un preajuste o ajusta X, Y, desenfoque y extensión con los controles o los campos numéricos.",
      "Cambia el color de la sombra, la opacidad y el modo interior.",
      "Añade otra capa de sombra cuando quieras un efecto compuesto y por capas.",
      "Elige un estilo y un fondo de vista previa para que la sombra se lea con realismo.",
      "Alterna entre salida CSS, variable CSS o Tailwind y cópiala en tu hoja de estilos.",
    ],
    examples: [
      {
        title: "Tarjeta flotante suave",
        desc: "Un efecto de elevación de UI común que usa dos capas de sombra suaves.",
        code: "box-shadow: 0px 8px 20px -4px rgba(0,0,0,0.12),\n  0px 4px 12px -2px rgba(0,0,0,0.08);",
      },
      {
        title: "Exportación a variable CSS",
        desc: "Token de sombra reutilizable para paletas de colores y temas.",
        code: "--shadow: 0 8px 20px -4px rgba(0,0,0,0.12),\n  0 4px 12px -2px rgba(0,0,0,0.08);",
      },
      {
        title: "Sombra arbitraria de Tailwind",
        desc: "Deja la clase directamente en un proyecto Tailwind.",
        code: 'class="shadow-[0_8px_20px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.08)]"',
      },
    ],
    mistakes: [
      "Usar una sombra única, gruesa y totalmente opaca en lugar de varias capas suaves.",
      "Confiar solo en la extensión cuando una combinación de desenfoque y menor opacidad se ve más natural.",
      "Copiar una variable CSS sin declararla, o copiar una clase Tailwind a un archivo CSS simple.",
    ],
    privacyExplanation:
      "Todo el procesamiento, las conversiones y el renderizado ocurren en la memoria local de tu navegador. Esta herramienta no envía tus archivos a los servidores de GainUtility; cualquier procesamiento externo se indica en la propia herramienta.",
    faqs: [
      {
        question: "¿Qué es una sombra CSS box-shadow?",
        answer:
          "La propiedad box-shadow añade una o más sombras proyectadas a un elemento de caja. Cada capa usa un desplazamiento X, un desplazamiento Y, un radio de desenfoque, un radio de extensión opcional, un color y una opacidad, y puede ser exterior o interior.",
      },
      {
        question: "¿Qué hacen el desplazamiento X y el desplazamiento Y?",
        answer:
          "El desplazamiento X mueve la sombra a la derecha (positivo) o a la izquierda (negativo), y el desplazamiento Y la mueve hacia abajo (positivo) o hacia arriba (negativo). Cero, cero centra la sombra justo detrás de la caja, de modo que solo el desenfoque y la extensión sean visibles.",
      },
      {
        question: "¿Qué hace el radio de desenfoque?",
        answer:
          "El desenfoque controla la suavidad del borde de una sombra. Cero mantiene un borde nítido, mientras que los valores más grandes esparcen el color y lo desvanecen. Para sombras realistas, combina un desenfoque moderado con un color de baja opacidad como rgba(0,0,0,0.1).",
      },
      {
        question: "¿Qué hace el radio de extensión?",
        answer:
          "Una extensión positiva empuja la sombra hacia afuera y la hace más grande; una negativa la jala hacia adentro para que abrace el elemento. Combinada con el desenfoque, la extensión decide si la sombra se siente ajustada y nítida o amplia y suave.",
      },
      {
        question: "¿Cuál es la sintaxis de box-shadow?",
        answer:
          "Cada capa se escribe como desplazamientos desenfoque extensión color, por ejemplo box-shadow: 0 8px 20px -4px rgba(0,0,0,0.12). Añade la palabra clave inset al principio para dibujar la sombra hacia dentro del elemento y separa varias capas con comas.",
      },
      {
        question: "¿Cómo apilo varias sombras?",
        answer:
          "Abre la lista de capas y añade más sombras. Cada capa puede tener su propio desplazamiento, desenfoque, extensión, color y configuración de interior, y puedes ocultarlas, reordenarlas, silenciarlas o eliminarlas mientras editas — la vista previa se actualiza en vivo.",
      },
      {
        question: "¿Cómo creo sombras suaves por capas como las de los kits de UI modernos?",
        answer:
          "Añade más de una capa de sombra y dales una opacidad baja con desenfoque y desplazamiento vertical crecientes. El generador las combina en una sola regla box-shadow separada por comas que puedes pegar directamente en CSS.",
      },
      {
        question: "¿Puedo crear sombras interiores para efectos hundidos?",
        answer:
          "Sí. Activa el modo interior en una capa para construir campos hundidos, botones pulsados o superficies neomórficas, y el CSS generado se actualiza en vivo.",
      },
      {
        question: "¿La salida incluye prefijos de proveedor?",
        answer:
          "Los navegadores modernos admiten box-shadow sin prefijo de forma universal, así que el generador emite CSS estándar limpio sin prefijos heredados.",
      },
    ],
  },
  fr: {
    desc: "Concevez des ombres box-shadow et text-shadow visuellement : préréglages en couches, aperçu en direct et CSS prêt à copier.",
    whatText:
      "Un générateur de box-shadow CSS qui vous permet de régler les décalages X/Y, le flou, l'étendue, l'opacité, la couleur et le mode interne pour une ou plusieurs couches, tout en suivant un aperçu en direct qui évolue avec vos réglages. Appliquez un préréglage en un clic, collez une ombre existante pour la modifier, puis copiez le résultat en déclaration, variable CSS ou classe Tailwind.",
    whyText:
      "Écrire des valeurs box-shadow multi-couches à la main est lent et sujet aux erreurs. Ce générateur vous fournit des curseurs, des champs numériques modifiables et un vrai aperçu pour prototyper des ombres en quelques secondes et copier un CSS propre, prêt pour la production, une fois satisfait.",
    features: [
      "Dix préréglages box-shadow — Subtile, Carte douce, Surélevée, Flottante, Modale, Bouton, Forte, Interne, Lueur et Neumorphisme — et neuf préréglages text-shadow",
      "Ajoutez, masquez, réordonnez et supprimez plusieurs couches d'ombre avec couleur, opacité, flou, étendue et mode interne par couche",
      "Copiez la sortie en déclaration CSS simple, variable CSS (--shadow) ou classe Tailwind d'ombre arbitraire",
      "Importez une valeur box-shadow existante et continuez à la modifier",
      "Styles d'aperçu Carte, Bouton et Panneau, sur fonds clair, blanc, chaud, gris et foncé",
      "Définissez la couleur de la boîte et le rayon des coins pour un rendu d'ombre réaliste",
    ],
    steps: [
      "Choisissez un préréglage, ou réglez X, Y, le flou et l'étendue avec les curseurs ou les champs numériques.",
      "Modifiez la couleur de l'ombre, l'opacité et le mode interne.",
      "Ajoutez une autre couche d'ombre pour un effet composé en couches.",
      "Choisissez un style et un fond d'aperçu pour que l'ombre se lise réaliste.",
      "Basculez entre sortie CSS, variable CSS ou Tailwind et copiez-la dans votre feuille de styles.",
    ],
    examples: [
      {
        title: "Carte flottante douce",
        desc: "Un effet de relief d'UI courant utilisant deux couches d'ombre douces.",
        code: "box-shadow: 0px 8px 20px -4px rgba(0,0,0,0.12),\n  0px 4px 12px -2px rgba(0,0,0,0.08);",
      },
      {
        title: "Export en variable CSS",
        desc: "Jeton d'ombre réutilisable pour palettes de couleurs et thèmes.",
        code: "--shadow: 0 8px 20px -4px rgba(0,0,0,0.12),\n  0 4px 12px -2px rgba(0,0,0,0.08);",
      },
      {
        title: "Ombre arbitraire Tailwind",
        desc: "Déposez la classe directement dans un projet Tailwind.",
        code: 'class="shadow-[0_8px_20px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.08)]"',
      },
    ],
    mistakes: [
      "Utiliser une ombre unique, épaisse et totalement opaque au lieu de plusieurs couches douces.",
      "Ne compter que sur l'étendue quand une combinaison de flou et d'opacité plus faible paraît plus naturelle.",
      "Copier une variable CSS sans la déclarer, ou copier une classe Tailwind dans un fichier CSS simple.",
    ],
    privacyExplanation:
      "Toutes les analyses, les conversions et les rendus s'exécutent dans la mémoire locale de votre navigateur. Cet outil n'envoie jamais vos fichiers vers les serveurs de GainUtility ; tout traitement externe est indiqué dans l'outil lui-même.",
    faqs: [
      {
        question: "Qu'est-ce qu'une ombre CSS box-shadow ?",
        answer:
          "La propriété box-shadow ajoute une ou plusieurs ombres portées à un élément boîte. Chaque couche utilise un décalage X, un décalage Y, un rayon de flou, un rayon d'étendue optionnel, une couleur et une opacité, et peut être externe ou interne.",
      },
      {
        question: "Que font les décalages X et Y ?",
        answer:
          "Le décalage X déplace l'ombre vers la droite (positif) ou la gauche (négatif), et le décalage Y la déplace vers le bas (positif) ou vers le haut (négatif). Zéro, zéro centre l'ombre juste derrière la boîte, si bien que seuls le flou et l'étendue restent visibles.",
      },
      {
        question: "Que fait le rayon de flou ?",
        answer:
          "Le flou contrôle la douceur du bord d'une ombre. Zéro conserve un bord net, tandis que des valeurs plus grandes étalent la couleur et la font s'estomper. Pour des ombres réalistes, combinez un flou modéré avec une couleur de faible opacité comme rgba(0,0,0,0.1).",
      },
      {
        question: "Que fait le rayon d'étendue ?",
        answer:
          "Une étendue positive pousse l'ombre vers l'extérieur et l'agrandit ; une étendue négative la tire vers l'intérieur pour qu'elle épouse l'élément. Combinée au flou, l'étendue décide si l'ombre paraît serrée et nette ou large et douce.",
      },
      {
        question: "Quelle est la syntaxe de box-shadow ?",
        answer:
          "Chaque couche s'écrit décalages flou étendue couleur, par exemple box-shadow: 0 8px 20px -4px rgba(0,0,0,0.12). Ajoutez d'abord le mot-clé inset pour dessiner l'ombre à l'intérieur de l'élément, et séparez les couches par des virgules.",
      },
      {
        question: "Comment superposer plusieurs ombres ?",
        answer:
          "Ouvrez la liste des couches et ajoutez d'autres ombres. Chaque couche a son propre décalage, flou, étendue, couleur et réglage interne, et vous pouvez les masquer, les réordonner, les neutraliser ou les supprimer pendant l'édition — l'aperçu se met à jour en direct.",
      },
      {
        question: "Comment créer des ombres douces en couches comme dans les kits d'UI modernes ?",
        answer:
          "Ajoutez plus d'une couche d'ombre et donnez-leur une faible opacité avec un flou et un décalage vertical croissants. Le générateur les combine en une seule règle box-shadow séparée par des virgules, prête à coller dans votre CSS.",
      },
      {
        question: "Puis-je créer des ombres internes pour des effets enfoncés ?",
        answer:
          "Oui. Basculez une couche en mode interne pour creuser des puits de champ, des boutons enfoncés ou des surfaces neumorphiques, et le CSS généré se met à jour en direct.",
      },
      {
        question: "La sortie inclut-elle des préfixes de navigateur ?",
        answer:
          "Les navigateurs modernes prennent en charge box-shadow sans préfixe de façon universelle ; le générateur émet donc un CSS standard propre, sans préfixes hérités.",
      },
    ],
  },
  it: {
    desc: "Progetta ombre box-shadow e text-shadow visualmente: preimpostazioni a livelli, anteprima dal vivo e CSS pronto da copiare.",
    whatText:
      "Un generatore di box-shadow CSS che ti permette di regolare gli scostamenti X/Y, la sfocatura, l'espansione, l'opacità, il colore e la modalità interna per uno o più livelli, mentre osservi un'anteprima dal vivo che cambia mentre regoli. Applica una preimpostazione con un clic, incolla un'ombra esistente per modificarla e copia il risultato come dichiarazione, variabile CSS o classe Tailwind.",
    whyText:
      "Scrivere a mano valori box-shadow con più livelli è lento ed è facile sbagliare. Questo generatore ti offre cursori, campi numerici modificabili e un'anteprima reale per prototipare ombre in pochi secondi e copiare CSS pulito e pronto per la produzione quando hai finito.",
    features: [
      "Dieci preimpostazioni box-shadow — Sottile, Scheda morbida, Elevata, Fluttuante, Finestra, Pulsante, Forte, Interna, Bagliore e Neomorfismo — e nove preimpostazioni text-shadow",
      "Aggiungi, nascondi, riordina ed elimina più livelli di ombra con colore, opacità, sfocatura, espansione e modalità interna per livello",
      "Copia l'output come dichiarazione CSS semplice, variabile CSS (--shadow) o classe Tailwind ombra arbitraria",
      "Importa un valore box-shadow esistente e continua a modificarlo",
      "Stili di anteprima Scheda, Pulsante e Pannello, su sfondi chiaro, bianco, caldo, grigio e scuro",
      "Imposta il colore del riquadro e il raggio degli angoli perché l'ombra sembri realistica",
    ],
    steps: [
      "Scegli una preimpostazione, oppure regola X, Y, sfocatura ed espansione con i cursori o i campi numerici.",
      "Cambia il colore dell'ombra, l'opacità e la modalità interna.",
      "Aggiungi un altro livello di ombra quando vuoi un effetto composto e stratificato.",
      "Scegli uno stile e uno sfondo di anteprima perché l'ombra appaia realistica.",
      "Passa tra output CSS, variabile CSS o Tailwind e copialo nel tuo foglio di stile.",
    ],
    examples: [
      {
        title: "Scheda fluttuante morbida",
        desc: "Un comune effetto di sollevamento UI che usa due livelli di ombra morbidi.",
        code: "box-shadow: 0px 8px 20px -4px rgba(0,0,0,0.12),\n  0px 4px 12px -2px rgba(0,0,0,0.08);",
      },
      {
        title: "Esportazione in variabile CSS",
        desc: "Token di ombra riutilizzabile per palette di colori e temi.",
        code: "--shadow: 0 8px 20px -4px rgba(0,0,0,0.12),\n  0 4px 12px -2px rgba(0,0,0,0.08);",
      },
      {
        title: "Ombra arbitraria Tailwind",
        desc: "Incolla la classe direttamente in un progetto Tailwind.",
        code: 'class="shadow-[0_8px_20px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.08)]"',
      },
    ],
    mistakes: [
      "Usare un'ombra singola, spessa e completamente opaca invece di più livelli morbidi.",
      "Basarsi solo sull'espansione quando una combinazione di sfocatura e opacità più bassa risulta più naturale.",
      "Copiare una variabile CSS senza dichiararla, o copiare una classe Tailwind in un file CSS semplice.",
    ],
    privacyExplanation:
      "Tutte le analisi, le conversioni e il rendering avvengono nella memoria locale del tuo browser. Questo strumento non invia i tuoi file ai server di GainUtility; qualsiasi elaborazione esterna è indicata nello strumento stesso.",
    faqs: [
      {
        question: "Cos'è un'ombra CSS box-shadow?",
        answer:
          "La proprietà box-shadow aggiunge una o più ombre portate a un elemento riquadro. Ogni livello usa uno scostamento X, uno scostamento Y, un raggio di sfocatura, un raggio di espansione opzionale, un colore e un'opacità, ed è esterno o interno.",
      },
      {
        question: "A cosa servono gli scostamenti X e Y?",
        answer:
          "Lo scostamento X sposta l'ombra a destra (positivo) o a sinistra (negativo), e lo scostamento Y la sposta in basso (positivo) o in alto (negativo). Zero, zero centra l'ombra proprio dietro al riquadro, così a restare visibili sono solo sfocatura ed espansione.",
      },
      {
        question: "A cosa serve il raggio di sfocatura?",
        answer:
          "La sfocatura controlla la morbidezza del bordo di un'ombra. Zero mantiene un bordo netto, mentre valori più grandi diffondono il colore e lo sfumano. Per ombre realistiche, combina una sfocatura moderata con un colore a bassa opacità come rgba(0,0,0,0.1).",
      },
      {
        question: "A cosa serve il raggio di espansione?",
        answer:
          "Un'espansione positiva spinge l'ombra verso l'esterno e la ingrandisce; una negativa la tira verso l'interno perché aderisca all'elemento. Insieme alla sfocatura, l'espansione decide se l'ombra appare stretta e netta o ampia e morbida.",
      },
      {
        question: "Qual è la sintassi di box-shadow?",
        answer:
          "Ogni livello si scrive come scostamenti sfocatura espansione colore, ad esempio box-shadow: 0 8px 20px -4px rgba(0,0,0,0.12). Aggiungi prima la parola chiave inset per disegnare l'ombra dentro l'elemento e separa più livelli con le virgole.",
      },
      {
        question: "Come impilo più ombre?",
        answer:
          "Apri l'elenco dei livelli e aggiungi altre ombre. Ogni livello può avere scostamento, sfocatura, espansione, colore e impostazione interna propri, e puoi nasconderli, riordinarli, disattivarli o eliminarli durante la modifica — l'anteprima si aggiorna dal vivo.",
      },
      {
        question: "Come creo ombre morbide a più livelli come nei kit UI moderni?",
        answer:
          "Aggiungi più di un livello di ombra e dai a ciascuno un'opacità bassa con sfocatura e scostamento verticali crescenti. Il generatore li combina in un'unica regola box-shadow separata da virgole, pronta da incollare nel CSS.",
      },
      {
        question: "Posso creare ombre interne per effetti rientrati?",
        answer:
          "Sì. Attiva la modalità interna su un livello per costruire pozzi di input rientranti, pulsanti premuti o superfici neomorfiche, e il CSS generato si aggiorna dal vivo.",
      },
      {
        question: "L'output include i prefissi vendor?",
        answer:
          "I browser moderni supportano box-shadow senza prefisso in modo universale, quindi il generatore emette CSS standard pulito, senza prefissi legacy.",
      },
    ],
  },
};
