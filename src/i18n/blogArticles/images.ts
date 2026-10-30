/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized variants for Blog Articles 1-5 (Images category).
 * Supported locales: pt-br, id, es-mx, es-co, de, fr, it.
 */

import type { LocalizedBlogArticle } from "../../blog/blogData";
import type { LocaleCode } from "../slugs";

export const IMAGES_ARTICLES_LOCALIZED: Record<string, Partial<Record<LocaleCode, LocalizedBlogArticle>>> = {
  "how-to-remove-background-from-an-image": {
    "pt-br": {
      title: "Como remover o fundo de uma imagem no navegador",
      description: "Um fundo liso é o caso mais simples: selecione a cor, remova, ajuste as bordas e baixe um PNG transparente. Tudo no seu navegador.",
      readingTime: "5 min de leitura",
      tags: ["removedor de fundo", "imagens", "fundo transparente", "privacidade"],
      categoryLabel: "Imagens",
      quickAnswer: "Abra o removedor de fundo da GainUtility, carregue uma imagem com fundo uniforme, clique na cor de fundo para capturá-la e remova-a. O resultado é um PNG transparente baixado direto no seu dispositivo.",
      keyTakeaway: "A remoção por cor limpa imagens de fundo sólido diretamente no navegador: selecione a cor, refine as bordas e o arquivo nunca sai do seu dispositivo.",
      toolCta: { label: "Remova o fundo agora — sem upload, sem conta, nada sai do seu dispositivo.", toolId: "background-remover" },
      seoTitle: "Como remover o fundo de uma imagem | GainUtility",
      seoDescription: "Remova um fundo uniforme no navegador: capture a cor, regule a tolerância, suavize as bordas e baixe um PNG transparente. Sem upload.",
      content: [
        {
          paragraphs: [
            "Na maioria das vezes em que as pessoas dizem “remover o fundo”, o fundo é de uma única cor sólida: um fundo branco de estúdio, um fundo azul ou papel claro. Para esse caso tão comum, você não precisa de um editor de imagens pesado nem de um serviço que envia o resultado por e-mail. Você só precisa de detecção de cor, controle de tolerância e um pouco de cuidado com as bordas.",
            "O caminho manual — laço, suavização, zoom e perseguição de pixels soltos — leva minutos e costuma ficar irregular. As ferramentas comerciais enviam sua foto para um servidor e cobram após a primeira imagem. Existe um caminho intermediário, e ele roda inteiramente no seu navegador."
          ]
        },
        {
          heading: "Quando a remoção baseada em cor funciona melhor",
          paragraphs: ["A remoção por chave cromática elimina todos os pixels próximos à cor de fundo selecionada. Ela se destaca em um conjunto específico e comum de imagens:"],
          list: [
            "Fotos de produtos tiradas em fundos brancos ou neutros para catálogos e e-commerce.",
            "Documentos digitalizados, recibos e fotos de identificação com fundo uniforme.",
            "Logotipos e gráficos sobre um bloco de cor sólida.",
            "Capturas de tela ou renderizações 3D em que o ambiente atrás do objeto é uniforme."
          ]
        },
        {
          heading: "Onde o processo fica mais difícil",
          paragraphs: ["Se o objeto tiver fios de cabelo soltos, vidro ou sombras da mesma cor do fundo, uma remoção rápida deixará uma auréola colorida ou abrirá um buraco no objeto. Isso é o comportamento esperado da física das cores, e não uma ferramenta com defeito — por isso a etapa de pré-visualização é essencial. Capture um tom intermediário do fundo em vez do canto mais escuro, aumente um pouco a tolerância e amplie as bordas antes de aceitar o resultado."],
          tool: { label: "O removedor de fundo da GainUtility roda inteiramente no seu navegador.", toolId: "background-remover" }
        },
        {
          heading: "Passo a passo: remova o fundo no seu navegador",
          paragraphs: ["Para um fundo uniforme, a tarefa inteira leva cerca de um minuto e não exige nenhuma instalação."],
          steps: [
            "Abra o removedor de fundo da GainUtility e solte sua imagem (ou clique para selecionar, ou cole da área de transferência).",
            "Capture a cor do fundo clicando sobre ela. Se a imagem tiver cantos lisos, a ferramenta normalmente detecta a cor certa automaticamente.",
            "Ajuste a tolerância: valores mais altos removem uma faixa maior de tons parecidos; valores mais baixos mantêm apenas a cor exata clicada.",
            "Aplique uma leve suavização de borda para que o recorte se integre naturalmente sem criar contornos duros.",
            "Remova o fundo, inspecione o antes e o depois — a transparência aparece como um padrão quadriculado — e baixe o PNG."
          ]
        },
        {
          heading: "Por que o processamento local no navegador faz diferença",
          paragraphs: ["Nada é enviado para a nuvem, portanto não há fila de espera, limite artificial de imagens gratuitas nem cópia de suas fotos salva em servidores de terceiros. A contrapartida é a honestidade sobre o método: remoção por cor não é IA generativa de contorno complexo. Usada nas imagens certas, as bordas ficam perfeitamente limpas e profissionais."]
        }
      ]
    },
    "es-mx": {
      title: "Cómo quitar el fondo de una imagen en el navegador",
      description: "Un fondo liso es el caso más sencillo: toma una muestra del color, elimínalo, ajusta los bordes y descarga un PNG transparente. Todo en tu navegador.",
      readingTime: "5 min de lectura",
      tags: ["quitar fondo", "imágenes", "fondo transparente", "privacidad"],
      categoryLabel: "Imágenes",
      quickAnswer: "Abre el eliminador de fondos de GainUtility, sube una imagen con fondo liso, selecciona el color de fondo y elimínalo. Obtendrás un PNG transparente que se descarga directamente a tu dispositivo.",
      keyTakeaway: "La eliminación basada en color limpia imágenes con fondo sólido en tu navegador: toma la muestra, revisa los bordes y el archivo nunca sale de tu dispositivo.",
      toolCta: { label: "Quita el fondo ahora — sin subir archivos, sin cuenta, nada sale de tu equipo.", toolId: "background-remover" },
      seoTitle: "Cómo quitar el fondo de una imagen | GainUtility",
      seoDescription: "Elimina un fondo liso en tu navegador: selecciona el color, ajusta la tolerancia, revisa los bordes y descarga un PNG transparente sin subir archivos.",
      content: [
        {
          paragraphs: [
            "La mayoría de las veces que alguien necesita “quitar el fondo”, se trata de un fondo de color liso: un ciclorama blanco, un fondo azul o una hoja de papel clara. Para ese caso habitual no necesitas un software de edición pesado ni un servicio que te envíe el archivo por correo. Solo necesitas detección de color, control de tolerancia y un poco de cuidado en los bordes.",
            "El método manual —lazo, desvanecer, hacer zoom y cazar píxeles sueltos— toma minutos y suele quedar irregular. Los servicios comerciales suben tu foto a sus servidores y cobran tras la primera prueba. Hay un camino intermedio que corre 100% en tu navegador."
          ]
        },
        {
          heading: "Cuándo funciona mejor la eliminación por color",
          paragraphs: ["La eliminación cromática borra todos los píxeles cercanos al color de fondo seleccionado. Funciona de manera sobresaliente en imágenes como:"],
          list: [
            "Fotos de productos tomadas sobre fondos blancos o lisos para tiendas en línea y catálogos.",
            "Documentos escaneados, recibos y fotos de identificación con fondos planos.",
            "Logotipos y gráficos montados sobre un bloque de color uniforme.",
            "Capturas de pantalla o renders donde el fondo detrás del elemento principal es parejo."
          ]
        },
        {
          heading: "Dónde se vuelve más complejo",
          paragraphs: ["Si el sujeto tiene mechones de cabello fino, vidrio o sombras del mismo tono que el fondo, una eliminación rápida dejará halos o perforará partes del objeto. Es el comportamiento natural del contraste de color, no un fallo de la herramienta, y por eso la vista previa es crucial. Toma una muestra de un tono medio del fondo en lugar de la esquina más oscura, sube un poco la tolerancia y haz zoom en los bordes antes de guardar."],
          tool: { label: "El eliminador de fondos de GainUtility funciona completamente en tu navegador.", toolId: "background-remover" }
        },
        {
          heading: "Paso a paso: quita un fondo en tu navegador",
          paragraphs: ["Para un fondo uniforme, todo el proceso toma menos de un minuto y no requiere instalar programas."],
          steps: [
            "Abre el eliminador de fondos de GainUtility y arrastra tu imagen (o haz clic para explorar, o pega desde el portapapeles).",
            "Haz clic en el color de fondo para tomar la muestra. Si la imagen tiene esquinas limpias, la herramienta suele detectarlo automáticamente.",
            "Ajusta la tolerancia: valores más altos quitan una gama más amplia de tonos parecidos; valores más bajos conservan solo el tono exacto.",
            "Aplica un ligero suavizado de bordes para que el recorte se integre sin dejar líneas duras.",
            "Elimina el fondo, revisa el resultado de antes y después —la transparencia se muestra con patrón de cuadrícula— y descarga tu PNG."
          ]
        },
        {
          heading: "Por qué importa procesar en el navegador",
          paragraphs: ["Nada se sube a internet, por lo que no hay tiempo de espera por transferencia, ni límites arbitrarios por imagen, ni copias de tus fotos almacenadas en servidores de terceros. La honestidad técnica es clave: la eliminación por color no es recorte con IA pesada, pero en imágenes de fondo plano ofrece un resultado igual de nítido e impecable."]
        }
      ]
    },
    "es-co": {
      title: "Cómo quitar el fondo de una imagen en el navegador",
      description: "Un fondo liso es el caso más sencillo: toma una muestra del color, elimínalo, ajusta los bordes y descarga un PNG transparente. Todo en tu navegador.",
      readingTime: "5 min de lectura",
      tags: ["quitar fondo", "imágenes", "fondo transparente", "privacidad"],
      categoryLabel: "Imágenes",
      quickAnswer: "Abre el eliminador de fondos de GainUtility, sube una imagen con fondo liso, selecciona el color de fondo y elimínalo. Obtendrás un PNG transparente que se descarga directamente a tu dispositivo.",
      keyTakeaway: "La eliminación basada en color limpia imágenes con fondo sólido en tu navegador: toma la muestra, revisa los bordes y el archivo nunca sale de tu dispositivo.",
      toolCta: { label: "Quita el fondo ahora — sin subir archivos, sin cuenta, nada sale de tu equipo.", toolId: "background-remover" },
      seoTitle: "Cómo quitar el fondo de una imagen | GainUtility",
      seoDescription: "Elimina un fondo liso en tu navegador: selecciona el color, ajusta la tolerancia, revisa los bordes y descarga un PNG transparente sin subir archivos.",
      content: [
        {
          paragraphs: [
            "La mayoría de las veces que alguien necesita “quitar el fondo”, se trata de un fondo de color liso: un ciclorama blanco, un fondo azul o una hoja de papel clara. Para ese caso habitual no necesitas un software de edición pesado ni un servicio que te envíe el archivo por correo. Solo necesitas detección de color, control de tolerancia y un poco de cuidado en los bordes.",
            "El método manual —lazo, desvanecer, hacer zoom y cazar píxeles sueltos— toma minutos y suele quedar irregular. Los servicios comerciales suben tu foto a sus servidores y cobran tras la primera prueba. Hay un camino intermedio que corre 100% en tu navegador."
          ]
        },
        {
          heading: "Cuándo funciona mejor la eliminación por color",
          paragraphs: ["La eliminación cromática borra todos los píxeles cercanos al color de fondo seleccionado. Funciona de manera sobresaliente en imágenes como:"],
          list: [
            "Fotos de productos tomadas sobre fondos blancos o lisos para tiendas en línea y catálogos.",
            "Documentos escaneados, recibos y fotos de identificación con fondos planos.",
            "Logotipos y gráficos montados sobre un bloque de color uniforme.",
            "Capturas de pantalla o renders donde el fondo detrás del elemento principal es parejo."
          ]
        },
        {
          heading: "Dónde se vuelve más complejo",
          paragraphs: ["Si el sujeto tiene mechones de cabello fino, vidrio o sombras del mismo tono que el fondo, una eliminación rápida dejará halos o perforará partes del objeto. Es el comportamiento natural del contraste de color, no un fallo de la herramienta, y por eso la vista previa es crucial. Toma una muestra de un tono medio del fondo en lugar de la esquina más oscura, sube un poco la tolerancia y haz zoom en los bordes antes de guardar."],
          tool: { label: "El eliminador de fondos de GainUtility funciona completamente en tu navegador.", toolId: "background-remover" }
        },
        {
          heading: "Paso a paso: quita un fondo en tu navegador",
          paragraphs: ["Para un fondo uniforme, todo el proceso toma menos de un minuto y no requiere instalar programas."],
          steps: [
            "Abre el eliminador de fondos de GainUtility y arrastra tu imagen (o haz clic para explorar, o pega desde el portapapeles).",
            "Haz clic en el color de fondo para tomar la muestra. Si la imagen tiene esquinas limpias, la herramienta suele detectarlo automáticamente.",
            "Ajusta la tolerancia: valores más altos quitan una gama más amplia de tonos parecidos; valores más bajos conservan solo el tono exacto.",
            "Aplica un ligero suavizado de bordes para que el recorte se integre sin dejar líneas duras.",
            "Elimina el fondo, revisa el resultado de antes y después —la transparencia se muestra con patrón de cuadrícula— y descarga tu PNG."
          ]
        },
        {
          heading: "Por qué importa procesar en el navegador",
          paragraphs: ["Nada se sube a internet, por lo que no hay tiempo de espera por transferencia, ni límites arbitrarios por imagen, ni copias de tus fotos almacenadas en servidores de terceros. La honestidad técnica es clave: la eliminación por color no es recorte con IA pesada, pero en imágenes de fondo plano ofrece un resultado igual de nítido e impecable."]
        }
      ]
    },
    "de": {
      title: "Hintergrund eines Bildes direkt im Browser entfernen",
      description: "Ein einfarbiger Hintergrund ist der einfachste Fall: Farbe aufnehmen, entfernen, Kanten prüfen und transparentes PNG herunterladen. Alles lokal im Browser.",
      readingTime: "5 Min. Lesezeit",
      tags: ["Hintergrund entfernen", "Bilder", "transparenter Hintergrund", "Datenschutz"],
      categoryLabel: "Bilder",
      quickAnswer: "Öffnen Sie den GainUtility Hintergrund-Entferner, laden Sie ein Bild mit einfarbigem Hintergrund, wählen Sie die Hintergrundfarbe aus und entfernen Sie sie. Das fertige transparente PNG wird direkt auf Ihr Gerät heruntergeladen.",
      keyTakeaway: "Farb-basierte Freistellung bereinigt einfarbige Hintergründe direkt im Browser: Farbe wählen, Kanten kontrollieren — die Datei verlässt nie Ihr Gerät.",
      toolCta: { label: "Hintergrund jetzt entfernen — kein Upload, kein Konto, alles bleibt auf Ihrem Gerät.", toolId: "background-remover" },
      seoTitle: "Hintergrund eines Bildes entfernen | GainUtility",
      seoDescription: "Einfarbigen Hintergrund im Browser entfernen: Farbe aufnehmen, Toleranz einstellen, Kanten glätten und transparentes PNG sichern. Ohne Upload.",
      content: [
        {
          paragraphs: [
            "In den meisten Fällen, in denen man einen Hintergrund entfernen möchte, handelt es sich um eine einheitliche Farbe: eine weiße Fotowand, ein Greenscreen oder ein helles Blatt Papier. Für diesen Standardfall benötigen Sie weder teure Grafiksoftware noch einen Onlinedienst, der Ihnen das Ergebnis per E-Mail schickt. Sie brauchen Farberkennung, Toleranzsteuerung und saubere Kantenverarbeitung.",
            "Der manuelle Weg mit Lasso-Werkzeug und Pixeljagd kostet wertvolle Minuten und sieht oft ausgefranst aus. Kommerzielle Cloud-Dienste laden Ihre Fotos hoch und verlangen meist nach dem ersten Bild Geld. Es gibt einen schnellen, privaten Weg: die Verarbeitung komplett im Browser."
          ]
        },
        {
          heading: "Wann die farbbasierte Freistellung optimal funktioniert",
          paragraphs: ["Die farbbasierte Entfernung löscht alle Pixel, die der ausgewählten Hintergrundfarbe ähnlich sind. Sie brilliert bei ganz bestimmten Bildtypen:"],
          list: [
            "Produktfotos auf weißem oder neutralem Grund für Onlineshops und Marktplätze.",
            "Gescannte Dokumente, Quittungen und Ausweisbilder mit homogenem Hintergrund.",
            "Logos und Vektorgrafiken auf einer Farbfläche.",
            "Screenshots oder 3D-Renderings mit gleichmäßigem Hintergrund."
          ]
        },
        {
          heading: "Wo Vorsicht geboten ist",
          paragraphs: ["Hat das Motiv feine Haarsträhnen, Glas oder Schatten in ähnlicher Farbe wie der Hintergrund, kann ein unüberlegter Klick unschöne Farbsäume erzeugen oder Löcher ins Motiv stanzen. Das ist ein physikalisches Phänomen von Farbabständen und kein Fehler des Werkzeugs. Nehmen Sie eine mittlere Nuance des Hintergrunds auf, passen Sie die Toleranz schrittweise an und zoomen Sie vor dem Download an die Ränder."],
          tool: { label: "Der GainUtility Hintergrund-Entferner läuft vollständig in Ihrem Browser.", toolId: "background-remover" }
        },
        {
          heading: "Schritt für Schritt im Browser freistellen",
          paragraphs: ["Bei homogenem Hintergrund dauert die Freistellung kaum eine Minute und erfordert keinerlei Softwareinstallation."],
          steps: [
            "Öffnen Sie den GainUtility Hintergrund-Entferner und ziehen Sie Ihr Bild hinein (oder wählen Sie es aus bzw. fügen Sie es aus der Zwischenablage ein).",
            "Klicken Sie auf den Hintergrund, um die Farbe aufzunehmen. Bei sauberen Ecken erkennt das Tool die Farbe meist automatisch.",
            "Passen Sie die Toleranz an: Höhere Werte erfassen mehr Farbnuancen, niedrigere Werte beschränken sich exakt auf die gewählte Farbe.",
            "Wählen Sie eine feine Kantenabrundung (Feathering), damit der Schnitt weich übergeht.",
            "Klicken Sie auf Entfernen, prüfen Sie das Schachbrettmuster für Transparenz und laden Sie die PNG-Datei herunter."
          ]
        },
        {
          heading: "Warum lokale Verarbeitung entscheidend ist",
          paragraphs: ["Es findet kein Datei-Upload statt. Das bedeutet: keine Wartezeit für Up- und Downloads, keine Beschränkungen der kostenlosen Nutzung und keine Kopie Ihrer privaten Fotos auf fremden Servern. Farb-basierte Freistellung ist transparent, berechenbar und liefert bei Studio- und Produktfotos makellose Resultate."]
        }
      ]
    },
    "fr": {
      title: "Comment supprimer l'arrière-plan d'une image dans votre navigateur",
      description: "Un fond uni est le cas le plus simple : prélevez la couleur, supprimez-la, vérifiez les contours et téléchargez un PNG transparent. Le tout dans votre navigateur.",
      readingTime: "5 min de lecture",
      tags: ["supprimer fond", "images", "fond transparent", "confidentialité"],
      categoryLabel: "Images",
      quickAnswer: "Ouvrez l'outil de suppression d'arrière-plan GainUtility, chargez une image avec un fond uni, prélevez la couleur de fond et supprimez-la. Vous obtenez un PNG transparent téléchargé directement sur votre appareil.",
      keyTakeaway: "La suppression par couleur nettoie les fonds unis directement dans le navigateur : prélevez la couleur, affinez les bords et le fichier ne quitte jamais votre appareil.",
      toolCta: { label: "Supprimer un arrière-plan maintenant — sans upload, sans compte, rien ne quitte votre appareil.", toolId: "background-remover" },
      seoTitle: "Comment supprimer l'arrière-plan d'une image | GainUtility",
      seoDescription: "Supprimez un fond uni dans votre navigateur : échantillonnez la couleur, réglez la tolérance, lissez les contours et téléchargez un PNG transparent.",
      content: [
        {
          paragraphs: [
            "La plupart du temps, lorsqu'on souhaite « enlever le fond » d'une image, il s'agit d'une couleur unie : un fond de studio blanc, un écran bleu ou une feuille de papier claire. Pour cette situation courante, nul besoin d'un logiciel lourd ou d'un service payant en ligne. Il vous faut simplement une détection de couleur, un réglage de tolérance et un soin particulier sur les contours.",
            "Le détourage manuel au lasso prend des minutes et produit souvent un tracé haché. Les services commerciaux téléversent votre cliché sur des serveurs distants et vous font payer après le premier essai. Il existe une voie directe qui s'exécute intégralement dans votre navigateur."
          ]
        },
        {
          heading: "Quand la suppression par couleur est la plus efficace",
          paragraphs: ["La suppression par incrustation chromatique supprime tous les pixels proches de la couleur sélectionnée. Elle excelle sur une catégorie précise d'images :"],
          list: [
            "Photos de produits sur fond blanc ou uni destinées aux boutiques en ligne et catalogues.",
            "Documents numérisés, reçus et photos d'identité avec arrière-plan plat.",
            "Logos et éléments graphiques posés sur un aplat de couleur.",
            "Captures d'écran ou rendus 3D dont l'arrière-plan est parfaitement homogène."
          ]
        },
        {
          heading: "Les situations demandant de la nuance",
          paragraphs: ["Si le sujet présente des cheveux fins, des reflets de verre ou des ombres de la même teinte que le fond, une découpe brute risque de laisser une frange ou d'entailler l'objet. Ce n'est pas un dysfonctionnement de l'outil, mais une réalité optique. Échantillonnez une teinte moyenne du fond plutôt que le coin le plus sombre, augmentez légèrement la tolérance et zoomez sur les bords avant de valider."],
          tool: { label: "L'outil de suppression d'arrière-plan GainUtility s'exécute entièrement dans votre navigateur.", toolId: "background-remover" }
        },
        {
          heading: "Étape par étape : supprimer l'arrière-plan dans le navigateur",
          paragraphs: ["Pour un fond homogène, l'opération prend moins d'une minute et ne requiert aucune installation."],
          steps: [
            "Ouvrez le suppresseur d'arrière-plan GainUtility et déposez votre image (ou parcourez vos fichiers, ou collez depuis le presse-papier).",
            "Échantillonnez la couleur d'arrière-plan en cliquant dessus. Si l'image possède des angles nets, l'outil la détecte automatiquement.",
            "Réglez la tolérance : une valeur élevée supprime une nuance plus large de teintes proches ; une valeur basse cible la teinte exacte.",
            "Appliquez un léger adoucissement des contours pour éviter les arêtes trop découpées.",
            "Supprimez le fond, vérifiez l'aperçu avant/après (le damier indique la transparence) et téléchargez le PNG."
          ]
        },
        {
          heading: "Pourquoi le traitement local est primordial",
          paragraphs: ["Aucun fichier n'est téléversé : pas d'attente de transfert, aucun quota arbitraire et aucune copie de vos visuels conservée sur un serveur tiers. La méthode est transparente : sur les images à fond uniforme, les découpes sont d'une netteté professionnelle."]
        }
      ]
    },
    "it": {
      title: "Come rimuovere lo sfondo da un'immagine nel browser",
      description: "Uno sfondo a tinta unita è il caso più semplice: campiona il colore, rimuovilo, rifinisci i bordi e scarica un PNG trasparente. Tutto nel tuo browser.",
      readingTime: "5 min di lettura",
      tags: ["rimuovi sfondo", "immagini", "sfondo trasparente", "privacy"],
      categoryLabel: "Immagini",
      quickAnswer: "Apri lo strumento di rimozione sfondo di GainUtility, carica un'immagine con sfondo uniforme, seleziona il colore dello sfondo ed eliminalo. Ottieni un PNG trasparente salvato direttamente sul tuo dispositivo.",
      keyTakeaway: "La rimozione basata sul colore pulisce immagini con sfondo uniforme nel browser: seleziona il colore, rifinisci i bordi e il file non lascia mai il tuo computer.",
      toolCta: { label: "Rimuovi lo sfondo ora — nessun upload, nessun account, nulla lascia il tuo dispositivo.", toolId: "background-remover" },
      seoTitle: "Come rimuovere lo sfondo da un'immagine | GainUtility",
      seoDescription: "Rimuovi uno sfondo uniforme nel tuo browser: campiona il colore, calibra la tolleranza, smussa i bordi e scarica un PNG trasparente senza upload.",
      content: [
        {
          paragraphs: [
            "La maggior parte delle volte in cui si desidera «rimuovere lo sfondo», ci si trova di fronte a una tinta unita: un fondale fotografico bianco, uno schermo blu o un foglio chiaro. Per questo caso comune non serve un software grafico complesso né un servizio che richiede email o abbonamenti. Servono solo rilevamento del colore, controllo della tolleranza e cura dei contorni.",
            "Il metodo manuale con lo strumento lazo richiede tempo e lascia bordi frastagliati. Le piattaforme commerciali caricano le tue foto su server esterni e chiedono pagamenti dopo il primo test. Esiste una via alternativa che funziona interamente nel tuo browser."
          ]
        },
        {
          heading: "Quando la rimozione basata su colore dà il meglio",
          paragraphs: ["La rimozione cromatica cancella ogni pixel vicino al colore di sfondo campionato. È perfetta per una classe specifica di immagini:"],
          list: [
            "Foto di prodotti scattate su fondali bianchi o neutri per ecommerce e cataloghi.",
            "Documenti scansionati, ricevute e fototessere con sfondo pulito.",
            "Loghi e grafiche posizionati su un blocco di colore solido.",
            "Screenshot o rendering 3D con ambiente uniforme dietro al soggetto."
          ]
        },
        {
          heading: "Le situazioni che richiedono attenzione",
          paragraphs: ["Se il soggetto presenta ciocche di capelli fini, superfici trasparenti o ombre dello stesso colore dello sfondo, una rimozione frettolosa potrebbe creare aloni o asportare porzioni del soggetto. È una caratteristica naturale della separazione cromatica, non un difetto dello strumento. Campiona un tono medio dello sfondo anziché l'angolo più buio, incrementa gradualmente la tolleranza e ingrandisci i bordi prima di scaricare."],
          tool: { label: "Lo strumento per rimuovere lo sfondo di GainUtility funziona interamente nel tuo browser.", toolId: "background-remover" }
        },
        {
          heading: "Passo dopo passo: rimuovi lo sfondo nel browser",
          paragraphs: ["Con uno sfondo uniforme l'intera procedura richiede circa un minuto e non serve installare nulla."],
          steps: [
            "Apri lo strumento di rimozione sfondo di GainUtility e trascina la tua immagine (o sfoglia i file, oppure incolla dagli appunti).",
            "Campiona il colore di sfondo cliccandoci sopra. Se l'immagine ha angoli regolari, lo strumento lo individua in automatico.",
            "Regola la tolleranza: valori più elevati includono una gamma più ampia di sfumature; valori più bassi isolano solo la tonalità cliccata.",
            "Applica una leggera sfumatura dei bordi (feathering) per fondere il ritaglio senza creare scalettature.",
            "Rimuovi lo sfondo, verifica l'anteprima prima/dopo — la trasparenza è indicata dalla scacchiera — e scarica il PNG finale."
          ]
        },
        {
          heading: "Perché l'elaborazione locale nel browser è vantaggiosa",
          paragraphs: ["Nessun dato viene inviato a server esterni: niente attese di trasferimento, nessun limite restrittivo e nessuna copia delle tue fotografie archiviata su server terzi. La rimozione per colore offre precisione immediata con massima riservatezza."]
        }
      ]
    },
    "id": {
      title: "Cara Menghapus Latar Belakang Gambar di Browser",
      description: "Latar belakang polos adalah kasus termudah: ambil sampel warna, hapus, periksa tepian, dan unduh PNG transparan. Semua langsung di browser Anda.",
      readingTime: "5 mnt membaca",
      tags: ["penghapus latar belakang", "gambar", "latar belakang transparan", "privasi"],
      categoryLabel: "Gambar",
      quickAnswer: "Buka penghapus latar belakang GainUtility, masukkan gambar berlatar polos, klik warna latar untuk mengambil sampel, lalu hapus. Hasilnya adalah PNG transparan yang langsung terunduh ke perangkat Anda.",
      keyTakeaway: "Penghapusan berbasis warna membersihkan gambar berlatar belakang solid langsung di browser: pilih warna, periksa tepian, dan file tidak pernah meninggalkan perangkat Anda.",
      toolCta: { label: "Hapus latar belakang sekarang — tanpa unggah, tanpa akun, data tetap di perangkat Anda.", toolId: "background-remover" },
      seoTitle: "Cara Menghapus Latar Belakang Gambar | GainUtility",
      seoDescription: "Hapus latar belakang polos di browser: ambil sampel warna, atur toleransi, rapikan tepi, dan unduh PNG transparan tanpa mengunggah ke server.",
      content: [
        {
          paragraphs: [
            "Sebagian besar kebutuhan menghapus latar belakang melibatkan latar satu warna: latar foto putih, layar biru, atau kertas terang. Untuk kasus yang sangat umum ini, Anda tidak memerlukan aplikasi edit foto yang berat atau layanan online yang mengirimkan hasil via email. Anda hanya butuh deteksi warna, pengaturan toleransi, dan sedikit kerapian pada tepian.",
            "Metode manual — lasso, feather, zoom dan mengejar piksel yang tertinggal — memakan waktu dan sering kali tampak kasar. Layanan komersial mengunggah foto Anda ke server mereka dan meminta biaya setelah gambar pertama. Ada jalan tengah yang berjalan sepenuhnya di browser Anda."
          ]
        },
        {
          heading: "Kapan penghapusan berbasis warna bekerja paling baik",
          paragraphs: ["Penghapusan berbasis warna (chroma-key) menghapus semua piksel yang mendekati warna latar yang dipilih. Cara ini sangat unggul untuk jenis gambar berikut:"],
          list: [
            "Foto produk berlatar putih atau polos untuk katalog dan toko online.",
            "Dokumen pindaian, tanda terima, dan pasfoto berlatar rata.",
            "Logo dan grafis yang berada di atas bidang warna solid.",
            "Tangkapan layar atau render 3D dengan latar belakang subjek yang seragam."
          ]
        },
        {
          heading: "Kondisi yang memerlukan perhatian ekstra",
          paragraphs: ["Jika subjek memiliki helai rambut halus, kaca transparan, atau bayangan dengan warna yang mirip latar, penghapusan cepat bisa menyisakan lingkaran warna atau melubangi subjek. Ini adalah sifat alami pemisahan warna, bukan kerusakan alat — dan itulah mengapa tahap pratinjau sangat penting. Ambil sampel dari nada tengah latar daripada sudut paling gelap, naikkan toleransi secara bertahap, dan perbesar tepian sebelum mengunduh hasil."],
          tool: { label: "Penghapus latar belakang GainUtility berjalan sepenuhnya di browser Anda.", toolId: "background-remover" }
        },
        {
          heading: "Langkah demi langkah: hapus latar belakang di browser",
          paragraphs: ["Untuk latar belakang yang seragam, seluruh proses hanya memakan waktu sekitar satu menit tanpa instalasi apa pun."],
          steps: [
            "Buka penghapus latar belakang GainUtility lalu seret gambar Anda (atau klik untuk memilih file, atau tempel dari clipboard).",
            "Pilih warna latar dengan mengekliknya. Jika gambar memiliki sudut polos, alat biasanya mendeteksi warna yang tepat secara otomatis.",
            "Sesuaikan toleransi: nilai yang lebih tinggi menghapus rentang nada yang lebih luas; nilai yang lebih rendah hanya mempertahankan warna yang persis diklik.",
            "Terapkan sedikit penghalusan tepi (feathering) agar potongan tampak alami tanpa garis tepi yang kaku.",
            "Hapus latar belakang, periksa pratinjau sebelum dan sesudah — transparansi ditandai dengan pola kotak-kotak — lalu unduh file PNG Anda."
          ]
        },
        {
          heading: "Mengapa pemrosesan lokal di browser sangat penting",
          paragraphs: ["Tidak ada file yang diunggah ke server mana pun, sehingga tidak ada waktu tunggu transfer, tidak ada batasan kuota gambar gratis, dan tidak ada salinan foto Anda yang tertinggal di server pihak ketiga. Metode ini jujur, cepat, dan memberikan hasil yang sangat rapi untuk foto produk dan grafis."]
        }
      ]
    }
  },

  "how-to-make-a-transparent-png": {
    "pt-br": {
      title: "Como criar uma imagem PNG transparente no navegador",
      description: "Um fundo transparente permite que uma imagem se encaixe em qualquer cor de página sem bordas brancas indesejadas. Veja como gerar uma no seu navegador.",
      readingTime: "4 min de leitura",
      tags: ["PNG transparente", "imagens", "design", "canal alfa"],
      categoryLabel: "Imagens",
      quickAnswer: "Carregue sua imagem no removedor de fundo da GainUtility, isole a cor de fundo com um clique e exporte no formato PNG. O formato PNG preserva o canal alfa nativamente.",
      keyTakeaway: "Transparência real significa ausência total de fundo: a remoção por cor cria um arquivo PNG com canal alfa autêntico direto no navegador.",
      toolCta: { label: "Transforme uma imagem em PNG transparente no seu navegador.", toolId: "background-remover" },
      seoTitle: "Como criar um PNG transparente | GainUtility",
      seoDescription: "Aprenda a criar imagens PNG com fundo transparente no navegador. Sem upload, sem perda de qualidade e com canal alfa autêntico.",
      content: [
        {
          paragraphs: ["Muitos usuários descobrem a necessidade de um PNG transparente quando colam uma imagem em um slide escuro ou em uma página web e encontram um retângulo branco rígido ao redor da figura. O formato JPEG não suporta transparência; o formato PNG suporta. Veja como resolver isso em poucos segundos."]
        },
        {
          heading: "Por que a transparência exige PNG",
          paragraphs: ["Imagens digitais comuns armazenam três canais de cor: vermelho, verde e azul (RGB). O formato PNG adiciona um quarto canal dedicado: o canal alfa (RGBA). Esse canal armazena a opacidade exata de cada pixel, de 0% (invisível) a 100% (completamente sólido). Sem o canal alfa, todo pixel vazio precisa ser preenchido com uma cor padrão, quase sempre o branco."]
        },
        {
          heading: "“Fundo branco” não é “sem fundo”",
          paragraphs: [
            "Um fundo branco parece transparente quando visto contra uma página branca, mas revela suas bordas no primeiro momento em que o plano de fundo muda para cinza, colorido ou escuro.",
            "Para que um logotipo, assinatura ou foto de produto se sobreponha de forma profissional a qualquer interface, o fundo não deve ser branco — ele deve simplesmente não existir."
          ]
        },
        {
          heading: "Como criar o PNG transparente no seu navegador",
          paragraphs: ["Você não precisa de assinaturas de softwares de edição nem de instalar extensões:"],
          steps: [
            "Abra o removedor de fundo da GainUtility no seu navegador.",
            "Carregue a imagem (JPEG, WebP ou PNG existente com fundo sólido).",
            "Clique na cor que você deseja tornar invisível.",
            "Ajuste o controle de tolerância para limpar sombras suaves perto do sujeito.",
            "Verifique o padrão quadriculado que indica os pixels transparentes.",
            "Clique em baixar: o arquivo é salvo no formato PNG de 32 bits com transparência preservada."
          ]
        },
        {
          heading: "Quando não vale a pena transformar em PNG",
          paragraphs: ["Se sua imagem for uma fotografia de paisagem completa, sem intenção de sobreposição, o JPEG ou WebP manterão o tamanho de arquivo menor. Use PNG transparente para logotipos, ícones, ilustrações, assinaturas e recortes de produtos."],
          tool: { label: "Crie um PNG transparente agora mesmo sem instalar nada.", toolId: "background-remover" }
        }
      ]
    },
    "es-mx": {
      title: "Cómo crear una imagen PNG transparente en el navegador",
      description: "Un fondo transparente permite que una imagen se adapte a cualquier color de página sin recuadros blancos. Aprende a crearla en tu navegador.",
      readingTime: "4 min de lectura",
      tags: ["PNG transparente", "imágenes", "diseño", "canal alfa"],
      categoryLabel: "Imágenes",
      quickAnswer: "Sube tu imagen al eliminador de fondos de GainUtility, selecciona el color de fondo para removerlo y descárgala en formato PNG con canal alfa auténtico.",
      keyTakeaway: "La transparencia real significa ausencia total de fondo: la eliminación por color genera un PNG con canal alfa genuino en tu navegador.",
      toolCta: { label: "Convierte una imagen en PNG transparente en tu navegador.", toolId: "background-remover" },
      seoTitle: "Cómo crear un PNG transparente | GainUtility",
      seoDescription: "Aprende a generar imágenes PNG con fondo transparente en tu navegador. Rápido, privado y con canal alfa genuino.",
      content: [
        {
          paragraphs: ["Muchos usuarios descubren la necesidad de un PNG transparente al pegar un logotipo en una presentación oscura y encontrarse con un recuadro blanco molesto alrededor. Los archivos JPEG no admiten transparencia; los archivos PNG sí. Aquí te explicamos cómo lograrlo en segundos."]
        },
        {
          heading: "Por qué la transparencia requiere formato PNG",
          paragraphs: ["Los formatos de imagen estándar guardan canales rojo, verde y azul (RGB). El formato PNG añade un cuarto canal: el canal alfa (RGBA). Este canal define el grado exacto de opacidad de cada píxel, de 0% (completamente transparente) a 100% (completamente sólido). Sin este canal, los píxeles vacíos se rellenan con un color sólido, casi siempre blanco."]
        },
        {
          heading: "“Fondo blanco” no significa “sin fondo”",
          paragraphs: [
            "Un fondo blanco aparenta ser transparente únicamente mientras se visualiza sobre una superficie blanca. En cuanto el fondo cambia a gris, color o modo oscuro, el recuadro blanco se hace visible de inmediato.",
            "Para que un logotipo, icono o producto se integre de manera limpia sobre cualquier fondo, no debe tener un fondo blanco: debe carecer por completo de fondo."
          ]
        },
        {
          heading: "Cómo hacer un PNG transparente en tu navegador",
          paragraphs: ["No requieres programas pesados ni suscripciones de pago:"],
          steps: [
            "Abre el eliminador de fondos de GainUtility en tu navegador.",
            "Carga la imagen con fondo liso (JPEG, WebP o PNG).",
            "Haz clic en el fondo para marcar el color que deseas volver transparente.",
            "Ajusta el deslizador de tolerancia para eliminar los bordes tenues.",
            "Comprueba que el fondo muestre el patrón cuadriculado característico de la transparencia.",
            "Haz clic en descargar para guardar el archivo PNG con canal alfa."
          ]
        },
        {
          heading: "Cuándo no conviene usar PNG",
          paragraphs: ["Si se trata de una fotografía de paisaje o un fondo completo sin transparencias, los formatos JPEG o WebP ofrecen un archivo mucho más ligero. Reserva el PNG para logotipos, iconos, gráficos vectoriales, firmas y recortes."],
          tool: { label: "Genera un PNG transparente en segundos sin instalar nada.", toolId: "background-remover" }
        }
      ]
    },
    "es-co": {
      title: "Cómo crear una imagen PNG transparente en el navegador",
      description: "Un fondo transparente permite que una imagen se adapte a cualquier color de página sin recuadros blancos. Aprende a crearla en tu navegador.",
      readingTime: "4 min de lectura",
      tags: ["PNG transparente", "imágenes", "diseño", "canal alfa"],
      categoryLabel: "Imágenes",
      quickAnswer: "Sube tu imagen al eliminador de fondos de GainUtility, selecciona el color de fondo para removerlo y descárgala en formato PNG con canal alfa auténtico.",
      keyTakeaway: "La transparencia real significa ausencia total de fondo: la eliminación por color genera un PNG con canal alfa genuino en tu navegador.",
      toolCta: { label: "Convierte una imagen en PNG transparente en tu navegador.", toolId: "background-remover" },
      seoTitle: "Cómo crear un PNG transparente | GainUtility",
      seoDescription: "Aprende a generar imágenes PNG con fondo transparente en tu navegador. Rápido, privado y con canal alfa genuino.",
      content: [
        {
          paragraphs: ["Muchos usuarios descubren la necesidad de un PNG transparente al pegar un logotipo en una presentación oscura y encontrarse con un recuadro blanco molesto alrededor. Los archivos JPEG no admiten transparencia; los archivos PNG sí. Aquí te explicamos cómo lograrlo en segundos."]
        },
        {
          heading: "Por qué la transparencia requiere formato PNG",
          paragraphs: ["Los formatos de imagen estándar guardan canales rojo, verde y azul (RGB). El formato PNG añade un cuarto canal: el canal alfa (RGBA). Este canal define el grado exacto de opacidad de cada píxel, de 0% (completamente transparente) a 100% (completamente sólido). Sin este canal, los píxeles vacíos se rellenan con un color sólido, casi siempre blanco."]
        },
        {
          heading: "“Fondo blanco” no significa “sin fondo”",
          paragraphs: [
            "Un fondo blanco aparenta ser transparente únicamente mientras se visualiza sobre una superficie blanca. En cuanto el fondo cambia a gris, color o modo oscuro, el recuadro blanco se hace visible de inmediato.",
            "Para que un logotipo, icono o producto se integre de manera limpia sobre cualquier fondo, no debe tener un fondo blanco: debe carecer por completo de fondo."
          ]
        },
        {
          heading: "Cómo hacer un PNG transparente en tu navegador",
          paragraphs: ["No requieres programas pesados ni suscripciones de pago:"],
          steps: [
            "Abre el eliminador de fondos de GainUtility en tu navegador.",
            "Carga la imagen con fondo liso (JPEG, WebP o PNG).",
            "Haz clic en el fondo para marcar el color que deseas volver transparente.",
            "Ajusta el deslizador de tolerancia para eliminar los bordes tenues.",
            "Comprueba que el fondo muestre el patrón cuadriculado característico de la transparencia.",
            "Haz clic en descargar para guardar el archivo PNG con canal alfa."
          ]
        },
        {
          heading: "Cuándo no conviene usar PNG",
          paragraphs: ["Si se trata de una fotografía de paisaje o un fondo completo sin transparencias, los formatos JPEG o WebP ofrecen un archivo mucho más ligero. Reserva el PNG para logotipos, iconos, gráficos vectoriales, firmas y recortes."],
          tool: { label: "Genera un PNG transparente en segundos sin instalar nada.", toolId: "background-remover" }
        }
      ]
    },
    "de": {
      title: "Transparente PNG-Grafik im Browser erstellen",
      description: "Ein transparenter Hintergrund sorgt dafür, dass ein Bild auf jeder Hintergrundfarbe nahtlos sitzt. So erstellen Sie ein transparentes PNG direkt im Browser.",
      readingTime: "4 Min. Lesezeit",
      tags: ["transparentes PNG", "Bilder", "Grafik", "Alphakanal"],
      categoryLabel: "Bilder",
      quickAnswer: "Laden Sie Ihr Bild in den GainUtility Hintergrund-Entferner, nehmen Sie die Hintergrundfarbe auf, entfernen Sie sie und speichern Sie die Datei als PNG mit echtem Alphakanal.",
      keyTakeaway: "Echte Transparenz bedeutet kein Hintergrund: Farbentfernung liefert Ihnen ein PNG mit vollwertigem Alphakanal direkt im Browser.",
      toolCta: { label: "Bild im Browser in ein transparentes PNG umwandeln.", toolId: "background-remover" },
      seoTitle: "Transparente PNG-Grafik erstellen | GainUtility",
      seoDescription: "Erstellen Sie transparente PNG-Bilder direkt im Browser ohne Software-Download. Mit echtem Alphakanal und ohne Qualitätsverlust.",
      content: [
        {
          paragraphs: ["Oft bemerkt man das Problem erst bei Präsentationen oder Webseiten: Man platziert ein Logo auf einem dunklen Hintergrund und hat plötzlich einen störenden weißen Kasten drumherum. Das JPEG-Format unterstützt keine Transparenz — das PNG-Format hingegen schon."]
        },
        {
          heading: "Warum Transparenz zwingend PNG erfordert",
          paragraphs: ["Klassische Bildformate speichern drei Farbkanäle: Rot, Grün und Blau (RGB). Das PNG-Format bietet einen vierten Kanal: den Alphakanal (RGBA). Dieser speichert für jeden Pixel exakt, wie durchsichtig er ist (von 0 % unsichtbar bis 100 % deckend). Fehlt dieser Kanal, wird der leere Raum automatisch mit einer Standardfarbe gefüllt — meist weiß."]
        },
        {
          heading: "„Weißer Hintergrund“ ist nicht „kein Hintergrund“",
          paragraphs: [
            "Auf einem weißen Dokument wirkt ein weißer Hintergrund unsichtbar. Sobald das Dokument aber einen farbigen Hintergrund, ein Muster oder den Dark Mode nutzt, sticht der weiße Rahmen sofort störend hervor.",
            "Damit Logos, Unterschriften und Freisteller überall professionell wirken, darf der Hintergrund nicht weiß sein — er muss schlicht inexistent sein."
          ]
        },
        {
          heading: "So erstellen Sie ein transparentes PNG im Browser",
          paragraphs: ["Sie benötigen weder teure Abos noch aufwendige Bildbearbeitungsprogramme:"],
          steps: [
            "Öffnen Sie den GainUtility Hintergrund-Entferner in Ihrem Browser.",
            "Laden Sie Ihr Bild (JPEG, WebP oder PNG mit einfarbigem Grund) hoch.",
            "Klicken Sie auf den Hintergrund, um die zu entfernende Farbe festzulegen.",
            "Passen Sie die Toleranz an, um eventuelle Farbränder sauber abzutrennen.",
            "Überprüfen Sie das graue Schachbrettmuster für die freigestellten Pixel.",
            "Klicken Sie auf Herunterladen, um das fertige 32-Bit-PNG mit Transparenz zu sichern."
          ]
        },
        {
          heading: "Wann PNG nicht die beste Wahl ist",
          paragraphs: ["Für vollflächige Fotos ohne Aussparungen sind WebP oder JPEG deutlich speichereffizienter. Nutzen Sie PNG gezielt für Logos, Icons, Diagramme, Unterschriften und freigestellte Produktaufnahmen."],
          tool: { label: "Jetzt transparentes PNG erstellen — ganz ohne Installation.", toolId: "background-remover" }
        }
      ]
    },
    "fr": {
      title: "Comment créer une image PNG transparente dans le navigateur",
      description: "Un fond transparent permet à une image de s'intégrer sur n'importe quelle couleur sans cadre blanc. Voici comment en générer une dans votre navigateur.",
      readingTime: "4 min de lecture",
      tags: ["PNG transparent", "images", "design", "canal alpha"],
      categoryLabel: "Images",
      quickAnswer: "Chargez votre visuel dans le suppresseur de fond GainUtility, prélevez la couleur unie à éliminer et téléchargez le résultat en PNG avec canal alpha préservé.",
      keyTakeaway: "Une vraie transparence signifie l'absence totale de fond : l'extraction de couleur génère un fichier PNG avec canal alpha natif directement dans le navigateur.",
      toolCta: { label: "Transformer une image en PNG transparent dans votre navigateur.", toolId: "background-remover" },
      seoTitle: "Comment créer un PNG transparent | GainUtility",
      seoDescription: "Apprenez à générer des fichiers PNG à fond transparent directement dans votre navigateur. Gratuit, local et avec un canal alpha parfait.",
      content: [
        {
          paragraphs: ["C'est une mésaventure fréquente : vous insérez un logo sur une diapositive sombre ou une page web, et un bloc blanc rigide apparaît autour du dessin. Le format JPEG ne prend pas en charge la transparence ; le format PNG est conçu pour cela."]
        },
        {
          heading: "Pourquoi la transparence exige le format PNG",
          paragraphs: ["Les formats graphiques standards enregistrent trois canaux de couleur : rouge, vert et bleu (RVB). Le format PNG intègre un quatrième canal : le canal alpha (RGBA). Ce canal gère l'opacité précise de chaque pixel, de 0 % (totalement invisible) à 100 % (opaque). Sans ce canal, tout espace vide est forcé vers une couleur solide, presque toujours le blanc."]
        },
        {
          heading: "« Fond blanc » ne veut pas dire « sans fond »",
          paragraphs: [
            "Un fond blanc donne l'illusion de la transparence tant qu'il repose sur une page blanche. Dès que le support devient coloré, texturé ou sombre, la démarcation devient flagrante.",
            "Pour qu'un logo, une signature ou une photo d'objet se fondent parfaitement dans une interface, le fond ne doit pas être blanc : il ne doit simplement pas exister."
          ]
        },
        {
          heading: "Créer un PNG transparent dans votre navigateur",
          paragraphs: ["Inutile d'installer des logiciels lourds ou de payer un abonnement :"],
          steps: [
            "Ouvrez le suppresseur d'arrière-plan GainUtility dans votre navigateur.",
            "Déposez votre image (JPEG, WebP ou PNG à fond uni).",
            "Cliquez sur la couleur d'arrière-plan pour définir la zone à rendre transparente.",
            "Ajustez le curseur de tolérance pour lisser les micro-variations de teinte.",
            "Vérifiez l'apparition du damier classique indiquant la transparence.",
            "Téléchargez le fichier PNG 32 bits avec canal alpha intégré."
          ]
        },
        {
          heading: "Quand éviter le format PNG",
          paragraphs: ["Pour une photographie de paysage sans zone découpée, les formats WebP ou JPEG restent beaucoup plus légers. Réservez le format PNG aux logos, pictogrammes, signatures et produits détourés."],
          tool: { label: "Créez votre PNG transparent sans installer aucun logiciel.", toolId: "background-remover" }
        }
      ]
    },
    "it": {
      title: "Come creare un'immagine PNG trasparente nel browser",
      description: "Uno sfondo trasparente consente a un'immagine di adattarsi a qualsiasi colore di pagina senza fastidiosi riquadri bianchi. Ecco come crearne una nel browser.",
      readingTime: "4 min di lettura",
      tags: ["PNG trasparente", "immagini", "grafica", "canale alfa"],
      categoryLabel: "Immagini",
      quickAnswer: "Carica l'immagine nello strumento di rimozione sfondo di GainUtility, seleziona il colore di sfondo da azzerare ed esporta in formato PNG con canale alfa autentico.",
      keyTakeaway: "La vera trasparenza significa assenza totale di sfondo: la rimozione cromatica genera un file PNG con canale alfa direttamente nel browser.",
      toolCta: { label: "Trasforma un'immagine in un PNG trasparente nel tuo browser.", toolId: "background-remover" },
      seoTitle: "Come creare un PNG trasparente | GainUtility",
      seoDescription: "Scopri come creare file PNG con sfondo trasparente direttamente nel tuo browser. Senza upload, gratuito e con canale alfa nitido.",
      content: [
        {
          paragraphs: ["Capita spesso di inserire un logo in una presentazione scura e ritrovarsi con un fastidioso rettangolo bianco intorno all'icona. Il formato JPEG non supporta la trasparenza, mentre il formato PNG è nato proprio per questo scopo."]
        },
        {
          heading: "Perché la trasparenza richiede il formato PNG",
          paragraphs: ["I formati tradizionali memorizzano tre canali cromatici: rosso, verde e blu (RGB). Il formato PNG include un quarto canale essenziale: il canale alfa (RGBA). Questo canale definisce con precisione l'opacità di ogni pixel, da 0% (invisibile) a 100% (completamente solido). Senza il canale alfa, lo spazio vuoto deve per forza tingersi di un colore di riempimento, di solito bianco."]
        },
        {
          heading: "“Sfondo bianco” non significa “nessuno sfondo”",
          paragraphs: [
            "Uno sfondo bianco sembra trasparente solo finché poggia su un foglio bianco. Non appena il contenitore diventa scuro, colorato o passa alla modalità notturna, il contorno bianco risalta in modo antiestetico.",
            "Affinché un logo o una firma si integrino con eleganza in qualsiasi contesto, lo sfondo non deve essere tinto di bianco: deve essere totalmente assente."
          ]
        },
        {
          heading: "Come creare un PNG trasparente nel tuo browser",
          paragraphs: ["Non servono software costosi né estensioni da installare:"],
          steps: [
            "Apri lo strumento di rimozione sfondo di GainUtility nel tuo browser.",
            "Carica l'immagine (JPEG, WebP o PNG con sfondo uniforme).",
            "Fai clic sullo sfondo per selezionare il colore da rendere trasparente.",
            "Regola la tolleranza per pulire eventuali sfumature residue vicino ai bordi.",
            "Verifica che compaia la classica scacchiera indicante la trasparenza.",
            "Scarica il file: otterrai un PNG a 32 bit con trasparenza nativa."
          ]
        },
        {
          heading: "Quando non conviene usare il PNG",
          paragraphs: ["Se devi archiviare fotografie complete o paesaggi privi di ritagli, i formati JPEG o WebP offrono una compressione molto più efficiente. Riserva il PNG trasparente a loghi, icone, firme e foto di prodotti scontornati."],
          tool: { label: "Crea un PNG trasparente adesso senza installare nulla.", toolId: "background-remover" }
        }
      ]
    },
    "id": {
      title: "Cara Membuat Gambar PNG Transparan di Browser",
      description: "Latar belakang transparan memungkinkan gambar menyatu dengan warna halaman apa pun tanpa kotak putih di sekitarnya. Begini cara membuatnya di browser.",
      readingTime: "4 mnt membaca",
      tags: ["PNG transparan", "gambar", "desain", "saluran alfa"],
      categoryLabel: "Gambar",
      quickAnswer: "Muat gambar Anda ke penghapus latar belakang GainUtility, klik warna latar untuk menghapusnya, lalu unduh dalam format PNG yang mendukung saluran alfa.",
      keyTakeaway: "Transparansi sejati berarti tidak ada latar sama sekali: penghapusan warna menghasilkan file PNG dengan saluran alfa asli langsung di browser.",
      toolCta: { label: "Ubah gambar menjadi PNG transparan di browser Anda.", toolId: "background-remover" },
      seoTitle: "Cara Membuat PNG Transparan | GainUtility",
      seoDescription: "Pelajari cara membuat file PNG berlatar transparan langsung di browser Anda. Cepat, privat, dan dengan saluran alfa berkualitas tinggi.",
      content: [
        {
          paragraphs: ["Banyak orang baru menyadari pentingnya PNG transparan saat menempelkan logo ke presentasi bertema gelap dan melihat kotak putih kaku di sekitar gambar. Format JPEG tidak mendukung transparansi, sedangkan format PNG dirancang untuk itu."]
        },
        {
          heading: "Mengapa transparansi memerlukan format PNG",
          paragraphs: ["Format gambar biasa menyimpan tiga saluran warna: Merah, Hijau, dan Biru (RGB). Format PNG menambahkan saluran keempat: saluran alfa (RGBA). Saluran ini menyimpan tingkat opasitas pasti untuk setiap piksel, dari 0% (transparan penuh) hingga 100% (padat). Tanpa saluran alfa, area kosong harus diisi dengan warna padat, yang umumnya berwarna putih."]
        },
        {
          heading: "“Latar belakang putih” bukan berarti “tanpa latar”",
          paragraphs: [
            "Latar belakang putih tampak transparan hanya selama ditempatkan di atas permukaan putih. Begitu latar berubah menjadi abu-abu, berwarna, atau mode gelap, kotak putih tersebut langsung terlihat jelas dan mengganggu.",
            "Agar logo, ikon, atau produk terlihat menyatu sempurna di tampilan mana pun, latar belakangnya tidak boleh berwarna putih — latar tersebut harus benar-benar tidak ada."
          ]
        },
        {
          heading: "Cara membuat PNG transparan di browser Anda",
          paragraphs: ["Anda tidak memerlukan langganan aplikasi mahal atau instalasi software tambahan:"],
          steps: [
            "Buka penghapus latar belakang GainUtility di browser Anda.",
            "Muat gambar Anda (file JPEG, WebP, atau PNG berlatar polos).",
            "Klik pada warna latar yang ingin Anda jadikan transparan.",
            "Atur penggeser toleransi untuk membersihkan bayangan halus di sekitar tepi.",
            "Perhatikan pola kotak-kotak catur yang menandakan piksel transparan.",
            "Klik unduh untuk menyimpan file PNG 32-bit dengan transparansi penuh."
          ]
        },
        {
          heading: "Kapan tidak perlu menggunakan PNG",
          paragraphs: ["Jika gambar Anda adalah foto pemandangan penuh tanpa kebutuhan potongan, format JPEG atau WebP akan menghasilkan ukuran file yang jauh lebih ringkas. Gunakan PNG transparan khusus untuk logo, ikon, tanda tangan, dan foto produk potongan."],
          tool: { label: "Buat gambar PNG transparan sekarang tanpa instalasi apa pun.", toolId: "background-remover" }
        }
      ]
    }
  },

  "how-to-compress-an-image": {
    "pt-br": {
      title: "Como comprimir imagens sem perder qualidade perceptível",
      description: "O tamanho de uma imagem depende de dois fatores: dimensões em pixels e nível de compressão. Ajuste-os na ordem certa e a foto continuará nítida.",
      readingTime: "4 min de leitura",
      tags: ["comprimir imagem", "WebP", "otimização", "desempenho"],
      categoryLabel: "Imagens",
      quickAnswer: "Redimensione a imagem para a largura máxima em que ela será exibida e, em seguida, converta-a para WebP com qualidade entre 80% e 85%. Isso costuma reduzir o peso em até 80% sem perda visual perceptível.",
      keyTakeaway: "Ajuste as dimensões primeiro e a qualidade depois: só comprima até o ponto em que a imagem continue nítida na pré-visualização.",
      toolCta: { label: "Reduza o peso de uma imagem — redimensione e converta para WebP com pré-visualização ao vivo.", toolId: "image-converter" },
      seoTitle: "Como comprimir imagens sem perder qualidade | GainUtility",
      seoDescription: "Descubra o método correto para comprimir imagens: controle de dimensões em pixels, formato WebP moderno e compressão eficiente no navegador.",
      content: [
        {
          paragraphs: [
            "Imagens pesadas são o motivo número um para páginas lentas na web e falhas de envio em formulários com limite de upload. No entanto, muitas pessoas tentam comprimir uma foto de 15 MB forçando a qualidade para 30%, resultando em uma imagem borrada e cheia de ruídos visuais.",
            "Existe uma ordem correta para reduzir arquivos de imagem que preserva os detalhes nítidos e diminui drasticamente o peso em kilobytes."
          ]
        },
        {
          heading: "Primeiro ajuste: as dimensões em pixels",
          paragraphs: ["Se sua câmera tira fotos com 6000x4000 pixels, mas o site onde você vai publicar exibe no máximo 1200 pixels de largura, você está transmitindo 20 vezes mais pixels do que a tela é capaz de mostrar. Redimensionar para a largura máxima real de exibição elimina a maior parte do peso antes mesmo de aplicar compressão de qualidade."]
        },
        {
          heading: "Segundo ajuste: o nível de compressão e formato",
          paragraphs: [
            "Depois de adequar a resolução, escolha um formato moderno como WebP ou ajuste o fator de compressão JPEG. Um nível de qualidade entre 80% e 85% descarta dados visuais que o olho humano não distingue em telas normais.",
            "Evite reduzir a qualidade abaixo de 70%, a menos que o limite de tamanho do arquivo exija estritamente isso."
          ],
          tool: { label: "Converta e comprima imagens direto no seu navegador com o conversor GainUtility.", toolId: "image-converter" }
        },
        {
          heading: "Um exemplo real de antes e depois",
          paragraphs: ["Veja como a ordem correta transforma o arquivo:"],
          list: [
            "Foto original da câmera: 6000x4000 px, JPEG, peso de 8,4 MB.",
            "Apenas redimensionada para 1600x1066 px: peso reduzido para 1,1 MB (sem perda de qualidade visível).",
            "Convertida para WebP a 82% de qualidade: peso final de 180 KB — uma redução de mais de 97% com nitidez visual idêntica na tela."
          ]
        },
        {
          heading: "Quando parar de comprimir",
          paragraphs: ["Pare de comprimir assim que o arquivo atingir o limite estipulado pelo formulário ou quando textos e linhas finas começarem a apresentar artefatos ao redor. A inspeção visual na tela real é sempre o teste definitivo."]
        }
      ]
    },
    "es-mx": {
      title: "Cómo comprimir imágenes sin perder calidad visible",
      description: "El tamaño de una imagen depende de dos factores: dimensiones en píxeles y nivel de compresión. Modifícalos en el orden adecuado para mantener la nitidez.",
      readingTime: "4 min de lectura",
      tags: ["comprimir imagen", "WebP", "optimización", "rendimiento"],
      categoryLabel: "Imágenes",
      quickAnswer: "Primero escala la imagen al ancho máximo en que se visualizará y luego conviértela a WebP con calidad del 80% al 85%. Reducirás el peso hasta un 80% sin pérdida perceptible.",
      keyTakeaway: "Cambia las dimensiones primero y la calidad después: comprime únicamente hasta que la vista previa conserve nitidez.",
      toolCta: { label: "Reduce el peso de una imagen — redimensiona y convierte a WebP con vista previa en vivo.", toolId: "image-converter" },
      seoTitle: "Cómo comprimir imágenes sin perder calidad | GainUtility",
      seoDescription: "Aprende a comprimir imágenes de forma óptima: reducción de píxeles, formato WebP moderno y compresión limpia en tu navegador.",
      content: [
        {
          paragraphs: [
            "Las fotos pesadas son la causa principal de la lentitud en sitios web y de rechazos en formularios de carga. Mucha gente intenta resolverlo bajando la calidad al 30%, lo que genera imágenes borrosas y llenas de artefactos desagradables.",
            "Existe un método estructurado para reducir kilobytes manteniendo los detalles nítidos."
          ]
        },
        {
          heading: "Primer ajuste: las dimensiones en píxeles",
          paragraphs: ["Si tu cámara toma fotos a 6000x4000 píxeles, pero la imagen se mostrará a un ancho máximo de 1200 píxeles, estás guardando millones de píxeles invisibles para el usuario. Escalar la imagen a su tamaño de uso real ahorra la mayor parte del peso antes de comprimir."]
        },
        {
          heading: "Segundo ajuste: calidad y formato",
          paragraphs: [
            "Una vez ajustadas las dimensiones, convierte a formatos modernos como WebP o ajusta la compresión JPEG. Una calidad de entre 80% y 85% descarta datos imperceptibles para el ojo humano en pantallas comunes.",
            "Evita descender del 70% de calidad salvo que un límite estricto de kilobytes te obligue a hacerlo."
          ],
          tool: { label: "Convierte y comprime imágenes en tu navegador con GainUtility.", toolId: "image-converter" }
        },
        {
          heading: "Un caso realista de antes y después",
          paragraphs: ["Observa la diferencia de seguir el orden correcto:"],
          list: [
            "Foto original de cámara: 6000x4000 px, JPEG, 8.4 MB.",
            "Solo redimensionada a 1600x1066 px: 1.1 MB (sin pérdida perceptible).",
            "Convertida a WebP con calidad al 82%: 180 KB — reducción superior al 97% luciendo exactamente igual en pantalla."
          ]
        },
        {
          heading: "Cuándo detener la compresión",
          paragraphs: ["Detén la compresión en cuanto alcances el límite exigido por tu plataforma o cuando las tipografías y bordes comiencen a verse borrosos. La vista previa en pantalla es tu mejor aliada."]
        }
      ]
    },
    "es-co": {
      title: "Cómo comprimir imágenes sin perder calidad visible",
      description: "El tamaño de una imagen depende de dos factores: dimensiones en píxeles y nivel de compresión. Modifícalos en el orden adecuado para mantener la nitidez.",
      readingTime: "4 min de lectura",
      tags: ["comprimir imagen", "WebP", "optimización", "rendimiento"],
      categoryLabel: "Imágenes",
      quickAnswer: "Primero escala la imagen al ancho máximo en que se visualizará y luego conviértela a WebP con calidad del 80% al 85%. Reducirás el peso hasta un 80% sin pérdida perceptible.",
      keyTakeaway: "Cambia las dimensiones primero y la calidad después: comprime únicamente hasta que la vista previa conserve nitidez.",
      toolCta: { label: "Reduce el peso de una imagen — redimensiona y convierte a WebP con vista previa en vivo.", toolId: "image-converter" },
      seoTitle: "Cómo comprimir imágenes sin perder calidad | GainUtility",
      seoDescription: "Aprende a comprimir imágenes de forma óptima: reducción de píxeles, formato WebP moderno y compresión limpia en tu navegador.",
      content: [
        {
          paragraphs: [
            "Las fotos pesadas son la causa principal de la lentitud en sitios web y de rechazos en formularios de carga. Mucha gente intenta resolverlo bajando la calidad al 30%, lo que genera imágenes borrosas y llenas de artefactos desagradables.",
            "Existe un método estructurado para reducir kilobytes manteniendo los detalles nítidos."
          ]
        },
        {
          heading: "Primer ajuste: las dimensiones en píxeles",
          paragraphs: ["Si tu cámara toma fotos a 6000x4000 píxeles, pero la imagen se mostrará a un ancho máximo de 1200 píxeles, estás guardando millones de píxeles invisibles para el usuario. Escalar la imagen a su tamaño de uso real ahorra la mayor parte del peso antes de comprimir."]
        },
        {
          heading: "Segundo ajuste: calidad y formato",
          paragraphs: [
            "Una vez ajustadas las dimensiones, convierte a formatos modernos como WebP o ajusta la compresión JPEG. Una calidad de entre 80% y 85% descarta datos imperceptibles para el ojo humano en pantallas comunes.",
            "Evita descender del 70% de calidad salvo que un límite estricto de kilobytes te obligue a hacerlo."
          ],
          tool: { label: "Convierte y comprime imágenes en tu navegador con GainUtility.", toolId: "image-converter" }
        },
        {
          heading: "Un caso realista de antes y después",
          paragraphs: ["Observa la diferencia de seguir el orden correcto:"],
          list: [
            "Foto original de cámara: 6000x4000 px, JPEG, 8.4 MB.",
            "Solo redimensionada a 1600x1066 px: 1.1 MB (sin pérdida perceptible).",
            "Convertida a WebP con calidad al 82%: 180 KB — reducción superior al 97% luciendo exactamente igual en pantalla."
          ]
        },
        {
          heading: "Cuándo detener la compresión",
          paragraphs: ["Detén la compresión en cuanto alcances el límite exigido por tu plataforma o cuando las tipografías y bordes comiencen a verse borrosos. La vista previa en pantalla es tu mejor aliada."]
        }
      ]
    },
    "de": {
      title: "Bilder komprimieren ohne sichtbaren Qualitätsverlust",
      description: "Die Dateigröße hängt von zwei Faktoren ab: Bildabmessungen in Pixeln und Komprimierungsstufe. Stimmen Sie beides richtig ab, bleibt das Bild gestochen scharf.",
      readingTime: "4 Min. Lesezeit",
      tags: ["Bilder komprimieren", "WebP", "Optimierung", "Dateigröße"],
      categoryLabel: "Bilder",
      quickAnswer: "Skalieren Sie das Bild zuerst auf die maximal benötigte Anzeigebreite und konvertieren Sie es anschließend mit 80–85 % Qualität ins moderne WebP-Format. Das spart bis zu 80 % Speicherplatz bei perfekter Schärfe.",
      keyTakeaway: "Erst die Abmessungen anpassen, dann die Qualität: Komprimieren Sie nur so weit, wie das Bild in der Vorschau einwandfrei aussieht.",
      toolCta: { label: "Bilddateigröße reduzieren — skalieren und als WebP speichern mit Live-Vorschau.", toolId: "image-converter" },
      seoTitle: "Bilder komprimieren ohne Qualitätsverlust | GainUtility",
      seoDescription: "Leitfaden zur perfekten Bildkomprimierung: Pixelabmessungen verkleinern, WebP nutzen und Dateigrößen um über 80 % reduzieren.",
      content: [
        {
          paragraphs: [
            "Zu schwere Bilddateien sind der Hauptgrund für langsame Webseiten und abgelehnte Uploads bei Formularen. Häufig versuchen Nutzer, eine 10-MB-Datei zu retten, indem sie die Qualität auf 30 % herunterregeln — das Ergebnis ist ein pixeliger, matschiger Matsch.",
            "Es gibt eine bewährte Reihenfolge, mit der Sie Megabytes einsparen, während die Bildschärfe voll erhalten bleibt."
          ]
        },
        {
          heading: "Erster Hebel: Die Pixelabmessungen",
          paragraphs: ["Wenn Ihre Kamera Aufnahmen mit 6000x4000 Pixeln macht, das Bild auf der Webseite aber maximal 1200 Pixel breit dargestellt wird, übertragen Sie Millionen überflüssiger Pixel. Die Skalierung auf die tatsächliche Anzeigegröße spart den Löwenanteil der Datenmenge ein — noch vor jeder Qualitätskompression."]
        },
        {
          heading: "Zweiter Hebel: Komprimierung und Format",
          paragraphs: [
            "Nach der Skalierung wählen Sie ein modernes Format wie WebP oder justieren die JPEG-Kompression. Eine Qualitätseinstellung zwischen 80 % und 85 % eliminiert für das menschliche Auge unsichtbare Farbinformationen.",
            "Vermeiden Sie es, unter 70 % zu gehen, es sei denn, ein Upload-Limit verlangt es zwingend."
          ],
          tool: { label: "Bilder direkt im Browser konvertieren und komprimieren mit GainUtility.", toolId: "image-converter" }
        },
        {
          heading: "Ein realistisches Vorher-Nachher-Beispiel",
          paragraphs: ["So drastisch wirkt sich die richtige Reihenfolge aus:"],
          list: [
            "Originales Kamerafoto: 6000x4000 px, JPEG, 8,4 MB.",
            "Auf 1600x1066 px herunterskaliert: 1,1 MB (visuell identisch scharf).",
            "Als WebP mit 82 % Qualität gespeichert: 180 KB — über 97 % Gesamtersparnis bei unveränderter Bildwirkung am Bildschirm."
          ]
        },
        {
          heading: "Wann Sie mit dem Komprimieren aufhören sollten",
          paragraphs: ["Stoppen Sie die Kompression, sobald das geforderte Dateilimit unterschritten ist oder wenn feine Schriften und Kontraste Artefakte zeigen. Die visuelle Prüfung in der Vorschau ist der maßgebliche Test."]
        }
      ]
    },
    "fr": {
      title: "Comment compresser des images sans perte visible de qualité",
      description: "Le poids d'une image dépend de deux réglages : les dimensions en pixels et le niveau de compression. Ajustez-les dans le bon ordre pour préserver la netteté.",
      readingTime: "4 min de lecture",
      tags: ["compresser image", "WebP", "optimisation", "performance"],
      categoryLabel: "Images",
      quickAnswer: "Redimensionnez d'abord l'image à la largeur maximale d'affichage, puis convertissez-la en WebP avec une qualité de 80 à 85 %. Vous réduirez le poids jusqu'à 80 % sans altération visible.",
      keyTakeaway: "Modifiez d'abord les dimensions, puis la qualité : ne compressez que tant que l'aperçu reste net.",
      toolCta: { label: "Alléger une image — redimensionner et convertir en WebP avec aperçu instantané.", toolId: "image-converter" },
      seoTitle: "Compresser des images sans perte de qualité | GainUtility",
      seoDescription: "Méthode éprouvée pour compresser vos visuels : redimensionnement en pixels, conversion WebP et compression sans perte visible dans le navigateur.",
      content: [
        {
          paragraphs: [
            "Des images trop volumineuses ralentissent considérablement les sites web et provoquent des échecs d'envoi dans les formulaires. Pour y remédier, beaucoup réduisent la qualité à 30 %, ce qui dégrade l'image avec des artefacts grossiers.",
            "Il existe une méthode simple et efficace pour alléger considérablement vos fichiers tout en conservant un rendu d'une grande netteté."
          ]
        },
        {
          heading: "Premier levier : les dimensions en pixels",
          paragraphs: ["Si votre appareil photo génère des clichés de 6000x4000 pixels mais que l'image finale est affichée en 1200 pixels de large sur un écran, vous envoyez des millions de pixels inutiles. Ajuster la taille réelle d'affichage permet de diviser le poids du fichier par cinq avant même de toucher à la compression."]
        },
        {
          heading: "Deuxième levier : le taux de compression et le format",
          paragraphs: [
            "Une fois les dimensions ajustées, optez pour un format moderne comme le WebP ou ajustez la qualité JPEG. Un ratio de qualité entre 80 % et 85 % supprime des micro-données imperceptibles pour l'œil humain.",
            "Évitez de descendre sous la barre des 70 % sauf contrainte impérative de taille en kilo-octets."
          ],
          tool: { label: "Convertissez et compressez vos images dans votre navigateur avec GainUtility.", toolId: "image-converter" }
        },
        {
          heading: "Un exemple concret avant / après",
          paragraphs: ["Voici le gain réel en appliquant la méthode :"],
          list: [
            "Photo brute issue d'un boîtier photo : 6000x4000 px, JPEG, 8,4 Mo.",
            "Seulement redimensionnée à 1600x1066 px : 1,1 Mo (sans dégradation optique).",
            "Convertie en WebP avec qualité à 82 % : 180 Ko — soit plus de 97 % de gain avec un rendu visuel équivalent."
          ]
        },
        {
          heading: "Quand s'arrêter de compresser",
          paragraphs: ["Arrêtez la compression dès que vous passez sous le plafond requis ou dès que les contours de texte commencent à baver. Le contrôle visuel dans l'aperçu est la règle d'or."]
        }
      ]
    },
    "it": {
      title: "Come comprimere immagini senza perdita visibile di qualità",
      description: "Il peso di un'immagine dipende da due parametri: dimensioni in pixel e livello di compressione. Regolali nell'ordine corretto per mantenere la nitidezza.",
      readingTime: "4 min di lettura",
      tags: ["comprimi immagine", "WebP", "ottimizzazione", "prestazioni"],
      categoryLabel: "Immagini",
      quickAnswer: "Ridimensiona l'immagine alla larghezza massima effettiva di visualizzazione e convertila in formato WebP con qualità tra 80% e 85%. Risparmierai fino all'80% di spazio senza alcuna perdita visiva percettibile.",
      keyTakeaway: "Modifica prima le dimensioni e poi la qualità: comprimi solo finché l'anteprima appare nitida e fedele.",
      toolCta: { label: "Riduci il peso di un'immagine — ridimensiona e converti in WebP con anteprima in tempo reale.", toolId: "image-converter" },
      seoTitle: "Come comprimere immagini senza perdere qualità | GainUtility",
      seoDescription: "Guida pratica per comprimere immagini nel browser: ridimensionamento corretto in pixel, formato WebP e massima efficienza.",
      content: [
        {
          paragraphs: [
            "File immagine pesanti sono la causa principale del caricamento lento delle pagine web e degli errori di upload nei moduli online. Spesso si tenta di risolvere abbassando la qualità al 30%, ottenendo immagini sfocate e piene di artefatti visivi.",
            "Esiste una sequenza logica per ridurre i kilobyte mantenendo i dettagli perfettamente definiti."
          ]
        },
        {
          heading: "Primo fattore: le dimensioni in pixel",
          paragraphs: ["Se la tua fotocamera scatta a 6000x4000 pixel ma l'immagine sul sito web sarà visualizzata al massimo a 1200 pixel di larghezza, stai trasferendo una quantità enorme di pixel invisibili all'utente. Ridimensionare alla larghezza reale di visualizzazione riduce la maggior parte del peso prima ancora di applicare la compressione."]
        },
        {
          heading: "Secondo fattore: qualità e formato",
          paragraphs: [
            "Dopo aver impostato la risoluzione, converti in formati efficienti come il WebP o calibra la compressione JPEG. Una qualità tra l'80% e l'85% elimina dati cromatici non distinguibili dall'occhio umano sui comuni monitor.",
            "Evita di scendere sotto il 70% di qualità a meno che non sia strettamente necessario per rispettare un limite rigido."
          ],
          tool: { label: "Converti e comprimi immagini direttamente nel browser con GainUtility.", toolId: "image-converter" }
        },
        {
          heading: "Un caso reale di prima e dopo",
          paragraphs: ["Ecco l'impatto applicando la giusta procedura:"],
          list: [
            "Fotografia originale da fotocamera: 6000x4000 px, JPEG, 8,4 MB.",
            "Solo ridimensionata a 1600x1066 px: 1,1 MB (nitidezza inalterata a occhio nudo).",
            "Convertita in WebP a qualità 82%: 180 KB — un risparmio complessivo di oltre il 97% con resa visiva identica."
          ]
        },
        {
          heading: "Quando fermarsi con la compressione",
          paragraphs: ["Fermati non appena rientri nei limiti richiesti dal portale o se noti artefatti vicino a scritte e contorni netti. Il controllo a vista sull'anteprima è la verifica più affidabile."]
        }
      ]
    },
    "id": {
      title: "Cara Mengompres Gambar Tanpa Mengorbankan Kualitas",
      description: "Ukuran gambar ditentukan oleh dua setelan: dimensi piksel dan tingkat kompresi. Ubah dalam urutan yang tepat agar gambar tetap tajam.",
      readingTime: "4 mnt membaca",
      tags: ["kompres gambar", "WebP", "optimasi", "performa"],
      categoryLabel: "Gambar",
      quickAnswer: "Ubah dimensi gambar sesuai lebar tampilan maksimal yang dibutuhkan, lalu konversikan ke format WebP dengan kualitas 80–85%. Ini menghemat ukuran hingga 80% tanpa penurunan visual yang terlihat.",
      keyTakeaway: "Ubah dimensi terlebih dahulu, lalu atur kualitas: hanya kompres sampai gambar tetap terlihat bagus di pratinjau.",
      toolCta: { label: "Perkecil ukuran gambar — ubah ukuran dan konversi ke WebP dengan pratinjau langsung.", toolId: "image-converter" },
      seoTitle: "Cara Mengompres Gambar Tanpa Menurunkan Kualitas | GainUtility",
      seoDescription: "Pelajari metode tepat untuk mengompres gambar: penyesuaian dimensi piksel, format modern WebP, dan kompresi efisien di browser.",
      content: [
        {
          paragraphs: [
            "Ukuran gambar yang terlalu besar adalah penyebab utama situs web lambat dibuka dan formulir unggah gagal memproses file. Namun banyak orang mencoba mengatasinya dengan menurunkan kualitas hingga 30%, menghasilkan gambar yang buram dan pecah.",
            "Ada urutan yang benar untuk memangkas ukuran kilobyte tanpa merusak ketajaman visual gambar."
          ]
        },
        {
          heading: "Faktor pertama: dimensi piksel",
          paragraphs: ["Jika kamera Anda menghasilkan foto berukuran 6000x4000 piksel tetapi situs hanya menampilkan gambar selebar 1200 piksel, Anda memuat jutaan piksel yang sebenarnya tidak dapat dilihat pengguna. Mengubah ukuran ke lebar tampilan nyata memangkas sebagian besar beban file sebelum kompresi kualitas diterapkan."]
        },
        {
          heading: "Faktor kedua: tingkat kompresi dan format",
          paragraphs: [
            "Setelah dimensi disesuaikan, pilih format modern seperti WebP atau atur kompresi JPEG. Tingkat kualitas antara 80% hingga 85% membuang data visual yang tidak dapat dibedakan mata manusia pada layar umum.",
            "Hindari menurunkan kualitas di bawah 70% kecuali Anda benar-benar dibatasi batas ukuran kilobyte yang sangat ketat."
          ],
          tool: { label: "Konversikan dan kompres gambar langsung di browser dengan GainUtility.", toolId: "image-converter" }
        },
        {
          heading: "Contoh nyata sebelum dan sesudah",
          paragraphs: ["Perhatikan perbedaan jika urutan ini diterapkan:"],
          list: [
            "Foto kamera asli: 6000x4000 px, JPEG, ukuran 8,4 MB.",
            "Hanya diubah dimensinya ke 1600x1066 px: ukuran turun menjadi 1,1 MB tanpa penurunan ketajaman.",
            "Dikonversi ke WebP kualitas 82%: ukuran akhir hanya 180 KB — penurunan lebih dari 97% dengan tampilan layar yang sama persis."
          ]
        },
        {
          heading: "Kapan harus berhenti mengompres",
          paragraphs: ["Hentikan kompresi begitu ukuran file memenuhi batas yang dibutuhkan atau saat teks dan garis halus mulai tampak berpendar. Memeriksa pratinjau secara teliti adalah kunci utamanya."]
        }
      ]
    }
  },

  "how-to-resize-an-image": {
    "pt-br": {
      title: "Como redimensionar uma imagem para medidas exatas em pixels",
      description: "Formulários de upload exigem larguras exatas em pixels e limites de KB. Veja como atingir esses requisitos sem abrir um editor pesado.",
      readingTime: "4 min de leitura",
      tags: ["redimensionar imagem", "pixels", "recorte", "proporção"],
      categoryLabel: "Imagens",
      quickAnswer: "Abra o redimensionador de imagens da GainUtility, insira a largura e altura desejadas mantendo a proporção travada ou use o recorte para formatos específicos como 1:1 ou 16:9.",
      keyTakeaway: "Entenda a exigência como dois números: atinja os pixels exatos com redimensionamento e recorte, e ajuste o limite de KB na compressão.",
      toolCta: { label: "Redimensione uma imagem para pixels exatos no seu navegador.", toolId: "image-resizer" },
      seoTitle: "Como redimensionar uma imagem para pixels exatos | GainUtility",
      seoDescription: "Aprenda a redimensionar fotos para largura e altura exatas em pixels no navegador, sem distorção e sem instalar nada.",
      content: [
        {
          paragraphs: ["Formulários de concursos, inscrições em vestibulares, vistos ou uploads de marketplaces frequentemente rejeitam imagens com mensagens do tipo: “O arquivo deve ter exatamente 600x600 pixels e menos de 200 KB”. Veja como resolver isso sem distorcer o assunto."]
        },
        {
          heading: "Primeiro as dimensões, depois o peso",
          paragraphs: ["O erro mais comum é comprimir a foto antes de acertar a largura e a altura. Se a foto tiver 4000 pixels de largura e o formulário pedir 800, comprimir apenas a qualidade gerará um arquivo com os mesmos 4000 pixels que será rejeitado pelo sistema de validação."]
        },
        {
          heading: "A armadilha da distorção",
          paragraphs: ["Se sua imagem original for retangular (4:3) e o formulário exigir uma imagem quadrada (1:1), alterar diretamente a largura e a altura achatará a foto. A solução correta é recortar primeiro para a proporção exigida e só então aplicar os pixels finais."]
        },
        {
          heading: "Um exemplo realista de ajuste",
          paragraphs: ["Veja a transformação correta para atender a uma exigência rigorosa:"],
          list: [
            "Foto original do celular: 3024x4032 px (3:4 vertical), 3,2 MB.",
            "Recortada para proporção 1:1 quadrada: 3024x3024 px.",
            "Redimensionada para a exigência exata de 600x600 px: peso final de apenas 75 KB, 100% nítida e aprovada de primeira."
          ]
        },
        {
          heading: "Passo a passo no navegador",
          paragraphs: ["O processo leva menos de dois minutos:"],
          steps: [
            "Abra o redimensionador de imagens GainUtility.",
            "Carregue sua imagem clicando ou arrastando o arquivo.",
            "Se precisar mudar de formato (ex: de retângulo para quadrado), use a ferramenta de recorte para enquadrar o assunto central.",
            "Digite os valores exatos de largura e altura solicitados.",
            "Baixe a imagem final no formato desejado (JPEG ou PNG)."
          ],
          tool: { label: "Redimensione imagens no seu navegador com o redimensionador GainUtility.", toolId: "image-resizer" }
        }
      ]
    },
    "es-mx": {
      title: "Cómo redimensionar una imagen a medidas exactas en píxeles",
      description: "Los formularios de solicitud piden dimensiones exactas en píxeles y límites en KB. Aprende a cumplirlos sin abrir programas complejos.",
      readingTime: "4 min de lectura",
      tags: ["redimensionar imagen", "píxeles", "recorte", "proporción"],
      categoryLabel: "Imágenes",
      quickAnswer: "Usa el redimensionador de GainUtility, introduce el ancho y alto deseados manteniendo la proporción o recorta a 1:1 o 16:9 antes de exportar.",
      keyTakeaway: "Cumple ambos requisitos: ajusta los píxeles exactos con redimensionamiento y recorte, y el peso en KB mediante la calidad.",
      toolCta: { label: "Redimensiona una imagen a píxeles exactos en tu navegador.", toolId: "image-resizer" },
      seoTitle: "Cómo redimensionar una imagen a píxeles exactos | GainUtility",
      seoDescription: "Aprende a cambiar las dimensiones de tus fotos a píxeles exactos en el navegador sin distorsión y sin instalar programas.",
      content: [
        {
          paragraphs: ["Trámites de pasaporte, convocatorias gubernamentales o perfiles profesionales exigen requisitos estrictos como: “La fotografía debe medir exactamente 600x600 píxeles y pesar menos de 200 KB”. Aprende a resolverlo sin deformar tu foto."]
        },
        {
          heading: "Primero las dimensiones, después el peso",
          paragraphs: ["El error habitual consiste en intentar comprimir el archivo sin ajustar las medidas. Si la foto mide 3000 píxeles y el sistema pide 600, bajar la calidad conservará los 3000 píxeles y el portal rechazará el documento."]
        },
        {
          heading: "La trampa de la distorsión",
          paragraphs: ["Si tu foto es rectangular y te piden una imagen cuadrada (1:1), forzar los números en los campos de ancho y alto aplastará la cara o el objeto. La solución adecuada es recortar primero a formato cuadrado y luego ingresar la medida final."]
        },
        {
          heading: "Un ejemplo paso a paso",
          paragraphs: ["Así se adapta una imagen a un estándar estricto:"],
          list: [
            "Foto original de teléfono: 3000x4000 px, 3.5 MB.",
            "Recorte centrado a proporción cuadrada 1:1: 3000x3000 px.",
            "Redimensionada a los 600x600 px exigidos: peso de 68 KB, perfecta y sin deformaciones."
          ]
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["El ajuste toma un minuto:"],
          steps: [
            "Abre el redimensionador de imágenes de GainUtility.",
            "Sube tu fotografía al área de trabajo.",
            "Usa el recorte si el encuadre debe cambiar de proporción.",
            "Escribe el ancho y alto exactos solicitados.",
            "Descarga tu imagen lista para subir al portal oficial."
          ],
          tool: { label: "Redimensiona imágenes en tu navegador con GainUtility.", toolId: "image-resizer" }
        }
      ]
    },
    "es-co": {
      title: "Cómo redimensionar una imagen a medidas exactas en píxeles",
      description: "Los formularios de solicitud piden dimensiones exactas en píxeles y límites en KB. Aprende a cumplirlos sin abrir programas complejos.",
      readingTime: "4 min de lectura",
      tags: ["redimensionar imagen", "píxeles", "recorte", "proporción"],
      categoryLabel: "Imágenes",
      quickAnswer: "Usa el redimensionador de GainUtility, introduce el ancho y alto deseados manteniendo la proporción o recorta a 1:1 o 16:9 antes de exportar.",
      keyTakeaway: "Cumple ambos requisitos: ajusta los píxeles exactos con redimensionamiento y recorte, y el peso en KB mediante la calidad.",
      toolCta: { label: "Redimensiona una imagen a píxeles exactos en tu navegador.", toolId: "image-resizer" },
      seoTitle: "Cómo redimensionar una imagen a píxeles exactos | GainUtility",
      seoDescription: "Aprende a cambiar las dimensiones de tus fotos a píxeles exactos en el navegador sin distorsión y sin instalar programas.",
      content: [
        {
          paragraphs: ["Trámites de pasaporte, convocatorias gubernamentales o perfiles profesionales exigen requisitos estrictos como: “La fotografía debe medir exactamente 600x600 píxeles y pesar menos de 200 KB”. Aprende a resolverlo sin deformar tu foto."]
        },
        {
          heading: "Primero las dimensiones, después el peso",
          paragraphs: ["El error habitual consiste en intentar comprimir el archivo sin ajustar las medidas. Si la foto mide 3000 píxeles y el sistema pide 600, bajar la calidad conservará los 3000 píxeles y el portal rechazará el documento."]
        },
        {
          heading: "La trampa de la distorsión",
          paragraphs: ["Si tu foto es rectangular y te piden una imagen cuadrada (1:1), forzar los números en los campos de ancho y alto aplastará la cara o el objeto. La solución adecuada es recortar primero a formato cuadrado y luego ingresar la medida final."]
        },
        {
          heading: "Un ejemplo paso a paso",
          paragraphs: ["Así se adapta una imagen a un estándar estricto:"],
          list: [
            "Foto original de teléfono: 3000x4000 px, 3.5 MB.",
            "Recorte centrado a proporción cuadrada 1:1: 3000x3000 px.",
            "Redimensionada a los 600x600 px exigidos: peso de 68 KB, perfecta y sin deformaciones."
          ]
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["El ajuste toma un minuto:"],
          steps: [
            "Abre el redimensionador de imágenes de GainUtility.",
            "Sube tu fotografía al área de trabajo.",
            "Usa el recorte si el encuadre debe cambiar de proporción.",
            "Escribe el ancho y alto exactos solicitados.",
            "Descarga tu imagen lista para subir al portal oficial."
          ],
          tool: { label: "Redimensiona imágenes en tu navegador con GainUtility.", toolId: "image-resizer" }
        }
      ]
    },
    "de": {
      title: "Bild auf exakte Pixelmaße im Browser skalieren",
      description: "Behörden- und Bewerbungsformulare fordern oft millimetergenaue Pixelmaße und KB-Grenzen. So passen Sie Bilder ohne Grafikprogramm an.",
      readingTime: "4 Min. Lesezeit",
      tags: ["Bild skalieren", "Pixel", "Zuschneiden", "Seitenverhältnis"],
      categoryLabel: "Bilder",
      quickAnswer: "Geben Sie im GainUtility Bild-Skalierer die gewünschte Breite und Höhe ein. Nutzen Sie bei Bedarf vorher das Zuschneide-Werkzeug für Seitenverhältnisse wie 1:1 oder 16:9, um Verzerrungen zu vermeiden.",
      keyTakeaway: "Erfüllen Sie beide Kriterien: Treffen Sie die exakten Pixel durch Skalieren und Zuschneiden, und steuern Sie das KB-Limit über die Qualität.",
      toolCta: { label: "Bild auf exakte Pixelmaße im Browser anpassen.", toolId: "image-resizer" },
      seoTitle: "Bild auf exakte Pixelgröße skalieren | GainUtility",
      seoDescription: "Bilder im Browser exakt auf gewünschte Pixelmaße verkleinern oder anpassen. Ohne Verzerrung, schnell und datenschutzkonform.",
      content: [
        {
          paragraphs: ["Ob Visumsantrag, Jobportal oder Passfoto-Upload: Oft lautet die strikte Vorgabe: „Das Bild muss exakt 600x600 Pixel groß sein und darf 200 KB nicht überschreiten“. So lösen Sie das Problem im Handumdrehen."]
        },
        {
          heading: "Zuerst die Abmessungen, dann das Dateigewicht",
          paragraphs: ["Ein häufiger Fehler ist das reine Komprimieren einer hochauflösenden Datei. Hat das Foto 4000 Pixel Breite und das Portal fordert 600 Pixel, wird die Datei trotz geringer Kilobyte-Zahl vom Prüfskript abgelehnt."]
        },
        {
          heading: "Die Verzerrungsfalle vermeiden",
          paragraphs: ["Wenn Ihr Originalfoto rechteckig ist, das Formular aber ein quadratisches 1:1-Foto verlangt, führt ein einfaches Ändern der Zahlen zu einem unschön gestauchten Gesicht. Schneiden Sie das Bild zuerst im quadratischen Verhältnis zu und tragen Sie danach die finalen Pixel ein."]
        },
        {
          heading: "Ein praxisnahes Vorher-Nachher",
          paragraphs: ["So gelingt die Anpassung vorschriftsmäßig:"],
          list: [
            "Smartphone-Foto: 3000x4000 px, 3,8 MB.",
            "Quadratisch zugeschnitten (1:1): 3000x3000 px.",
            "Skaliert auf geforderte 600x600 px: Dateigröße ca. 70 KB — gestochen scharf und sofort akzeptiert."
          ]
        },
        {
          heading: "Schritt für Schritt im Browser",
          paragraphs: ["Die Anpassung dauert nicht einmal zwei Minuten:"],
          steps: [
            "Öffnen Sie den GainUtility Bild-Skalierer im Browser.",
            "Laden Sie das gewünschte Foto hoch.",
            "Nutzen Sie bei abweichendem Seitenverhältnis zuerst das integrierte Zuschneiden.",
            "Geben Sie die exakte Breite und Höhe in Pixeln ein.",
            "Speichern Sie das fertige Bild herunter."
          ],
          tool: { label: "Bilder schnell und präzise skalieren mit GainUtility.", toolId: "image-resizer" }
        }
      ]
    },
    "fr": {
      title: "Comment redimensionner une image à des dimensions exactes en pixels",
      description: "Les formulaires administratifs ou professionnels imposent souvent des dimensions strictes en pixels et des limites en Ko. Voici comment les respecter sans retouche complexe.",
      readingTime: "4 min de lecture",
      tags: ["redimensionner image", "pixels", "recadrage", "ratio"],
      categoryLabel: "Images",
      quickAnswer: "Utilisez le redimensionneur d'image GainUtility, saisissez les valeurs exactes de largeur et de hauteur, et recadrez au format 1:1 ou 16:9 si nécessaire pour éviter toute déformation.",
      keyTakeaway: "Comprenez la consigne : réglez les pixels avec le redimensionnement et le recadrage, puis ajustez les Ko avec la compression.",
      toolCta: { label: "Redimensionner une image aux pixels exacts dans votre navigateur.", toolId: "image-resizer" },
      seoTitle: "Redimensionner une image aux pixels exacts | GainUtility",
      seoDescription: "Ajustez la largeur et la hauteur en pixels de vos visuels dans le navigateur. Sans déformation, sans logiciel à installer.",
      content: [
        {
          paragraphs: ["Pour une candidature en ligne, une photo d'identité ou un passeport, le message est souvent sans appel : « Le fichier doit mesurer exactement 600x600 pixels et peser moins de 200 Ko ». Voici comment vous conformer à cette règle en quelques clics."]
        },
        {
          heading: "D'abord les dimensions, ensuite le poids",
          paragraphs: ["L'erreur classique consiste à trop compresser une image sans en modifier la taille en pixels. Si l'image fait 4000 pixels et que le serveur en attend 800, le fichier sera refusé même si son poids en Ko est très bas."]
        },
        {
          heading: "Éviter le piège de la déformation",
          paragraphs: ["Si votre photo d'origine est au format 4:3 et que le site exige un format carré 1:1, forcer les valeurs écrasera votre sujet. La bonne méthode consiste à recadrer d'abord au ratio 1:1, puis à fixer la taille en pixels demandée."]
        },
        {
          heading: "Un exemple concret de transformation",
          paragraphs: ["Voici comment répondre aux critères les plus stricts :"],
          list: [
            "Photo brute sur smartphone : 3000x4000 px, 3,4 Mo.",
            "Recadrée au format carré (1:1) : 3000x3000 px.",
            "Redimensionnée aux 600x600 px imposés : poids final de 72 Ko, parfaitement nette et acceptée dès le premier essai."
          ]
        },
        {
          heading: "La méthode pas à pas",
          paragraphs: ["L'opération s'effectue en quelques secondes :"],
          steps: [
            "Accédez au redimensionneur d'images GainUtility.",
            "Importez votre cliché.",
            "Ajustez le cadrage si un ratio spécifique est requis.",
            "Entrez les valeurs numériques précises en pixels.",
            "Téléchargez l'image prête à être transmise."
          ],
          tool: { label: "Redimensionnez vos images en ligne avec GainUtility.", toolId: "image-resizer" }
        }
      ]
    },
    "it": {
      title: "Come ridimensionare un'immagine alle misure esatte in pixel",
      description: "I portali di candidatura e iscrizione richiedono spesso dimensioni tassative in pixel e limiti in KB. Ecco come rispettarli senza programmi complicati.",
      readingTime: "4 min di lettura",
      tags: ["ridimensiona immagine", "pixel", "ritaglio", "proporzioni"],
      categoryLabel: "Immagini",
      quickAnswer: "Apri lo strumento di ridimensionamento di GainUtility, inserisci larghezza e altezza desiderate e usa il ritaglio (es. 1:1 o 16:9) per non schiacciare le proporzioni originali.",
      keyTakeaway: "Soddisfa entrambi i requisiti: imposta i pixel corretti con ridimensionamento e ritaglio, e controlla il peso in KB tramite la qualità.",
      toolCta: { label: "Ridimensiona un'immagine ai pixel esatti nel tuo browser.", toolId: "image-resizer" },
      seoTitle: "Come ridimensionare un'immagine in pixel esatti | GainUtility",
      seoDescription: "Impara a impostare larghezza e altezza precise in pixel per le tue immagini direttamente nel browser, senza distorsioni.",
      content: [
        {
          paragraphs: ["Nei concorsi pubblici o per i visti online compare spesso la dicitura: «La foto deve avere dimensioni pari a 600x600 pixel e non superare 200 KB». Ecco il metodo per ottenere il risultato senza deformare il viso."]
        },
        {
          heading: "Prima le dimensioni, poi il peso",
          paragraphs: ["L'errore più comune è comprimere la qualità senza cambiare la risoluzione. Se l'immagine misura 4000 pixel di larghezza e il modulo ne richiede 600, il portale la rifiuterà anche se il file pesa pochissimi kilobyte."]
        },
        {
          heading: "Evitare l'effetto allungato o schiacciato",
          paragraphs: ["Se il file originale è rettangolare e il modulo richiede un formato quadrato 1:1, forzare le misure altererà i tratti del soggetto. È indispensabile ritagliare prima nel rapporto corretto e solo dopo inserire i pixel definitivi."]
        },
        {
          heading: "Un esempio pratico",
          paragraphs: ["Ecco come completare l'adattamento in modo pulito:"],
          list: [
            "Foto scattata da cellulare: 3000x4000 px, 3,6 MB.",
            "Ritaglio centrato in formato quadrato (1:1): 3000x3000 px.",
            "Ridimensionata esattamente a 600x600 px: peso di circa 70 KB, nitida e conforme."
          ]
        },
        {
          heading: "Guida passo passo",
          paragraphs: ["L'intera procedura richiede solo un minuto:"],
          steps: [
            "Apri lo strumento di ridimensionamento di GainUtility.",
            "Carica la tua foto.",
            "Se necessario, ritaglia la porzione d'interesse per impostare il giusto rapporto d'aspetto.",
            "Digita i valori numerici di larghezza e altezza.",
            "Scarica la foto pronta per il caricamento sul portale."
          ],
          tool: { label: "Ridimensiona le immagini direttamente nel tuo browser con GainUtility.", toolId: "image-resizer" }
        }
      ]
    },
    "id": {
      title: "Cara Mengubah Ukuran Gambar ke Piksel yang Tepat",
      description: "Formulir pendaftaran sering kali mewajibkan ukuran piksel yang pasti dan batas KB tertentu. Begini cara memenuhinya tanpa aplikasi rumit.",
      readingTime: "4 mnt membaca",
      tags: ["ubah ukuran gambar", "piksel", "potong", "rasio aspek"],
      categoryLabel: "Gambar",
      quickAnswer: "Gunakan alat pengubah ukuran gambar GainUtility, ketik lebar dan tinggi yang diminta, lalu gunakan fitur pemotong untuk rasio seperti 1:1 jika dibutuhkan agar gambar tidak terdistorsi.",
      keyTakeaway: "Penuhi kedua aturan: capai angka piksel yang tepat dengan resize dan crop, lalu penuhi batas KB dengan mengatur kualitas.",
      toolCta: { label: "Ubah ukuran gambar ke piksel yang tepat di browser Anda.", toolId: "image-resizer" },
      seoTitle: "Cara Mengubah Ukuran Gambar ke Piksel Tepat | GainUtility",
      seoDescription: "Pelajari cara mengubah dimensi lebar dan tinggi foto ke piksel yang tepat di browser tanpa distorsi dan tanpa instalasi software.",
      content: [
        {
          paragraphs: ["Saat mendaftar ujian, beasiswa, atau visa, sering muncul aturan ketat seperti: “Foto harus berukuran tepat 600x600 piksel dan tidak melebihi 200 KB”. Begini cara menyiapkannya dengan cepat dan rapi."]
        },
        {
          heading: "Dimensi dulu, baru ukuran file",
          paragraphs: ["Kesalahan umum adalah mengompres kualitas foto tanpa mengubah resolusi. Jika foto asli selebar 4000 piksel dan sistem meminta 600 piksel, menurunkan kualitas saja tetap menyisakan 4000 piksel yang akan ditolak oleh sistem validasi otomatis."]
        },
        {
          heading: "Menghindari foto yang tampak gepeng atau lonjong",
          paragraphs: ["Jika foto asli Anda berbentuk persegi panjang (3:4) sedangkan formulir meminta foto persegi (1:1), langsung mengganti angka lebar dan tinggi akan membuat wajah terlihat gepeng. Solusi yang benar adalah memotongnya (crop) terlebih dahulu menjadi persegi, baru kemudian mengecilkan pikselnya."]
        },
        {
          heading: "Contoh nyata yang berhasil",
          paragraphs: ["Berikut alur penyesuaian yang tepat:"],
          list: [
            "Foto kamera ponsel: 3000x4000 px, 3,2 MB.",
            "Dipotong menjadi rasio persegi 1:1: 3000x3000 px.",
            "Diubah ukurannya ke 600x600 px: ukuran file menjadi 72 KB, tetap sangat tajam dan langsung lolos verifikasi."
          ]
        },
        {
          heading: "Langkah demi langkah di browser",
          paragraphs: ["Prosesnya hanya memakan waktu satu menit:"],
          steps: [
            "Buka pengubah ukuran gambar GainUtility di browser Anda.",
            "Muat foto Anda ke area kerja.",
            "Gunakan alat pemotong jika foto perlu diubah ke bentuk persegi atau rasio tertentu.",
            "Ketik nilai lebar dan tinggi piksel yang diwajibkan.",
            "Unduh gambar yang sudah siap diunggah ke formulir resmi."
          ],
          tool: { label: "Ubah ukuran gambar di browser Anda dengan GainUtility.", toolId: "image-resizer" }
        }
      ]
    }
  },

  "background-remover-for-product-photos": {
    "pt-br": {
      title: "Como preparar fotos de produtos para sua loja virtual",
      description: "Fotos de produtos limpas e consistentes nascem de fundos uniformes e bom acabamento. Veja o fluxo de trabalho para criar um catálogo profissional.",
      readingTime: "4 min de leitura",
      tags: ["fotos de produtos", "loja virtual", "fundo branco", "e-commerce"],
      categoryLabel: "Imagens",
      quickAnswer: "Fotografe produtos em um fundo liso e bem iluminado, remova o fundo com a ferramenta local da GainUtility e posicione o item sobre branco puro ou fundo transparente padronizado.",
      keyTakeaway: "Fotos de produtos sobre fundo uniforme são o caso ideal para remoção no navegador: crie listagens limpas e consistentes sem depender de softwares pesados.",
      toolCta: { label: "Prepare fotos de produtos para sua loja — grátis e direto no navegador.", toolId: "background-remover" },
      seoTitle: "Como preparar fotos de produtos para loja virtual | GainUtility",
      seoDescription: "Guia prático para criar fotos de produtos consistentes e profissionais para e-commerce usando ferramentas leves no navegador.",
      content: [
        {
          paragraphs: [
            "Lojas virtuais com visual profissional têm algo em comum: todas as fotos de produtos parecem pertencer ao mesmo catálogo. Os fundos são limpos, as sombras são suaves e nenhum produto parece ter sido fotografado em uma mesa improvisada com luz amarelada.",
            "Você não precisa de um estúdio dispendioso para alcançar esse resultado. Com um fundo liso e as ferramentas certas no navegador, seu catálogo ganha consistência imediata."
          ]
        },
        {
          heading: "O que torna uma foto de produto fácil de limpar",
          paragraphs: [
            "A chave não está no pós-processamento, mas no momento do clique. Um pedaço de cartolina branca fosca ou uma placa de EVA posicionada atrás do produto cria uma separação nítida de cores.",
            "Evite iluminação direta com flash pontual que crie sombras duras sob o produto. Luz natural difusa próxima a uma janela gera a transição de borda mais fácil de recortar."
          ]
        },
        {
          heading: "Recomendações práticas para seu catálogo",
          paragraphs: ["Adote três regras simples para todo o seu sortimento:"],
          list: [
            "Mantenha sempre a mesma proporção (por exemplo, todas as fotos em formato 1:1 quadrado).",
            "Mantenha o produto ocupando cerca de 75% a 80% da área do quadro para que haja respiro visual.",
            "Exporte em PNG transparente ou com fundo branco 100% puro (#FFFFFF) para se integrar ao tema da loja."
          ]
        },
        {
          heading: "O fluxo de trabalho completo",
          paragraphs: [
            "Tire as fotos dos seus produtos, abra o removedor de fundo da GainUtility e remova a cartolina com um clique.",
            "Se o marketplace exigir fundo branco puro, o PNG transparente pode ser inserido diretamente no anúncio, assumindo o fundo branco nativo da plataforma."
          ],
          tool: { label: "Remova o fundo de produtos com o removedor da GainUtility.", toolId: "background-remover" }
        }
      ]
    },
    "es-mx": {
      title: "Cómo preparar fotos de productos para tu tienda online",
      description: "Fotos de productos limpias y consistentes requieren fondos homogéneos y bordes cuidados. Conoce el flujo de trabajo para un catálogo impecable.",
      readingTime: "4 min de lectura",
      tags: ["fotos de productos", "tienda online", "fondo blanco", "e-commerce"],
      categoryLabel: "Imagens",
      quickAnswer: "Toma fotos de tus productos sobre fondo liso, elimina el fondo en GainUtility y exporta imágenes limpias sobre blanco puro o fondo transparente uniforme.",
      keyTakeaway: "Las fotos con fondo plano son ideales para procesar en el navegador: crea listados limpios y uniformes sin abrir programas costosos.",
      toolCta: { label: "Prepara fotos de productos para tu tienda — gratis en tu navegador.", toolId: "background-remover" },
      seoTitle: "Cómo preparar fotos de productos para tienda online | GainUtility",
      seoDescription: "Guía práctica para obtener fotos de producto con aspecto profesional para tu tienda en línea usando herramientas en el navegador.",
      content: [
        {
          paragraphs: [
            "Las tiendas en línea que transmiten confianza comparten un detalle: todas las fotos del catálogo guardan coherencia visual. Los fondos son limpios, los ángulos son parejos y ningún artículo luce fuera de lugar.",
            "No necesitas un estudio profesional de alto costo. Con una base lisa y las herramientas adecuadas en tu navegador, tu catálogo adquiere un aspecto profesional de inmediato."
          ]
        },
        {
          heading: "Qué facilita limpiar una foto de producto",
          paragraphs: [
            "El secreto está en el disparo inicial. Una cartulina blanca mate colocada detrás y debajo del producto crea un contraste perfecto con el objeto.",
            "Procura usar luz natural indirecta de una ventana para evitar sombras oscuras o reflejos agresivos en el empaque."
          ]
        },
        {
          heading: "Consejos prácticos para tu catálogo",
          paragraphs: ["Aplica estos tres criterios en cada publicación:"],
          list: [
            "Usa la misma relación de aspecto en todos tus artículos (por ejemplo, formato cuadrado 1:1).",
            "Asegúrate de que el producto ocupe entre el 75% y el 80% del encuadre para dejar un margen visual cómodo.",
            "Descarga en PNG transparente para que se acople naturalmente sobre el fondo blanco de cualquier tienda."
          ]
        },
        {
          heading: "El flujo de trabajo",
          paragraphs: [
            "Toma las fotos, súbelas al eliminador de fondos de GainUtility y borra el fondo con un solo clic.",
            "Comprueba los bordes en la vista previa y descarga tus archivos listos para publicarse en Mercado Libre, Amazon o Shopify."
          ],
          tool: { label: "Limpia las fotos de tu tienda con GainUtility.", toolId: "background-remover" }
        }
      ]
    },
    "es-co": {
      title: "Cómo preparar fotos de productos para tu tienda online",
      description: "Fotos de productos limpias y consistentes requieren fondos homogéneos y bordes cuidados. Conoce el flujo de trabajo para un catálogo impecable.",
      readingTime: "4 min de lectura",
      tags: ["fotos de productos", "tienda online", "fondo blanco", "e-commerce"],
      categoryLabel: "Imagens",
      quickAnswer: "Toma fotos de tus productos sobre fondo liso, elimina el fondo en GainUtility y exporta imágenes limpias sobre blanco puro o fondo transparente uniforme.",
      keyTakeaway: "Las fotos con fondo plano son ideales para procesar en el navegador: crea listados limpios y uniformes sin abrir programas costosos.",
      toolCta: { label: "Prepara fotos de productos para tu tienda — gratis en tu navegador.", toolId: "background-remover" },
      seoTitle: "Cómo preparar fotos de productos para tienda online | GainUtility",
      seoDescription: "Guía práctica para obtener fotos de producto con aspecto profesional para tu tienda en línea usando herramientas en el navegador.",
      content: [
        {
          paragraphs: [
            "Las tiendas en línea que transmiten confianza comparten un detalle: todas las fotos del catálogo guardan coherencia visual. Los fondos son limpios, los ángulos son parejos y ningún artículo luce fuera de lugar.",
            "No necesitas un estudio profesional de alto costo. Con una base lisa y las herramientas adecuadas en tu navegador, tu catálogo adquiere un aspecto profesional de inmediato."
          ]
        },
        {
          heading: "Qué facilita limpiar una foto de producto",
          paragraphs: [
            "El secreto está en el disparo inicial. Una cartulina blanca mate colocada detrás y debajo del producto crea un contraste perfecto con el objeto.",
            "Procura usar luz natural indirecta de una ventana para evitar sombras oscuras o reflejos agresivos en el empaque."
          ]
        },
        {
          heading: "Consejos prácticos para tu catálogo",
          paragraphs: ["Aplica estos tres criterios en cada publicación:"],
          list: [
            "Usa la misma relación de aspecto en todos tus artículos (por ejemplo, formato cuadrado 1:1).",
            "Asegúrate de que el producto ocupe entre el 75% y el 80% del encuadre para dejar un margen visual cómodo.",
            "Descarga en PNG transparente para que se acople naturalmente sobre el fondo blanco de cualquier tienda."
          ]
        },
        {
          heading: "El flujo de trabajo",
          paragraphs: [
            "Toma las fotos, súbelas al eliminador de fondos de GainUtility y borra el fondo con un solo clic.",
            "Comprueba los bordes en la vista previa y descarga tus archivos listos para publicarse en Mercado Libre, Amazon o Shopify."
          ],
          tool: { label: "Limpia las fotos de tu tienda con GainUtility.", toolId: "background-remover" }
        }
      ]
    },
    "de": {
      title: "Produktfotos für den Onlineshop professionell vorbereiten",
      description: "Einheitliche und saubere Produktfotos basieren auf homogenen Hintergründen und präzisen Rändern. So erstellen Sie einen harmonischen Katalog.",
      readingTime: "4 Min. Lesezeit",
      tags: ["Produktfotos", "Onlineshop", "weißer Hintergrund", "E-Commerce"],
      categoryLabel: "Bilder",
      quickAnswer: "Fotografieren Sie Produkte vor einem matten, neutralen Hintergrund, entfernen Sie den Hintergrund im GainUtility Browser-Tool und laden Sie ein freigestelltes PNG mit weißem oder transparentem Grund herunter.",
      keyTakeaway: "Einfarbige Produktaufnahmen sind perfekt für die Freistellung im Browser: einheitliche Shop-Listings ganz ohne teure Agentursoftware.",
      toolCta: { label: "Produktfotos für Ihren Shop optimieren — kostenlos im Browser.", toolId: "background-remover" },
      seoTitle: "Produktfotos für den Onlineshop vorbereiten | GainUtility",
      seoDescription: "Praxis-Leitfaden für verkaufsstarke Produktbilder: Freistellen, quadratisches Zuschneiden und einheitliche Katalogoptik im Browser.",
      content: [
        {
          paragraphs: [
            "Erfolgreiche Onlineshops wirken vor allem durch visuelle Konsistenz vertrauenswürdig: Alle Artikel sind einheitlich beleuchtet, die Hintergründe sind makellos weiß und kein Produkt wirkt wie ein schneller Schnappschuss auf dem Schreibtisch.",
            "Dazu brauchen Sie kein teures Mietstudio. Mit einem matten Tonkarton und gezielten Browser-Werkzeugen bringen Sie Ihre Produktbilder sofort auf Profi-Niveau."
          ]
        },
        {
          heading: "Was Produktfotos leicht freistellbar macht",
          paragraphs: [
            "Die Grundlage entsteht bei der Aufnahme: Platzieren Sie ein Stück matten weißen Fotokarton als Hohlkehle hinter und unter dem Produkt, um störende Kanten zu vermeiden.",
            "Verwenden Sie diffuses Tageslicht statt eines harten Kamerablitzes, um weiche Schatten und saubere Konturen zu erzeugen."
          ]
        },
        {
          heading: "Drei goldene Regeln für den Shop-Katalog",
          paragraphs: ["Halten Sie sich an diese drei Standards:"],
          list: [
            "Nutzen Sie für alle Produkte dasselbe Seitenverhältnis (z. B. 1:1 quadratisch).",
            "Der Artikel sollte etwa 75 % bis 80 % der Gesamtfläche einnehmen, damit ein harmonischer Rand bleibt.",
            "Wählen Sie transparentes PNG oder reines Weiß (#FFFFFF), damit sich das Bild nahtlos ins Shopdesign einfügt."
          ]
        },
        {
          heading: "Der vollständige Workflow",
          paragraphs: [
            "Nehmen Sie das Foto auf, laden Sie es in den GainUtility Hintergrund-Entferner und entfernen Sie den Hintergrund mit einem Klick.",
            "Kontrollieren Sie die Kanten und laden Sie das freigestellte Bild direkt in Ihr Shop-System (Shopify, WooCommerce, Amazon) hoch."
          ],
          tool: { label: "Produktfreistellung jetzt im Browser ausprobieren.", toolId: "background-remover" }
        }
      ]
    },
    "fr": {
      title: "Comment préparer des photos de produits pour votre boutique en ligne",
      description: "Des visuels de vente homogènes et soignés reposent sur des fonds unis et des contours nets. Voici le protocole pour un catalogue attractif.",
      readingTime: "4 min de lecture",
      tags: ["photos de produits", "e-commerce", "fond blanc", "boutique en ligne"],
      categoryLabel: "Images",
      quickAnswer: "Photographiez vos articles sur fond blanc uni, détourer-les avec l'outil de suppression de fond GainUtility et téléchargez des PNG nets prêts pour votre catalogue.",
      keyTakeaway: "Les photos sur fond uni sont parfaites pour le détourage dans le navigateur : créez des fiches produits impeccables sans logiciel coûteux.",
      toolCta: { label: "Préparez les photos de vos produits — gratuit et dans votre navigateur.", toolId: "background-remover" },
      seoTitle: "Préparer des photos de produits pour e-commerce | GainUtility",
      seoDescription: "Guide pratique pour harmoniser vos photos de vente : détourage rapide, format carré et fond blanc impeccable directement dans le navigateur.",
      content: [
        {
          paragraphs: [
            "Les boutiques en ligne qui convertissent le mieux affichent une cohérence visuelle parfaite : tous les produits semblent photographiés dans les mêmes conditions, les fonds sont immaculés et l'attention se porte immédiatement sur l'objet.",
            "Nul besoin d'investir dans un studio photo complexe. Une simple feuille blanche et quelques réglages dans le navigateur suffisent à métamorphoser votre catalogue."
          ]
        },
        {
          heading: "Ce qui facilite le détourage d'un produit",
          paragraphs: [
            "Tout se joue à la prise de vue : posez une feuille de papier blanc mat en courbe derrière et sous l'article pour former un fond continu sans pliure.",
            "Privilégiez la lumière naturelle d'une fenêtre pour éviter les reflets violents et obtenir des ombres légères et naturelles."
          ]
        },
        {
          heading: "Règles d'or pour un catalogue homogène",
          paragraphs: ["Respectez ces trois principes simples :"],
          list: [
            "Conservez le même ratio pour tous vos visuels (le carré 1:1 est la norme du e-commerce).",
            "Veillez à ce que l'objet occupe entre 75 % et 80 % du cadre afin de laisser respirer l'image.",
            "Exportez en PNG transparent pour que le visuel s'intègre harmonieusement sur n'importe quelle plateforme de vente."
          ]
        },
        {
          heading: "Le flux de travail recommandé",
          paragraphs: [
            "Prenez vos clichés, ouvrez le suppresseur d'arrière-plan GainUtility et cliquez sur le fond pour le supprimer instantanément.",
            "Vérifiez les contours et exportez vos images prêtes pour Shopify, PrestaShop ou vos places de marché."
          ],
          tool: { label: "Détourez vos photos de produits avec GainUtility.", toolId: "background-remover" }
        }
      ]
    },
    "it": {
      title: "Come preparare foto prodotto professionali per il tuo e-commerce",
      description: "Foto prodotto pulite e uniformi nascono da fondali omogenei e ritagli precisi. Ecco il flusso di lavoro per un catalogo curato.",
      readingTime: "4 min di lettura",
      tags: ["foto prodotto", "e-commerce", "sfondo bianco", "vendite online"],
      categoryLabel: "Immagini",
      quickAnswer: "Scatta i tuoi articoli su sfondo neutro, elimina lo sfondo con lo strumento GainUtility nel browser e scarica PNG trasparenti pronti per lo shop online.",
      keyTakeaway: "Gli scatti su sfondo uniforme sono perfetti per la rimozione nel browser: crea schede prodotto pulite e coerenti senza software costosi.",
      toolCta: { label: "Prepara le foto per il tuo negozio online — gratis nel browser.", toolId: "background-remover" },
      seoTitle: "Come preparare foto prodotto per e-commerce | GainUtility",
      seoDescription: "Guida per creare foto prodotto professionali per il tuo negozio online: scontorno veloce, proporzioni 1:1 e fondo bianco nel browser.",
      content: [
        {
          paragraphs: [
            "I siti di e-commerce più affidabili hanno una caratteristica comune: tutte le immagini del catalogo trasmettono uniformità e ordine. Gli sfondi sono nitidi, i punti luce sono coerenti e nessun prodotto sembra fotografato in fretta sul tavolo della cucina.",
            "Non serve allestire una sala posa professionale. Un cartoncino bianco opaco e gli strumenti giusti nel browser permettono di trasformare i tuoi scatti in foto da catalogo."
          ]
        },
        {
          heading: "Cosa rende una foto facile da scontornare",
          paragraphs: [
            "La chiave è nella fase di scatto: posiziona un cartoncino bianco opaco curvato dietro e sotto il prodotto per evitare pieghe o linee di giunzione nette.",
            "Sfrutta la luce naturale diffusa da una finestra ed evita flash diretti che creano ombre dure o riflessi sgradevoli sulla confezione."
          ]
        },
        {
          heading: "Tre regole per un catalogo impeccabile",
          paragraphs: ["Adotta questi tre standard per tutte le schede:"],
          list: [
            "Usa la stessa proporzione d'aspetto per tutti i prodotti (il formato quadrato 1:1 è il più versatile).",
            "Fai in modo che il prodotto occupi circa il 75–80% dell'inquadratura, lasciando un bordo bilanciato.",
            "Scarica in PNG trasparente per adattare l'immagine allo sfondo bianco del tuo tema e-commerce."
          ]
        },
        {
          heading: "Il flusso di lavoro completo",
          paragraphs: [
            "Scatta le fotografie, caricale nello strumento di rimozione sfondo di GainUtility e cancella il fondale con un clic.",
            "Ispeziona i bordi con l'anteprima e carica i file direttamente su Shopify, WooCommerce o Amazon."
          ],
          tool: { label: "Scontorna subito le foto dei tuoi prodotti con GainUtility.", toolId: "background-remover" }
        }
      ]
    },
    "id": {
      title: "Cara Menyiapkan Foto Produk untuk Toko Online Anda",
      description: "Foto produk yang rapi dan konsisten berawal dari latar belakang polos dan tepian yang halus. Begini alur kerja membuat katalog yang profesional.",
      readingTime: "4 mnt membaca",
      tags: ["foto produk", "toko online", "latar belakang putih", "e-commerce"],
      categoryLabel: "Gambar",
      quickAnswer: "Ambil foto produk di atas latar polos, hapus latarnya menggunakan alat GainUtility di browser, lalu unduh gambar bersih berlatar transparan atau putih.",
      keyTakeaway: "Foto produk berlatar polos adalah pilihan tercepat untuk diproses di browser: buat etalase toko yang konsisten tanpa membuka aplikasi mahal.",
      toolCta: { label: "Siapkan foto produk untuk toko Anda — gratis langsung di browser.", toolId: "background-remover" },
      seoTitle: "Cara Menyiapkan Foto Produk Toko Online | GainUtility",
      seoDescription: "Panduan praktis menyiapkan foto produk profesional untuk marketplace dan toko online langsung dari browser Anda.",
      content: [
        {
          paragraphs: [
            "Toko online yang terlihat terpercaya memiliki kesamaan: seluruh foto produk tampak berasal dari satu katalog yang seragam. Latar belakangnya bersih, pencahayaannya merata, dan tidak ada produk yang terlihat seperti difoto seadanya di atas meja sembarangan.",
            "Anda tidak memerlukan studio foto mahal. Dengan karton polos dan alat yang tepat di browser, etalase produk Anda langsung tampak profesional."
          ]
        },
        {
          heading: "Hal yang membuat foto produk mudah dibersihkan",
          paragraphs: [
            "Kuncinya ada pada saat memotret: letakkan selembar karton putih matte melengkung di belakang dan bawah produk untuk membentuk latar mulus tanpa garis lipatan.",
            "Gunakan cahaya alami dari jendela daripada lampu flash langsung agar bayangan di bawah produk lembut dan tidak meninggalkan pantulan tajam."
          ]
        },
        {
          heading: "Panduan praktis untuk etalase katalog Anda",
          paragraphs: ["Terapkan tiga aturan ini pada setiap foto barang:"],
          list: [
            "Gunakan rasio aspek yang sama di semua produk (rasio persegi 1:1 adalah standar terbaik e-commerce).",
            "Pastikan objek produk mengisi sekitar 75% hingga 80% dari bingkai foto agar ada ruang kosong yang rapi di sekelilingnya.",
            "Unduh dalam format PNG transparan agar menyatu dengan latar belakang putih marketplace."
          ]
        },
        {
          heading: "Alur kerja yang efisien",
          paragraphs: [
            "Ambil foto produk Anda, buka penghapus latar belakang GainUtility, lalu hilangkan latar hanya dengan satu klik.",
            "Periksa tepian pada pratinjau dan unduh file yang langsung siap diunggah ke Tokopedia, Shopee, atau toko web Anda."
          ],
          tool: { label: "Bersihkan latar belakang foto produk dengan GainUtility.", toolId: "background-remover" }
        }
      ]
    }
  }
};
