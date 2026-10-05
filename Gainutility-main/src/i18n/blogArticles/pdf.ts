/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Localized variants for Blog Articles 6-12 (PDF category).
 * Supported locales: pt-br, id, es-mx, es-co, de, fr, it.
 */

import type { LocalizedBlogArticle } from "../../blog/blogData";
import type { LocaleCode } from "../slugs";

export const PDF_ARTICLES_LOCALIZED: Record<string, Partial<Record<LocaleCode, LocalizedBlogArticle>>> = {
  "how-to-merge-pdf-files": {
    "pt-br": {
      title: "Como juntar vários arquivos PDF em um só no navegador",
      description: "Mesclar PDFs se resume à ordem correta. Organize os arquivos como devem ser lidos, junte em segundos e baixe sem enviar nada a servidores.",
      readingTime: "4 min de leitura",
      tags: ["juntar PDF", "mesclar PDF", "documentos", "privacidade"],
      categoryLabel: "PDF",
      quickAnswer: "Carregue os PDFs na ordem de leitura desejada, organize a sequência na lista e clique em mesclar. Salve o arquivo final com um nome descritivo (ex.: contrato-completo.pdf).",
      keyTakeaway: "Mescle na ordem de leitura e nomeie o arquivo com o assunto principal: os dois hábitos para manter documentos organizados.",
      toolCta: { label: "Junte PDFs na ordem que você quiser — direto no navegador.", toolId: "merge-pdf" },
      seoTitle: "Como juntar vários arquivos PDF em um só | GainUtility",
      seoDescription: "Junte vários PDFs em um documento único no navegador. Rápido, seguro, gratuito e sem fazer upload para servidores.",
      content: [
        {
          paragraphs: [
            "Juntar relatórios, comprovantes, termos e anexos em um único documento PDF é uma das tarefas mais frequentes no trabalho diário. No entanto, muitos serviços online exigem envio para a nuvem e impõem limites de tamanho ou marcas d'água.",
            "Com o processamento local no navegador, seus documentos confidenciais são montados diretamente na memória do seu computador."
          ]
        },
        {
          heading: "A ordem das páginas é o segredo",
          paragraphs: [
            "Antes de clicar no botão de mesclagem, confira a sequência dos arquivos. Ajustar a ordem depois da união costuma dar o dobro de trabalho.",
            "Renomeie os arquivos com prefixos numéricos (01-capa.pdf, 02-proposta.pdf, 03-anexos.pdf) se você estiver lidando com mais de cinco documentos."
          ],
          tool: { label: "Junte seus PDFs com facilidade na GainUtility.", toolId: "merge-pdf" }
        },
        {
          heading: "Quando mesclar PDFs é a escolha certa",
          paragraphs: ["A união de PDFs é recomendada para consolidar processos seletivos, dossiês jurídicos, declarações de impostos e relatórios mensais que precisam ser enviados por e-mail em um arquivo único e limpo."]
        },
        {
          heading: "Passo a passo no navegador",
          paragraphs: ["O processo leva poucos segundos:"],
          steps: [
            "Abra a ferramenta de juntar PDF da GainUtility.",
            "Arraste todos os arquivos PDF que deseja unificar.",
            "Arraste e solte os cards para colocar cada documento na ordem correta de leitura.",
            "Clique no botão de mesclagem para unir os arquivos localmente.",
            "Baixe seu novo PDF unificado."
          ]
        }
      ]
    },
    "es-mx": {
      title: "Cómo unir varios archivos PDF en uno solo en el navegador",
      description: "Unir PDFs consiste en fijar el orden adecuado. Organiza los documentos, júntalos en segundos y descárgalos sin subir nada a servidores.",
      readingTime: "4 min de lectura",
      tags: ["unir PDF", "combinar PDF", "documentos", "privacidad"],
      categoryLabel: "PDF",
      quickAnswer: "Sube los PDFs en el orden en que deben leerse, ajusta la secuencia y haz clic en combinar. Guarda el archivo resultante con un nombre descriptivo.",
      keyTakeaway: "Une en orden de lectura y nombra el archivo con el tema principal: dos hábitos para mantener tus documentos en orden.",
      toolCta: { label: "Une PDFs en el orden que quieras — directo en tu navegador.", toolId: "merge-pdf" },
      seoTitle: "Cómo unir varios archivos PDF en uno solo | GainUtility",
      seoDescription: "Combina varios archivos PDF en un solo documento en tu navegador. Rápido, seguro, gratuito y sin subir nada a servidores.",
      content: [
        {
          paragraphs: [
            "Juntar contratos, recibos, comprobantes y reportes en un solo archivo PDF es una necesidad recurrente. No obstante, muchos portales en línea exigen subir tus documentos a sus servidores, imponiendo límites o marcas de agua.",
            "Procesar los archivos directamente en el navegador permite unirlos al instante en la memoria de tu equipo, sin riesgos de privacidad."
          ]
        },
        {
          heading: "El orden es lo principal",
          paragraphs: [
            "Antes de generar el archivo final, verifica la disposición de las páginas. Corregir el orden a posteriori requiere pasos adicionales innecesarios.",
            "Si manejas varios documentos, ordenarlos con prefijos (01-portada.pdf, 02-contrato.pdf) te ahorrará tiempo."
          ],
          tool: { label: "Combina tus PDFs fácilmente con GainUtility.", toolId: "merge-pdf" }
        },
        {
          heading: "Cuándo es conveniente unir PDFs",
          paragraphs: ["Es la solución ideal para trámites de visado, expedientes académicos, declaraciones fiscales o presupuestos que deben enviarse en un solo correo ordenado."]
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["El procedimiento es inmediato:"],
          steps: [
            "Abre la herramienta para unir PDF de GainUtility.",
            "Arrastra los archivos que deseas unificar.",
            "Reorganiza las miniaturas hasta lograr la secuencia deseada.",
            "Haz clic en unir para procesar los documentos en tu equipo.",
            "Descarga el archivo PDF consolidado."
          ]
        }
      ]
    },
    "es-co": {
      title: "Cómo unir varios archivos PDF en uno solo en el navegador",
      description: "Unir PDFs consiste en fijar el orden adecuado. Organiza los documentos, júntalos en segundos y descárgalos sin subir nada a servidores.",
      readingTime: "4 min de lectura",
      tags: ["unir PDF", "combinar PDF", "documentos", "privacidad"],
      categoryLabel: "PDF",
      quickAnswer: "Sube los PDFs en el orden en que deben leerse, ajusta la secuencia y haz clic en combinar. Guarda el archivo resultante con un nombre descriptivo.",
      keyTakeaway: "Une en orden de lectura y nombra el archivo con el tema principal: dos hábitos para mantener tus documentos en orden.",
      toolCta: { label: "Une PDFs en el orden que quieras — directo en tu navegador.", toolId: "merge-pdf" },
      seoTitle: "Cómo unir varios archivos PDF en uno solo | GainUtility",
      seoDescription: "Combina varios archivos PDF en un solo documento en tu navegador. Rápido, seguro, gratuito y sin subir nada a servidores.",
      content: [
        {
          paragraphs: [
            "Juntar contratos, recibos, comprobantes y reportes en un solo archivo PDF es una necesidad recurrente. No obstante, muchos portales en línea exigen subir tus documentos a sus servidores, imponiendo límites o marcas de agua.",
            "Procesar los archivos directamente en el navegador permite unirlos al instante en la memoria de tu equipo, sin riesgos de privacidad."
          ]
        },
        {
          heading: "El orden es lo principal",
          paragraphs: [
            "Antes de generar el archivo final, verifica la disposición de las páginas. Corregir el orden a posteriori requiere pasos adicionales innecesarios.",
            "Si manejas varios documentos, ordenarlos con prefijos (01-portada.pdf, 02-contrato.pdf) te ahorrará tiempo."
          ],
          tool: { label: "Combina tus PDFs fácilmente con GainUtility.", toolId: "merge-pdf" }
        },
        {
          heading: "Cuándo es conveniente unir PDFs",
          paragraphs: ["Es la solución ideal para trámites de visado, expedientes académicos, declaraciones fiscales o presupuestos que deben enviarse en un solo correo ordenado."]
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["El procedimiento es inmediato:"],
          steps: [
            "Abre la herramienta para unir PDF de GainUtility.",
            "Arrastra los archivos que deseas unificar.",
            "Reorganiza las miniaturas hasta lograr la secuencia deseada.",
            "Haz clic en unir para procesar los documentos en tu equipo.",
            "Descarga el archivo PDF consolidado."
          ]
        }
      ]
    },
    "de": {
      title: "Mehrere PDF-Dateien im Browser zu einer zusammenfügen",
      description: "PDFs zusammenfügen ist vor allem eine Frage der richtigen Reihenfolge. Sortieren, in Sekunden kombinieren und ohne Daten-Upload herunterladen.",
      readingTime: "4 Min. Lesezeit",
      tags: ["PDF zusammenfügen", "PDF verbinden", "Dokumente", "Datenschutz"],
      categoryLabel: "PDF",
      quickAnswer: "Laden Sie die PDFs in der gewünschten Lesereihenfolge hoch, passen Sie die Anordnung bei Bedarf an und klicken Sie auf Zusammenfügen. Speichern Sie das Ergebnis unter einem aussagekräftigen Namen ab.",
      keyTakeaway: "In Lesereihenfolge zusammenfügen und nach dem Thema benennen: die zwei Gewohnheiten für perfekt organisierte Unterlagen.",
      toolCta: { label: "PDFs in der gewünschten Reihenfolge zusammenfügen — lokal im Browser.", toolId: "merge-pdf" },
      seoTitle: "PDFs zu einer Datei zusammenfügen | GainUtility",
      seoDescription: "Kombinieren Sie mehrere PDFs zu einem Dokument direkt in Ihrem Browser. Sicher, schnell, kostenlos und ohne Server-Upload.",
      content: [
        {
          paragraphs: [
            "Bewerbungsunterlagen, Zeugnisse, Rechnungen oder Belege in einer einzigen PDF-Datei zu bündeln, spart Zeit und Nerven. Viele Online-Dienste verlangen dafür jedoch das Hochladen sensibler Dokumente auf fremde Server.",
            "Mit der clientseitigen Ausführung im Browser fügen Sie vertrauliche Dokumente direkt im Arbeitsspeicher Ihres Computers zusammen."
          ]
        },
        {
          heading: "Die Reihenfolge entscheidet",
          paragraphs: [
            "Prüfen Sie vor dem Zusammenfügen die Position jedes Dokuments. Nachträgliches Umsortieren ist deutlich umständlicher.",
            "Bei umfangreichen Dokumentenpaketen hilft eine vorherige Nummerierung der Dateien (01-Anschreiben.pdf, 02-Lebenslauf.pdf, 03-Zeugnisse.pdf)."
          ],
          tool: { label: "PDFs bequem im Browser zusammenfügen mit GainUtility.", toolId: "merge-pdf" }
        },
        {
          heading: "Wann das Zusammenfügen sinnvoll ist",
          paragraphs: ["Optimal für Steuerunterlagen, behördliche Anträge, Immobilienunterlagen und Verträge, die als geschlossenes Dokument versendet werden sollen."]
        },
        {
          heading: "Schritt für Schritt im Browser",
          paragraphs: ["Der gesamte Vorgang dauert nur wenige Sekunden:"],
          steps: [
            "Öffnen Sie das GainUtility PDF-Zusammenfügen-Tool.",
            "Ziehen Sie alle gewünschten PDF-Dateien in das Browserfenster.",
            "Verschieben Sie die Kacheln per Drag-and-Drop in die richtige Reihenfolge.",
            "Klicken Sie auf Zusammenfügen, um die Datei lokal zu erzeugen.",
            "Laden Sie die fertige, gebündelte PDF-Datei herunter."
          ]
        }
      ]
    },
    "fr": {
      title: "Comment fusionner plusieurs fichiers PDF en un seul dans le navigateur",
      description: "Fusionner des PDF repose sur le bon ordonnancement. Classez les fichiers, assemblez-les en quelques secondes et téléchargez sans aucun upload.",
      readingTime: "4 min de lecture",
      tags: ["fusionner PDF", "assembler PDF", "documents", "confidentialité"],
      categoryLabel: "PDF",
      quickAnswer: "Importez vos PDF dans l'ordre de lecture souhaité, ajustez l'agencement et lancez la fusion. Nommez le document obtenu de manière claire (ex. dossier-complet.pdf).",
      keyTakeaway: "Fusionnez dans l'ordre de lecture et donnez un nom explicite : les deux réflexes pour des documents impeccablement classés.",
      toolCta: { label: "Fusionnez vos PDF dans l'ordre de votre choix — dans le navigateur.", toolId: "merge-pdf" },
      seoTitle: "Comment fusionner plusieurs PDF en un seul | GainUtility",
      seoDescription: "Rassemblez plusieurs PDF en un seul document dans votre navigateur. Rapide, privé, gratuit et sans envoyer de données sur des serveurs.",
      content: [
        {
          paragraphs: [
            "Regrouper des justificatifs, contrats ou rapports mensuels dans un fichier PDF unique facilite grandement les démarches administratives et professionnelles. Cependant, nombre d'outils en ligne imposent de téléverser vos fichiers confidentiels sur des serveurs distants.",
            "Grâce à l'exécution locale dans le navigateur, vos documents restent confinés à la mémoire vive de votre machine."
          ]
        },
        {
          heading: "L'ordre des pages est capital",
          paragraphs: [
            "Avant de lancer l'assemblage, vérifiez attentivement l'ordre des éléments. Il est toujours plus simple d'ordonner en amont que de réorganiser après coup.",
            "Pour les dossiers volumineux, préfixer les fichiers (01-lettre.pdf, 02-cv.pdf, 03-diplomes.pdf) évite toute erreur d'inversion."
          ],
          tool: { label: "Assemblez vos fichiers PDF facilement avec GainUtility.", toolId: "merge-pdf" }
        },
        {
          heading: "Dans quels cas fusionner vos documents",
          paragraphs: ["Cette opération est idéale pour les dossiers de candidature, les déclarations fiscales ou les devis accompagnés de leurs conditions générales de vente."]
        },
        {
          heading: "La marche à suivre pas à pas",
          paragraphs: ["L'opération s'effectue en quelques secondes :"],
          steps: [
            "Ouvrez l'outil de fusion PDF de GainUtility.",
            "Glissez-déposez tous les PDF à réunir.",
            "Réorganisez les vignettes par simple glisser-déposer pour définir la séquence.",
            "Cliquez sur Fusionner pour compiler le document en local.",
            "Téléchargez votre PDF consolidé."
          ]
        }
      ]
    },
    "it": {
      title: "Come unire più file PDF in uno solo nel browser",
      description: "Unire i PDF è soprattutto una questione di ordine. Disponi i file nella sequenza giusta, uniscili in pochi secondi e scarica senza caricare nulla su server.",
      readingTime: "4 min di lettura",
      tags: ["unire PDF", "fondere PDF", "documenti", "privacy"],
      categoryLabel: "PDF",
      quickAnswer: "Carica i PDF nell'ordine di lettura desiderato, organizza la sequenza e fai clic su Unisci. Salva il documento con un nome chiaro e descrittivo.",
      keyTakeaway: "Unisci nell'ordine di lettura e assegna un nome chiaro: le due abitudini per mantenere la documentazione ordinata.",
      toolCta: { label: "Unisci i PDF nell'ordine che preferisci — direttamente nel browser.", toolId: "merge-pdf" },
      seoTitle: "Come unire più file PDF in uno solo | GainUtility",
      seoDescription: "Combina più file PDF in un unico documento direttamente nel browser. Veloce, sicuro, gratuito e senza caricare file su server.",
      content: [
        {
          paragraphs: [
            "Raggruppare contratti, fatture, ricevute o dispense in un unico documento PDF è un'esigenza quotidiana. Purtroppo molti servizi online richiedono l'upload dei tuoi file su server remoti, con limitazioni e dubbi sulla riservatezza.",
            "L'elaborazione locale nel browser permette invece di combinare documenti riservati direttamente nella memoria del tuo dispositivo."
          ]
        },
        {
          heading: "L'ordine dei fogli è fondamentale",
          paragraphs: [
            "Prima di premere il pulsante di unione, controlla la sequenza dei documenti. Riordinare le pagine in un secondo momento richiede il doppio dei passaggi.",
            "Se devi gestire numerosi file, rinominali con numeri progressivi (01-copertina.pdf, 02-testo.pdf, 03-allegati.pdf)."
          ],
          tool: { label: "Unisci i tuoi PDF facilmente con GainUtility.", toolId: "merge-pdf" }
        },
        {
          heading: "Quando conviene unire i PDF",
          paragraphs: ["È la soluzione ideale per inviare pratiche burocratiche, bilanci aziendali, tesi universitarie o domande di concorso in un unico allegato ordinato."]
        },
        {
          heading: "Procedura passo dopo passo",
          paragraphs: ["Bastano pochi secondi:"],
          steps: [
            "Apri lo strumento per unire PDF di GainUtility.",
            "Trascina tutti i file PDF che vuoi raggruppare.",
            "Sposta le schede dei file per stabilire l'ordine esatto.",
            "Fai clic su Unisci per generare il file locale.",
            "Scarica il PDF unificato sul tuo computer."
          ]
        }
      ]
    },
    "id": {
      title: "Cara Menggabungkan Beberapa File PDF Menjadi Satu di Browser",
      description: "Menggabungkan PDF intinya adalah memastikan urutan yang benar. Susun file sesuai urutan baca, gabungkan dalam hitungan detik, dan unduh tanpa unggah ke server.",
      readingTime: "4 mnt membaca",
      tags: ["gabung PDF", "satukan PDF", "dokumen", "privasi"],
      categoryLabel: "PDF",
      quickAnswer: "Muat file-file PDF sesuai urutan baca yang diinginkan, atur ulang posisi jika perlu, lalu klik gabungkan. Beri nama file baru dengan subjek dokumen yang jelas.",
      keyTakeaway: "Gabungkan sesuai urutan baca dan beri nama dokumen dengan jelas: dua kebiasaan agar berkas selalu rapi.",
      toolCta: { label: "Gabungkan PDF sesuai urutan yang Anda inginkan — di browser Anda.", toolId: "merge-pdf" },
      seoTitle: "Cara Menggabungkan File PDF Menjadi Satu | GainUtility",
      seoDescription: "Satukan beberapa file PDF menjadi satu dokumen rapi di browser Anda. Cepat, aman, gratis, dan tanpa mengunggah file ke server mana pun.",
      content: [
        {
          paragraphs: [
            "Menggabungkan berkas lamaran, kwitansi, laporan, dan lampiran menjadi satu file PDF yang rapi adalah kebutuhan sehari-hari. Sayangnya, banyak layanan web meminta Anda mengunggah dokumen pribadi ke server mereka dengan batasan ukuran yang mengganggu.",
            "Dengan pemrosesan lokal di browser, dokumen penting Anda dirangkai langsung di memori perangkat Anda tanpa pernah keluar ke internet."
          ]
        },
        {
          heading: "Urutan file adalah kunci utama",
          paragraphs: [
            "Sebelum mengeklik tombol gabungkan, pastikan urutan dokumen sudah benar. Memperbaiki urutan halaman setelah digabungkan membutuhkan waktu tambahan.",
            "Jika ada banyak file, beri nomor awalan pada nama file (01-surat.pdf, 02-cv.pdf, 03-ijazah.pdf) agar penyusunan menjadi otomatis rapi."
          ],
          tool: { label: "Satukan file PDF Anda dengan mudah di GainUtility.", toolId: "merge-pdf" }
        },
        {
          heading: "Kapan penggabungan PDF diperlukan",
          paragraphs: ["Sangat berguna untuk pengajuan berkas beasiswa, laporan bulanan kantor, pengarsipan pajak, atau dokumen tender yang wajib dikirim dalam satu lampiran email."]
        },
        {
          heading: "Langkah demi langkah di browser",
          paragraphs: ["Prosesnya hanya butuh beberapa detik:"],
          steps: [
            "Buka alat penggabung PDF GainUtility di browser Anda.",
            "Tarik dan letakkan semua file PDF yang ingin disatukan.",
            "Geser kotak dokumen untuk menyesuaikan urutan yang tepat.",
            "Klik tombol gabungkan untuk memproses berkas secara lokal.",
            "Unduh dokumen PDF tunggal yang sudah jadi."
          ]
        }
      ]
    }
  },

  "how-to-split-a-pdf": {
    "pt-br": {
      title: "Como dividir um PDF e manter apenas as páginas necessárias",
      description: "A maioria das divisões é, na verdade, uma extração. Escolha o intervalo de páginas desejado e exporte um novo documento sem alterar o original.",
      readingTime: "4 min de leitura",
      tags: ["dividir PDF", "extrair páginas", "documentos", "privacidade"],
      categoryLabel: "PDF",
      quickAnswer: "Abra o divisor de PDF da GainUtility, carregue o documento, digite o intervalo de páginas desejado (ex.: 3-7) e exporte. O arquivo original permanece inalterado.",
      keyTakeaway: "A maior parte das divisões é uma extração: selecione o intervalo, salve apenas as páginas úteis e mantenha o original intacto.",
      toolCta: { label: "Extraia apenas as páginas que você precisa de um PDF.", toolId: "split-pdf" },
      seoTitle: "Como dividir um PDF e extrair páginas | GainUtility",
      seoDescription: "Aprenda a dividir arquivos PDF e extrair intervalos específicos de páginas direto no navegador, com total privacidade.",
      content: [
        {
          paragraphs: ["Muitas vezes você recebe um documento de 60 páginas, mas precisa enviar a um cliente ou formulário apenas as páginas 4 e 5. Veja como extrair esse trecho sem complicações."]
        },
        {
          heading: "O caso comum: extrair um intervalo",
          paragraphs: ["Na maioria das situações, o objetivo é isolar uma seção específica — um contrato de duas páginas dentro de um relatório longo. Você só precisa digitar o número inicial e final para criar um arquivo enxuto."]
        },
        {
          heading: "O outro caso: separar em vários arquivos",
          paragraphs: ["Quando se digitaliza um lote de faturas em um arquivo único, pode ser necessário gerar um PDF independente para cada folha. A ferramenta oferece tanto a extração por intervalo quanto a divisão página por página."],
          tool: { label: "Divida seus PDFs com segurança no navegador com a GainUtility.", toolId: "split-pdf" }
        },
        {
          heading: "Passo a passo no navegador",
          paragraphs: ["A extração é concluída em poucos cliques:"],
          steps: [
            "Abra o divisor de PDF da GainUtility.",
            "Arraste seu arquivo PDF para a área de carregamento.",
            "Selecione o modo: intervalo de páginas (ex: 2-5) ou páginas individuais.",
            "Clique em exportar para gerar o novo documento na memória local.",
            "Baixe seu novo PDF focado e leve."
          ]
        }
      ]
    },
    "es-mx": {
      title: "Cómo dividir un PDF y conservar solo las páginas necesarias",
      description: "Casi siempre dividir equivale a extraer. Elige el rango de páginas que te interesa y exporta un nuevo PDF manteniendo el original intacto.",
      readingTime: "4 min de lectura",
      tags: ["dividir PDF", "extraer páginas", "documentos", "privacidad"],
      categoryLabel: "PDF",
      quickAnswer: "Abre el divisor de PDF de GainUtility, sube el documento, indica el rango de páginas a conservar (ej. 3-8) y exporta. Obtendrás un nuevo archivo de inmediato.",
      keyTakeaway: "La mayoría de las divisiones son extracciones: define el rango, conserva lo necesario y mantén el documento original a salvo.",
      toolCta: { label: "Extrae solo las páginas que necesitas de un PDF.", toolId: "split-pdf" },
      seoTitle: "Cómo dividir un PDF y extraer páginas | GainUtility",
      seoDescription: "Aprende a separar páginas de un PDF en tu navegador sin instalar programas y sin enviar información confidencial a servidores.",
      content: [
        {
          paragraphs: ["Es muy frecuente recibir un PDF extenso de 50 páginas cuando el trámite solo requiere la constancia o la póliza ubicada en las hojas 3 a 5. Aquí te mostramos cómo recortarlo rápidamente."]
        },
        {
          heading: "El caso habitual: extraer un rango",
          paragraphs: ["Basta con especificar qué páginas te interesan para generar un documento ligero con la información estrictamente necesaria."]
        },
        {
          heading: "El otro caso: separar en hojas individuales",
          paragraphs: ["Si escaneaste múltiples facturas en un solo archivo continuo, puedes desglosarlo para que cada hoja se convierta en su propio archivo PDF independiente."],
          tool: { label: "Divide documentos PDF en tu navegador con GainUtility.", toolId: "split-pdf" }
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["El proceso toma menos de un minuto:"],
          steps: [
            "Abre el divisor de PDF de GainUtility.",
            "Carga el archivo PDF que deseas modificar.",
            "Indica el intervalo de páginas que necesitas extraer.",
            "Haz clic en dividir para procesar en tu dispositivo.",
            "Descarga el nuevo documento listo para enviar."
          ]
        }
      ]
    },
    "es-co": {
      title: "Cómo dividir un PDF y conservar solo las páginas necesarias",
      description: "Casi siempre dividir equivale a extraer. Elige el rango de páginas que te interesa y exporta un nuevo PDF manteniendo el original intacto.",
      readingTime: "4 min de lectura",
      tags: ["dividir PDF", "extraer páginas", "documentos", "privacidad"],
      categoryLabel: "PDF",
      quickAnswer: "Abre el divisor de PDF de GainUtility, sube el documento, indica el rango de páginas a conservar (ej. 3-8) y exporta. Obtendrás un nuevo archivo de inmediato.",
      keyTakeaway: "La mayoría de las divisiones son extracciones: define el rango, conserva lo necesario y mantén el documento original a salvo.",
      toolCta: { label: "Extrae solo las páginas que necesitas de un PDF.", toolId: "split-pdf" },
      seoTitle: "Cómo dividir un PDF y extraer páginas | GainUtility",
      seoDescription: "Aprende a separar páginas de un PDF en tu navegador sin instalar programas y sin enviar información confidencial a servidores.",
      content: [
        {
          paragraphs: ["Es muy frecuente recibir un PDF extenso de 50 páginas cuando el trámite solo requiere la constancia o la póliza ubicada en las hojas 3 a 5. Aquí te mostramos cómo recortarlo rápidamente."]
        },
        {
          heading: "El caso habitual: extraer un rango",
          paragraphs: ["Basta con especificar qué páginas te interesan para generar un documento ligero con la información estrictamente necesaria."]
        },
        {
          heading: "El otro caso: separar en hojas individuales",
          paragraphs: ["Si escaneaste múltiples facturas en un solo archivo continuo, puedes desglosarlo para que cada hoja se convierta en su propio archivo PDF independiente."],
          tool: { label: "Divide documentos PDF en tu navegador con GainUtility.", toolId: "split-pdf" }
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["El proceso toma menos de un minuto:"],
          steps: [
            "Abre el divisor de PDF de GainUtility.",
            "Carga el archivo PDF que deseas modificar.",
            "Indica el intervalo de páginas que necesitas extraer.",
            "Haz clic en dividir para procesar en tu dispositivo.",
            "Descarga el nuevo documento listo para enviar."
          ]
        }
      ]
    },
    "de": {
      title: "PDF teilen und gezielt einzelne Seiten extrahieren",
      description: "In den meisten Fällen bedeutet Teilen das Extrahieren bestimmter Seiten. Wählen Sie den gewünschten Bereich und speichern Sie ein neues Dokument.",
      readingTime: "4 Min. Lesezeit",
      tags: ["PDF teilen", "Seiten extrahieren", "Dokumente", "Datenschutz"],
      categoryLabel: "PDF",
      quickAnswer: "Öffnen Sie den GainUtility PDF-Teiler, laden Sie die Datei hoch, geben Sie den gewünschten Seitenbereich ein (z. B. 4–8) und exportieren Sie das neue, schlanke Dokument.",
      keyTakeaway: "Teilen ist meist Extrahieren: Bereich festlegen, relevante Seiten speichern und das Originaldokument unangetastet lassen.",
      toolCta: { label: "Nur benötigte Seiten aus einem PDF extrahieren.", toolId: "split-pdf" },
      seoTitle: "PDF teilen & Seiten extrahieren | GainUtility",
      seoDescription: "Trennen Sie einzelne Seiten aus einer PDF-Datei heraus — direkt im Browser ohne Installation und mit maximaler Datensicherheit.",
      content: [
        {
          paragraphs: ["Oft erhält man ein langes 40-seitiges PDF-Handbuch oder einen Vertrag, benötigt für eine Behörde oder einen Kunden aber nur zwei Seiten. So lösen Sie das Problem im Browser."]
        },
        {
          heading: "Der Standardfall: Einen Seitenbereich entnehmen",
          paragraphs: ["Geben Sie einfach die Start- und Endseite an, um exakt die benötigten Blätter in ein neues, handliches Dokument zu übertragen."]
        },
        {
          heading: "Der zweite Fall: In Einzelseiten aufteilen",
          paragraphs: ["Wurden mehrere Lieferscheine am Scanner in eine Sammeldatei gescannt, können Sie die Datei auch Seite für Seite in separate Einzel-PDFs zerlegen."],
          tool: { label: "PDF-Dateien sicher im Browser aufteilen mit GainUtility.", toolId: "split-pdf" }
        },
        {
          heading: "Schritt für Schritt im Browser",
          paragraphs: ["Die Extraktion erfordert nur wenige Handgriffe:"],
          steps: [
            "Öffnen Sie den GainUtility PDF-Teiler im Browser.",
            "Laden Sie die Ausgangsdatei hoch.",
            "Tragen Sie die gewünschten Seitenzahlen ein.",
            "Starten Sie die lokale Erstellung mit einem Klick.",
            "Laden Sie das neue Dokument herunter."
          ]
        }
      ]
    },
    "fr": {
      title: "Comment diviser un PDF et ne garder que les pages utiles",
      description: "Dans la majorité des cas, diviser revient à extraire. Définissez la plage de pages souhaitée et générez un nouveau document sans toucher à l'original.",
      readingTime: "4 min de lecture",
      tags: ["diviser PDF", "extraire pages", "documents", "confidentialité"],
      categoryLabel: "PDF",
      quickAnswer: "Ouvrez l'outil de division PDF GainUtility, déposez votre document, entrez l'intervalle de pages à conserver (ex. 3 à 6) et exportez votre nouveau fichier.",
      keyTakeaway: "La plupart des divisions sont des extractions : sélectionnez les pages utiles et préservez l'original intact.",
      toolCta: { label: "Extrayez uniquement les pages dont vous avez besoin.", toolId: "split-pdf" },
      seoTitle: "Diviser un PDF et extraire des pages | GainUtility",
      seoDescription: "Découpez facilement un PDF volumineux pour n'en conserver que les pages nécessaires, directement dans votre navigateur.",
      content: [
        {
          paragraphs: ["Il est fréquent de devoir transmettre un justificatif de deux pages noyé au milieu d'un rapport de cinquante pages. Voici comment extraire ce passage sans logiciel payant."]
        },
        {
          heading: "Le besoin courant : extraire un intervalle",
          paragraphs: ["Il vous suffit d'indiquer les numéros de page pour obtenir un fichier léger et parfaitement ciblé."]
        },
        {
          heading: "L'autre besoin : découper page par page",
          paragraphs: ["Pour séparer une liasse de factures scannées d'un seul bloc, vous pouvez également générer un PDF individuel par feuille."],
          tool: { label: "Divisez vos documents PDF en toute sécurité avec GainUtility.", toolId: "split-pdf" }
        },
        {
          heading: "La procédure pas à pas",
          paragraphs: ["L'opération prend moins d'une minute :"],
          steps: [
            "Accédez au diviseur de PDF GainUtility.",
            "Déposez votre fichier dans la zone prévue.",
            "Spécifiez la plage de pages à isoler.",
            "Générez le nouveau document en local.",
            "Téléchargez le fichier allégé."
          ]
        }
      ]
    },
    "it": {
      title: "Come dividere un PDF ed estrarre solo le pagine necessarie",
      description: "Spesso dividere significa semplicemente estrarre. Scegli l'intervallo di pagine desiderato e genera un nuovo PDF mantenendo l'originale intatto.",
      readingTime: "4 min di lettura",
      tags: ["dividere PDF", "estrarre pagine", "documenti", "privacy"],
      categoryLabel: "PDF",
      quickAnswer: "Apri lo strumento per dividere PDF di GainUtility, carica il documento, indica l'intervallo di pagine da isolare (es. 2-6) ed esporta il nuovo file.",
      keyTakeaway: "Dividere è quasi sempre estrarre: seleziona l'intervallo, salva solo ciò che serve e conserva intatto l'originale.",
      toolCta: { label: "Estrai solo le pagine di cui hai bisogno da un PDF.", toolId: "split-pdf" },
      seoTitle: "Come dividere un PDF ed estrarre pagine | GainUtility",
      seoDescription: "Impara a estrarre singole pagine o intervalli da un file PDF direttamente nel browser, gratis e nel pieno rispetto della privacy.",
      content: [
        {
          paragraphs: ["Capita spesso di dover inviare per email solo una ricevuta o un certificato contenuto all'interno di un fascicolo di 30 pagine. Ecco come estrarlo al volo."]
        },
        {
          heading: "Il caso principale: estrarre un intervallo",
          paragraphs: ["Imposta la pagina iniziale e finale per isolare la sezione di tuo interesse in un documento leggero."]
        },
        {
          heading: "L'altro caso: dividere in singoli fogli",
          paragraphs: ["Se hai scansionato fatture multiple in un unico file, puoi separarle in modo che ogni foglio diventi un PDF autonomo."],
          tool: { label: "Dividi i tuoi PDF nel browser con GainUtility.", toolId: "split-pdf" }
        },
        {
          heading: "Guida passo passo",
          paragraphs: ["Bastano pochissimi passaggi:"],
          steps: [
            "Apri lo strumento di divisione PDF di GainUtility.",
            "Carica il file originale.",
            "Digita i numeri delle pagine da estrarre.",
            "Elabora il file in locale.",
            "Scarica il nuovo PDF compatto."
          ]
        }
      ]
    },
    "id": {
      title: "Cara Memisahkan Halaman PDF dan Mengambil yang Diperlukan",
      description: "Memisahkan PDF sebagian besar adalah tentang mengekstrak halaman tertentu. Pilih rentang halaman yang diinginkan dan simpan dokumen baru.",
      readingTime: "4 mnt membaca",
      tags: ["pisah PDF", "ekstrak halaman", "dokumen", "privasi"],
      categoryLabel: "PDF",
      quickAnswer: "Buka pemisah PDF GainUtility, muat dokumen Anda, ketik rentang halaman yang ingin diambil (misal: 3-5), lalu ekspor menjadi PDF baru.",
      keyTakeaway: "Sebagian besar pemisahan adalah ekstraksi: pilih rentangnya, simpan halaman yang diperlukan, dan file asli tetap utuh.",
      toolCta: { label: "Ekstrak hanya halaman yang Anda butuhkan dari sebuah PDF.", toolId: "split-pdf" },
      seoTitle: "Cara Memisahkan PDF & Ekstrak Halaman | GainUtility",
      seoDescription: "Panduan memisahkan file PDF dan mengambil rentang halaman tertentu langsung di browser dengan cepat dan aman.",
      content: [
        {
          paragraphs: ["Sering kali Anda menerima dokumen setebal 40 halaman tetapi hanya perlu melampirkan lembar ke-3 dan ke-4 untuk formulir pendaftaran. Begini cara mengekstraknya."]
        },
        {
          heading: "Kasus umum: mengekstrak rentang halaman",
          paragraphs: ["Cukup masukkan nomor halaman awal dan akhir untuk menghasilkan berkas baru yang ringkas dan sesuai kebutuhan."]
        },
        {
          heading: "Kasus lainnya: memecah menjadi lembaran terpisah",
          paragraphs: ["Jika Anda memindai banyak kwitansi sekaligus dalam satu dokumen, Anda bisa memecahnya agar tiap lembar menjadi satu file PDF tersendiri."],
          tool: { label: "Pisahkan file PDF di browser dengan GainUtility.", toolId: "split-pdf" }
        },
        {
          heading: "Langkah demi langkah di browser",
          paragraphs: ["Hanya butuh waktu kurang dari semenit:"],
          steps: [
            "Buka alat pemisah PDF GainUtility.",
            "Tarik file PDF Anda ke layar.",
            "Tentukan rentang halaman yang ingin diambil.",
            "Klik pisahkan untuk memproses dokumen di perangkat Anda.",
            "Unduh file PDF baru yang sudah siap digunakan."
          ]
        }
      ]
    }
  },

  "how-to-convert-pdf-to-jpg": {
    "pt-br": {
      title: "Como converter páginas de PDF em imagens JPG no navegador",
      description: "Cada página do PDF se transforma em uma imagem individual. Escolha a resolução adequada e extraia fotos com nitidez e privacidade.",
      readingTime: "4 min de leitura",
      tags: ["converter PDF em JPG", "PDF para imagem", "documentos", "rasterização"],
      categoryLabel: "PDF",
      quickAnswer: "Carregue o PDF no conversor da GainUtility, defina a resolução de saída e exporte. Cada página é convertida instantaneamente em uma imagem JPG nítida.",
      keyTakeaway: "Cada página vira um arquivo JPG: selecione a resolução antes de exportar e inspecione o resultado antes de enviar.",
      toolCta: { label: "Converta páginas de PDF em JPGs individuais.", toolId: "pdf-to-jpg" },
      seoTitle: "Como converter páginas de PDF em JPG | GainUtility",
      seoDescription: "Transforme páginas de documentos PDF em imagens JPG de alta resolução direto no navegador, sem upload para a nuvem.",
      content: [
        {
          paragraphs: ["Quando você precisa publicar um certificado no Instagram, enviar um documento por WhatsApp ou inserir uma página de relatório em uma apresentação, o formato JPG é muito mais prático do que um PDF."]
        },
        {
          heading: "Uma página, um JPG",
          paragraphs: ["Ao converter um PDF, cada página se torna um arquivo de imagem separado, transformando textos e vetores em pixels perfeitamente legíveis."]
        },
        {
          heading: "A resolução define a nitidez do texto",
          paragraphs: ["Para leitura confortável na tela ou postagem em redes sociais, uma resolução moderada é ideal. Para impressão ou leitura de fontes pequenas, selecione resolução alta."],
          tool: { label: "Converta PDF em imagens com o conversor GainUtility.", toolId: "pdf-to-jpg" }
        },
        {
          heading: "Passo a passo no navegador",
          paragraphs: ["A conversão é simples e imediata:"],
          steps: [
            "Abra o conversor de PDF para JPG da GainUtility.",
            "Carregue o arquivo PDF que deseja converter.",
            "Escolha se deseja converter todas as páginas ou apenas páginas específicas.",
            "Defina a qualidade ou resolução desejada.",
            "Baixe as imagens individualmente ou em um arquivo compactado."
          ]
        }
      ]
    },
    "es-mx": {
      title: "Cómo convertir páginas de un PDF a imágenes JPG en el navegador",
      description: "Cada página del PDF se convierte en una imagen individual. Elige la resolución adecuada y obtén imágenes nítidas con total privacidad.",
      readingTime: "4 min de lectura",
      tags: ["convertir PDF a JPG", "PDF a imagen", "documentos", "resolución"],
      categoryLabel: "PDF",
      quickAnswer: "Carga el PDF en el convertidor de GainUtility, selecciona las páginas y la resolución deseada, y descarga las imágenes JPG resultantes de inmediato.",
      keyTakeaway: "Cada página se convierte en una foto JPG: elige la resolución antes de exportar y revisa la nitidez del texto.",
      toolCta: { label: "Convierte páginas de PDF a archivos JPG individuales.", toolId: "pdf-to-jpg" },
      seoTitle: "Cómo convertir páginas de PDF a JPG | GainUtility",
      seoDescription: "Transforma páginas de tus documentos PDF a imágenes JPG de buena calidad en tu navegador sin subir archivos a la red.",
      content: [
        {
          paragraphs: ["Si requieres compartir un comprobante por mensajería, subir un diploma a LinkedIn o insertar una diapositiva en PowerPoint, el formato de imagen JPG resulta mucho más accesible que un PDF."]
        },
        {
          heading: "Una página, un JPG",
          paragraphs: ["La herramienta procesa cada hoja del documento como una imagen independiente, renderizando tipografías y gráficos con nitidez."]
        },
        {
          heading: "La resolución es clave para el texto",
          paragraphs: ["Para visualización en pantalla, una resolución estándar es ligera y suficiente. Para documentos con letras muy pequeñas o tablas, elige una resolución superior."],
          tool: { label: "Convierte PDF a imagen en tu navegador con GainUtility.", toolId: "pdf-to-jpg" }
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["Obtén tus imágenes en segundos:"],
          steps: [
            "Abre el convertidor de PDF a JPG de GainUtility.",
            "Arrastra el archivo PDF al área de trabajo.",
            "Selecciona las páginas que deseas transformar.",
            "Ajusta la calidad de imagen requerida.",
            "Descarga los archivos JPG a tu dispositivo."
          ]
        }
      ]
    },
    "es-co": {
      title: "Cómo convertir páginas de un PDF a imágenes JPG en el navegador",
      description: "Cada página del PDF se convierte en una imagen individual. Elige la resolución adecuada y obtén imágenes nítidas con total privacidad.",
      readingTime: "4 min de lectura",
      tags: ["convertir PDF a JPG", "PDF a imagen", "documentos", "resolución"],
      categoryLabel: "PDF",
      quickAnswer: "Carga el PDF en el convertidor de GainUtility, selecciona las páginas y la resolución deseada, y descarga las imágenes JPG resultantes de inmediato.",
      keyTakeaway: "Cada página se convierte en una foto JPG: elige la resolución antes de exportar y revisa la nitidez del texto.",
      toolCta: { label: "Convierte páginas de PDF a archivos JPG individuales.", toolId: "pdf-to-jpg" },
      seoTitle: "Cómo convertir páginas de PDF a JPG | GainUtility",
      seoDescription: "Transforma páginas de tus documentos PDF a imágenes JPG de buena calidad en tu navegador sin subir archivos a la red.",
      content: [
        {
          paragraphs: ["Si requieres compartir un comprobante por mensajería, subir un diploma a LinkedIn o insertar una diapositiva en PowerPoint, el formato de imagen JPG resulta mucho más accesible que un PDF."]
        },
        {
          heading: "Una página, un JPG",
          paragraphs: ["La herramienta procesa cada hoja del documento como una imagen independiente, renderizando tipografías y gráficos con nitidez."]
        },
        {
          heading: "La resolución es clave para el texto",
          paragraphs: ["Para visualización en pantalla, una resolución estándar es ligera y suficiente. Para documentos con letras muy pequeñas o tablas, elige una resolución superior."],
          tool: { label: "Convierte PDF a imagen en tu navegador con GainUtility.", toolId: "pdf-to-jpg" }
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["Obtén tus imágenes en segundos:"],
          steps: [
            "Abre el convertidor de PDF a JPG de GainUtility.",
            "Arrastra el archivo PDF al área de trabajo.",
            "Selecciona las páginas que deseas transformar.",
            "Ajusta la calidad de imagen requerida.",
            "Descarga los archivos JPG a tu dispositivo."
          ]
        }
      ]
    },
    "de": {
      title: "PDF-Seiten im Browser in JPG-Bilder umwandeln",
      description: "Jede PDF-Seite wird zu einem eigenständigen Bild. Wählen Sie die passende Auflösung und exportieren Sie scharfe Grafiken ohne Daten-Upload.",
      readingTime: "4 Min. Lesezeit",
      tags: ["PDF in JPG", "PDF umwandeln", "Dokumente", "Bilder"],
      categoryLabel: "PDF",
      quickAnswer: "Laden Sie Ihr PDF im GainUtility Konverter hoch, wählen Sie die Seiten und die gewünschte Auflösung, und laden Sie die fertigen JPG-Bilder direkt herunter.",
      keyTakeaway: "Jede Seite wird zu einem JPG: Wählen Sie die Auflösung vor dem Export und prüfen Sie die Lesbarkeit vor dem Versenden.",
      toolCta: { label: "PDF-Seiten in einzelne JPG-Dateien umwandeln.", toolId: "pdf-to-jpg" },
      seoTitle: "PDF in JPG umwandeln | GainUtility",
      seoDescription: "Konvertieren Sie PDF-Dokumente im Handumdrehen in hochauflösende JPG-Bilder. Direkt im Browser und ohne Sicherheitsrisiken.",
      content: [
        {
          paragraphs: ["Ob für Präsentationen, Social Media oder den schnellen Versand per Chat: Häufig ist ein Bildformat wie JPG wesentlich praktischer als eine PDF-Datei."]
        },
        {
          heading: "Eine Seite entspricht einem JPG",
          paragraphs: ["Der Konverter rendert die Vektordaten und Schriften der PDF-Seite sauber in Pixelgrafiken um."]
        },
        {
          heading: "Die Auflösung entscheidet über Textschärfe",
          paragraphs: ["Für die Bildschirmnutzung genügt eine Standardauflösung. Enthält das Dokument kleine Tabellen oder feinen Text, empfiehlt sich eine höhere Render-Auflösung."],
          tool: { label: "PDFs lokal im Browser in Bilder umwandeln mit GainUtility.", toolId: "pdf-to-jpg" }
        },
        {
          heading: "Schritt für Schritt im Browser",
          paragraphs: ["Die Umwandlung ist in wenigen Sekunden abgeschlossen:"],
          steps: [
            "Öffnen Sie den GainUtility PDF-zu-JPG-Konverter.",
            "Laden Sie Ihr PDF-Dokument hoch.",
            "Wählen Sie die zu konvertierenden Seiten aus.",
            "Bestimmen Sie die Auflösungsstufe.",
            "Laden Sie die fertigen JPG-Dateien herunter."
          ]
        }
      ]
    },
    "fr": {
      title: "Comment convertir des pages PDF en images JPG dans le navigateur",
      description: "Chaque page du PDF devient une image distincte. Choisissez la résolution adéquate et obtenez des visuels nets sans envoyer vos données sur le cloud.",
      readingTime: "4 min de lecture",
      tags: ["convertir PDF en JPG", "PDF en image", "documents", "résolution"],
      categoryLabel: "PDF",
      quickAnswer: "Glissez votre PDF dans le convertisseur GainUtility, choisissez les pages et la résolution, puis téléchargez instantanément vos images JPG.",
      keyTakeaway: "Chaque page génère une image JPG : déterminez la résolution avant l'export et vérifiez la lisibilité des textes.",
      toolCta: { label: "Convertir des pages PDF en images JPG distinctes.", toolId: "pdf-to-jpg" },
      seoTitle: "Convertir des pages PDF en JPG | GainUtility",
      seoDescription: "Transformez vos documents PDF en images JPG de haute qualité directement dans votre navigateur, gratuitement et en toute confidentialité.",
      content: [
        {
          paragraphs: ["Pour intégrer un certificat sur un réseau social ou inclure une page d'attestation dans une présentation, l'image JPG est bien plus facile à manipuler qu'un fichier PDF."]
        },
        {
          heading: "Une page égale une image JPG",
          paragraphs: ["Le convertisseur transforme chaque feuillet du document en une image autonome parfaitement fidèle."]
        },
        {
          heading: "La résolution garantit la lisibilité",
          paragraphs: ["Pour une consultation sur smartphone ou tablette, la résolution normale est légère. Si le document comporte des petits caractères ou des schémas détaillés, privilégiez une résolution supérieure."],
          tool: { label: "Convertissez vos PDF en images avec GainUtility.", toolId: "pdf-to-jpg" }
        },
        {
          heading: "Comment procéder pas à pas",
          paragraphs: ["La conversion s'effectue en quelques secondes :"],
          steps: [
            "Ouvrez le convertisseur PDF en JPG GainUtility.",
            "Déposez votre document PDF.",
            "Indiquez les pages à exporter en images.",
            "Réglez la qualité souhaitée.",
            "Téléchargez vos images JPG."
          ]
        }
      ]
    },
    "it": {
      title: "Come convertire le pagine di un PDF in immagini JPG nel browser",
      description: "Ogni pagina del PDF si trasforma in un'immagine singola. Imposta la risoluzione corretta e ottieni immagini nitide salvaguardando la privacy.",
      readingTime: "4 min di lettura",
      tags: ["convertire PDF in JPG", "PDF in immagine", "documenti", "risoluzione"],
      categoryLabel: "PDF",
      quickAnswer: "Carica il file PDF nello strumento GainUtility, scegli le pagine e la risoluzione desiderata e scarica subito le immagini JPG generate.",
      keyTakeaway: "Ogni pagina diventa un file JPG: seleziona la risoluzione prima dell'esportazione e controlla la nitidezza.",
      toolCta: { label: "Converti le pagine PDF in singoli file JPG.", toolId: "pdf-to-jpg" },
      seoTitle: "Come convertire pagine PDF in JPG | GainUtility",
      seoDescription: "Trasforma le pagine dei tuoi PDF in immagini JPG nitide e pronte per la condivisione, direttamente nel browser e senza upload esterni.",
      content: [
        {
          paragraphs: ["Quando devi pubblicare un attestato sui social o allegare una ricevuta in una chat, il formato immagine JPG è molto più comodo e immediato di un documento PDF."]
        },
        {
          heading: "Una pagina per ogni file JPG",
          paragraphs: ["La conversione rasterizza ciascun foglio del PDF in un'immagine a sé stante con colori fedeli."]
        },
        {
          heading: "La risoluzione fa la differenza",
          paragraphs: ["Per la normale lettura su display una risoluzione standard è ottimale. Per documenti contrattuali ricchi di clausole minuscole, scegli una risoluzione maggiore."],
          tool: { label: "Converti PDF in immagini con GainUtility.", toolId: "pdf-to-jpg" }
        },
        {
          heading: "Guida alla conversione rapida",
          paragraphs: ["Pochi semplici passaggi nel browser:"],
          steps: [
            "Accedi allo strumento PDF in JPG di GainUtility.",
            "Trascina il documento PDF da convertire.",
            "Seleziona le pagine di tuo interesse.",
            "Imposta la qualità preferita.",
            "Scarica le immagini JPG sul tuo dispositivo."
          ]
        }
      ]
    },
    "id": {
      title: "Cara Mengonversi Halaman PDF Menjadi Gambar JPG di Browser",
      description: "Setiap halaman PDF akan diubah menjadi satu gambar terpisah. Pilih resolusi yang tepat dan dapatkan gambar yang tajam tanpa mengunggah file.",
      readingTime: "4 mnt membaca",
      tags: ["konversi PDF ke JPG", "PDF ke gambar", "dokumen", "resolusi"],
      categoryLabel: "PDF",
      quickAnswer: "Unggah dokumen PDF ke alat GainUtility, pilih halaman dan resolusi yang diinginkan, lalu unduh gambar JPG yang dihasilkan secara instan.",
      keyTakeaway: "Setiap halaman menjadi satu gambar JPG: tentukan resolusi sebelum mengunduh dan periksa ketajaman teksnya.",
      toolCta: { label: "Konversikan halaman PDF menjadi gambar JPG terpisah.", toolId: "pdf-to-jpg" },
      seoTitle: "Cara Konversi Halaman PDF ke JPG | GainUtility",
      seoDescription: "Ubah halaman dokumen PDF Anda menjadi file gambar JPG beresolusi tinggi langsung di browser tanpa perlu mengirim data ke server luar.",
      content: [
        {
          paragraphs: ["Saat ingin membagikan bukti transfer, sertifikat, atau dokumen tugas ke WhatsApp dan media sosial, format gambar JPG jauh lebih mudah dibuka penerima daripada file PDF."]
        },
        {
          heading: "Satu halaman menjadi satu file JPG",
          paragraphs: ["Alat ini merender setiap halaman dokumen menjadi file gambar terpisah dengan tata letak teks yang tetap presisi."]
        },
        {
          heading: "Resolusi menentukan ketajaman teks",
          paragraphs: ["Untuk tampilan layar smartphone, resolusi standar sudah sangat memadai. Namun jika ada tabel angka atau teks berukuran kecil, gunakan opsi resolusi tinggi."],
          tool: { label: "Konversikan PDF ke gambar dengan GainUtility.", toolId: "pdf-to-jpg" }
        },
        {
          heading: "Langkah mudah di browser",
          paragraphs: ["Prosesnya sangat singkat:"],
          steps: [
            "Buka konverter PDF ke JPG GainUtility.",
            "Pilih dokumen PDF yang ingin Anda ubah.",
            "Tentukan halaman mana saja yang ingin dijadikan gambar.",
            "Atur kualitas atau resolusi gambar.",
            "Unduh gambar JPG ke perangkat Anda."
          ]
        }
      ]
    }
  },

  "how-to-convert-jpg-to-pdf": {
    "pt-br": {
      title: "Como converter imagens JPG em um único documento PDF",
      description: "A ordem de leitura é a principal decisão. Numere e ordene suas imagens antes de converter para gerar um PDF uniforme e profissional.",
      readingTime: "4 min de leitura",
      tags: ["JPG para PDF", "converter fotos", "documentos", "organização"],
      categoryLabel: "PDF",
      quickAnswer: "Carregue suas imagens JPG no conversor da GainUtility, organize a ordem das fotos na lista e exporte como um arquivo PDF único.",
      keyTakeaway: "Defina a ordem de leitura primeiro: numere as imagens, organize a sequência e converta em um único PDF limpo.",
      toolCta: { label: "Transforme uma sequência de fotos em um PDF legível.", toolId: "jpg-to-pdf" },
      seoTitle: "Como converter imagens JPG em PDF | GainUtility",
      seoDescription: "Converta múltiplas fotos e imagens JPG em um arquivo PDF organizado diretamente no seu navegador, sem limites e sem upload.",
      content: [
        {
          paragraphs: ["Fotografar documentos, recibos ou páginas de apostilas com o celular e enviá-los como 10 imagens soltas gera confusão para quem recebe. Agrupá-las em um PDF único é a forma mais profissional de entrega."]
        },
        {
          heading: "A ordem de leitura é a decisão mais importante",
          paragraphs: [
            "O maior erro ao transformar fotos em PDF é deixar as imagens fora de ordem.",
            "Ao carregar seus arquivos, ordene as páginas visualmente arrastando os itens para que a página 1 venha antes da página 2."
          ],
          tool: { label: "Crie um documento PDF a partir de suas fotos na GainUtility.", toolId: "jpg-to-pdf" }
        },
        {
          heading: "Quando essa conversão é essencial",
          paragraphs: ["Ideal para envio de trabalhos acadêmicos, prestação de contas com recibos fiscais ou documentações exigidas por advogados e bancos."]
        },
        {
          heading: "Passo a passo no navegador",
          paragraphs: ["Leva menos de um minuto:"],
          steps: [
            "Abra o conversor de JPG para PDF da GainUtility.",
            "Arraste todas as fotos ou imagens que deseja compilar.",
            "Arraste as miniaturas para ajustar a sequência exata de leitura.",
            "Clique em converter para unificar os arquivos na memória do navegador.",
            "Baixe o PDF pronto para envio."
          ]
        }
      ]
    },
    "es-mx": {
      title: "Cómo convertir imágenes JPG a un solo archivo PDF",
      description: "El orden de lectura es la decisión clave. Ordena tus fotos antes de convertir para obtener un PDF estructurado y formal.",
      readingTime: "4 min de lectura",
      tags: ["JPG a PDF", "convertir fotos", "documentos", "organización"],
      categoryLabel: "PDF",
      quickAnswer: "Sube tus fotos JPG al convertidor de GainUtility, organízalas en el orden en que deben leerse y descárgalas agrupadas en un solo archivo PDF.",
      keyTakeaway: "Fija el orden de lectura primero: ordena las imágenes, acomoda la secuencia y convierte en un solo documento claro.",
      toolCta: { label: "Convierte una serie de fotos en un PDF ordenado.", toolId: "jpg-to-pdf" },
      seoTitle: "Cómo convertir imágenes JPG a PDF | GainUtility",
      seoDescription: "Transforma varias imágenes JPG a un PDF ordenado en tu navegador de forma gratuita, segura y sin subir tus fotos a servidores.",
      content: [
        {
          paragraphs: ["Enviar diez fotos sueltas de un contrato o tarea escolar complica la revisión del destinatario. Compilarlas en un solo PDF garantiza que nadie pierda una página."]
        },
        {
          heading: "El orden de lectura es lo principal",
          paragraphs: [
            "Asegúrate de que la portada y las páginas consecutivas mantengan el flujo lógico del documento.",
            "La vista previa te permite arrastrar y reacomodar fácilmente cualquier imagen antes de la exportación definitiva."
          ],
          tool: { label: "Convierte JPG a PDF en tu navegador con GainUtility.", toolId: "jpg-to-pdf" }
        },
        {
          heading: "Cuándo conviene esta conversión",
          paragraphs: ["Indispensable para trámites notariales, entregas escolares, reembolsos corporativos de viáticos y comprobantes de pago."]
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["Procedimiento rápido y limpio:"],
          steps: [
            "Ingresa al convertidor de JPG a PDF de GainUtility.",
            "Arrastra las fotografías o imágenes JPG.",
            "Acomoda las páginas en el orden deseado.",
            "Genera el PDF con un solo clic.",
            "Descarga el documento unificado."
          ]
        }
      ]
    },
    "es-co": {
      title: "Cómo convertir imágenes JPG a un solo archivo PDF",
      description: "El orden de lectura es la decisión clave. Ordena tus fotos antes de convertir para obtener un PDF estructurado y formal.",
      readingTime: "4 min de lectura",
      tags: ["JPG a PDF", "convertir fotos", "documentos", "organización"],
      categoryLabel: "PDF",
      quickAnswer: "Sube tus fotos JPG al convertidor de GainUtility, organízalas en el orden en que deben leerse y descárgalas agrupadas en un solo archivo PDF.",
      keyTakeaway: "Fija el orden de lectura primero: ordena las imágenes, acomoda la secuencia y convierte en un solo documento claro.",
      toolCta: { label: "Convierte una serie de fotos en un PDF ordenado.", toolId: "jpg-to-pdf" },
      seoTitle: "Cómo convertir imágenes JPG a PDF | GainUtility",
      seoDescription: "Transforma varias imágenes JPG a un PDF ordenado en tu navegador de forma gratuita, segura y sin subir tus fotos a servidores.",
      content: [
        {
          paragraphs: ["Enviar diez fotos sueltas de un contrato o tarea escolar complica la revisión del destinatario. Compilarlas en un solo PDF garantiza que nadie pierda una página."]
        },
        {
          heading: "El orden de lectura es lo principal",
          paragraphs: [
            "Asegúrate de que la portada y las páginas consecutivas mantengan el flujo lógico del documento.",
            "La vista previa te permite arrastrar y reacomodar fácilmente cualquier imagen antes de la exportación definitiva."
          ],
          tool: { label: "Convierte JPG a PDF en tu navegador con GainUtility.", toolId: "jpg-to-pdf" }
        },
        {
          heading: "Cuándo conviene esta conversión",
          paragraphs: ["Indispensable para trámites notariales, entregas escolares, reembolsos corporativos de viáticos y comprobantes de pago."]
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["Procedimiento rápido y limpio:"],
          steps: [
            "Ingresa al convertidor de JPG a PDF de GainUtility.",
            "Arrastra las fotografías o imágenes JPG.",
            "Acomoda las páginas en el orden deseado.",
            "Genera el PDF con un solo clic.",
            "Descarga el documento unificado."
          ]
        }
      ]
    },
    "de": {
      title: "JPG-Bilder im Browser in ein PDF-Dokument umwandeln",
      description: "Die Lesereihenfolge ist die wichtigste Entscheidung. Sortieren Sie Ihre Bilder vor der Konvertierung, um ein sauberes PDF zu erhalten.",
      readingTime: "4 Min. Lesezeit",
      tags: ["JPG in PDF", "Bilder umwandeln", "Dokumente", "Organisation"],
      categoryLabel: "PDF",
      quickAnswer: "Laden Sie die JPG-Bilder hoch, ordnen Sie sie in der gewünschten Seitenfolge an und exportieren Sie alles in eine einzige PDF-Datei.",
      keyTakeaway: "Erst die Reihenfolge festlegen, dann konvertieren: So entsteht ein strukturiertes PDF-Dokument in genau der beabsichtigten Abfolge.",
      toolCta: { label: "Bilderserie in ein ordentliches PDF umwandeln.", toolId: "jpg-to-pdf" },
      seoTitle: "JPG-Bilder in PDF umwandeln | GainUtility",
      seoDescription: "Fügen Sie mehrere JPG-Fotos und Grafiken direkt im Browser zu einer einzigen PDF-Datei zusammen. Sicher, schnell und ohne Upload.",
      content: [
        {
          paragraphs: ["Wer abfotografierte Belege oder Dokumentenseiten einzeln per E-Mail versendet, stiftet beim Empfänger oft Verwirrung. Das Bündeln in ein einziges PDF ist die sauberste Lösung."]
        },
        {
          heading: "Die Reihenfolge entscheidet über das Ergebnis",
          paragraphs: [
            "Achten Sie darauf, dass Seite 1 auch wirklich an erster Stelle liegt.",
            "In der visuellen Vorschau können Sie einzelne Kacheln per Maus verschieben, bis die logische Abfolge stimmt."
          ],
          tool: { label: "Bilder mit GainUtility einfach in PDFs umwandeln.", toolId: "jpg-to-pdf" }
        },
        {
          heading: "Wann die Konvertierung besonders nützlich ist",
          paragraphs: ["Typische Anwendungsbereiche sind Spesenabrechnungen, Mietunterlagen, Notariatsdokumente und handschriftliche Notizen."]
        },
        {
          heading: "Schritt für Schritt im Browser",
          paragraphs: ["In wenigen Klicks zum Ziel:"],
          steps: [
            "Starten Sie den GainUtility JPG-zu-PDF-Konverter.",
            "Ziehen Sie alle JPG-Bilder in das Werkzeug.",
            "Passen Sie die Reihenfolge der Seiten nach Wunsch an.",
            "Klicken Sie auf Konvertieren, um das PDF lokal zu erstellen.",
            "Laden Sie die fertige PDF-Datei herunter."
          ]
        }
      ]
    },
    "fr": {
      title: "Comment convertir des images JPG en un document PDF unique",
      description: "L'ordre de lecture est la décision principale. Numérotez et organisez vos visuels avant de les compiler pour obtenir un PDF impeccable.",
      readingTime: "4 min de lecture",
      tags: ["JPG en PDF", "convertir photos", "documents", "classement"],
      categoryLabel: "PDF",
      quickAnswer: "Importez vos images JPG dans le convertisseur GainUtility, disposez-les dans l'ordre chronologique ou logique de lecture, puis exportez en un seul PDF.",
      keyTakeaway: "Définissez l'ordre en premier : classez vos visuels, vérifiez la séquence et convertissez en un PDF unique et propre.",
      toolCta: { label: "Transformez une suite d'images en un PDF lisible.", toolId: "jpg-to-pdf" },
      seoTitle: "Convertir des images JPG en PDF | GainUtility",
      seoDescription: "Rassemblez plusieurs photos ou images JPG en un seul fichier PDF ordonné directement dans votre navigateur, gratuitement et en toute sécurité.",
      content: [
        {
          paragraphs: ["Envoyer dix photos éparses d'un contrat ou de reçus de notes de frais est peu pratique. Compiler ces images dans un PDF cohérent fait gagner un temps précieux à votre destinataire."]
        },
        {
          heading: "L'ordre de lecture est primordial",
          paragraphs: [
            "Prenez soin de vérifier que la page de garde se trouve en première position.",
            "L'aperçu interactif vous permet d'ajuster l'ordre de chaque image par simple glisser-déposer avant l'exportation."
          ],
          tool: { label: "Créez votre document PDF à partir d'images avec GainUtility.", toolId: "jpg-to-pdf" }
        },
        {
          heading: "Dans quels cas utiliser ce format",
          paragraphs: ["Cette solution est parfaite pour les dossiers de location, les notes de frais de déplacement ou les relevés bancaires photographiés."]
        },
        {
          heading: "La procédure pas à pas",
          paragraphs: ["Moins de soixante secondes suffisent :"],
          steps: [
            "Accédez au convertisseur JPG en PDF GainUtility.",
            "Déposez vos images dans l'outil.",
            "Réorganisez les vignettes pour fixer la séquence de lecture.",
            "Lancez la génération du document.",
            "Téléchargez votre PDF consolidé."
          ]
        }
      ]
    },
    "it": {
      title: "Come convertire immagini JPG in un unico documento PDF",
      description: "L'ordine delle pagine è la scelta fondamentale. Disponi le foto nella sequenza corretta prima di generare un PDF pulito e professionale.",
      readingTime: "4 min di lettura",
      tags: ["JPG in PDF", "convertire foto", "documenti", "ordine"],
      categoryLabel: "PDF",
      quickAnswer: "Carica le tue immagini JPG nello strumento GainUtility, disponile nell'ordine di lettura desiderato ed esporta un unico documento PDF.",
      keyTakeaway: "Imposta prima l'ordine di lettura: sistema la sequenza delle immagini e converti in un PDF chiaro e uniforme.",
      toolCta: { label: "Raggruppa una sequenza di immagini in un PDF ordinato.", toolId: "jpg-to-pdf" },
      seoTitle: "Come convertire immagini JPG in PDF | GainUtility",
      seoDescription: "Unisci più fotografie e immagini JPG in un documento PDF ordinato nel tuo browser, senza limiti e senza caricare file online.",
      content: [
        {
          paragraphs: ["Inviare diverse foto sfuse di documenti o ricevute via email crea disordine. Raggrupparle in un unico PDF è la scelta più ordinata e professionale."]
        },
        {
          heading: "L'ordine di lettura è il passaggio fondamentale",
          paragraphs: [
            "Assicurati che la prima pagina sia effettivamente posizionata all'inizio.",
            "L'interfaccia ti consente di trascinare le anteprime per stabilire con precisione il flusso di lettura."
          ],
          tool: { label: "Crea file PDF dalle tue foto con GainUtility.", toolId: "jpg-to-pdf" }
        },
        {
          heading: "Quando questa conversione è la più indicata",
          paragraphs: ["Ideale per la rendicontazione di note spese, contratti d'affitto, documenti d'identità e compiti scolastici fotografati."]
        },
        {
          heading: "Procedura semplice nel browser",
          paragraphs: ["Operazione immediata:"],
          steps: [
            "Apri il convertitore JPG in PDF di GainUtility.",
            "Trascina le immagini nell'area dedicata.",
            "Regola l'ordine delle anteprime.",
            "Fai clic per convertire in locale.",
            "Scarica il file PDF finale."
          ]
        }
      ]
    },
    "id": {
      title: "Cara Mengonversi Gambar JPG Menjadi Satu File PDF",
      description: "Urutan membaca adalah kunci utama. Susun foto-foto Anda dengan benar sebelum mengonversi agar menghasilkan dokumen PDF yang rapi.",
      readingTime: "4 mnt membaca",
      tags: ["JPG ke PDF", "konversi foto", "dokumen", "merapikan berkas"],
      categoryLabel: "PDF",
      quickAnswer: "Unggah foto-foto JPG ke konverter GainUtility, atur urutan halamannya, lalu unduh dokumen PDF tunggal yang sudah tersusun rapi.",
      keyTakeaway: "Tentukan urutan baca terlebih dahulu: atur susunan foto, lalu konversikan menjadi satu PDF yang bersih.",
      toolCta: { label: "Ubah rangkaian foto menjadi satu PDF yang mudah dibaca.", toolId: "jpg-to-pdf" },
      seoTitle: "Cara Mengubah Foto JPG Menjadi PDF | GainUtility",
      seoDescription: "Satukan banyak foto dan gambar JPG menjadi satu file PDF terstruktur langsung di browser Anda tanpa perlu mengunggah ke server luar.",
      content: [
        {
          paragraphs: ["Mengirim banyak foto dokumen terpisah melalui email sering kali menyulitkan penerima dalam membaca runtutan informasi. Menggabungkannya menjadi satu file PDF adalah solusi terbaik."]
        },
        {
          heading: "Urutan halaman adalah hal terpenting",
          paragraphs: [
            "Pastikan halaman pertama berada di posisi paling atas.",
            "Gunakan pratinjau visual untuk menyeret dan mengatur ulang posisi foto sampai alurnya tepat."
          ],
          tool: { label: "Ubah foto menjadi dokumen PDF rapi dengan GainUtility.", toolId: "jpg-to-pdf" }
        },
        {
          heading: "Kapan konversi ini sangat dibutuhkan",
          paragraphs: ["Sangat penting untuk pengumpulan tugas kuliah, bukti kwitansi reimburse kantor, atau pendaftaran berkas administrasi kependudukan."]
        },
        {
          heading: "Langkah mudah di browser",
          paragraphs: ["Hanya butuh beberapa detik:"],
          steps: [
            "Buka konverter JPG ke PDF GainUtility di browser Anda.",
            "Masukkan semua foto yang ingin disatukan.",
            "Atur urutan foto agar berurutan dengan benar.",
            "Klik tombol konversi untuk menyatukannya secara lokal.",
            "Unduh dokumen PDF yang sudah siap dikirim."
          ]
        }
      ]
    }
  },

  "how-to-compress-a-pdf": {
    "pt-br": {
      title: "Como comprimir um arquivo PDF sem torná-lo ilegível",
      description: "Páginas escaneadas são o maior peso de um PDF. Comprima em etapas controladas para reduzir o tamanho mantendo o texto nítido.",
      readingTime: "4 min de leitura",
      tags: ["comprimir PDF", "reduzir tamanho", "otimizar PDF", "documentos"],
      categoryLabel: "PDF",
      quickAnswer: "Use a ferramenta de compressão da GainUtility para otimizar as imagens internas do PDF. Um arquivo escaneado de 12 MB costuma cair para 3 a 5 MB permanecendo perfeitamente legível.",
      keyTakeaway: "Comprima apenas o necessário: priorize a legibilidade e reduza o peso em passos graduais até que ele atenda ao limite.",
      toolCta: { label: "Precisa de um PDF abaixo do limite de envio mas ainda nítido?", toolId: "compress-images-inside-pdf" },
      seoTitle: "Como comprimir PDF sem perder legibilidade | GainUtility",
      seoDescription: "Aprenda a comprimir arquivos PDF no navegador preservando a clareza do texto e das imagens, sem enviar dados para a nuvem.",
      content: [
        {
          paragraphs: ["Muitos portais limitam o upload de PDFs a 5 MB ou 2 MB. Comprimir em excesso pode tornar números de CPF, datas ou assinaturas ilegíveis, causando a rejeição do processo."]
        },
        {
          heading: "De onde vem o peso excessivo do PDF",
          paragraphs: ["PDFs pesados são quase sempre compostos por imagens escaneadas em resolução muito alta (300 DPI ou mais). Textos digitados nativamente em Word quase não pesam nada."]
        },
        {
          heading: "Nem toda página precisa do mesmo tratamento",
          paragraphs: ["Uma página com contrato de texto tolera compressão diferente de uma folha com selo autenticado em cartório. O equilíbrio é preservar o contraste das letras pretas."]
        },
        {
          heading: "Comprima em etapas controladas",
          paragraphs: [
            "Comece aplicando compressão média (em torno de 150 DPI). Esse valor reduz o peso em mais de 60% e preserva total nitidez em telas de computadores e celulares.",
            "Verifique uma página com letras miúdas antes de enviar o arquivo."
          ],
          tool: { label: "Otimize as imagens do seu PDF no navegador com a GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Quando aceitar o limite",
          paragraphs: ["Se o documento já estiver em 150 DPI e o tamanho ainda estourar o limite, considere dividir o PDF em duas partes (ex: Parte 1 e Parte 2) em vez de degradar o texto a ponto de ficar ilegível."]
        }
      ]
    },
    "es-mx": {
      title: "Cómo comprimir un PDF sin perder legibilidad",
      description: "Las páginas escaneadas representan casi todo el peso de un PDF. Comprime en pasos graduales para bajar los megabytes sin borrar el texto.",
      readingTime: "4 min de lectura",
      tags: ["comprimir PDF", "reducir peso", "optimizar PDF", "documentos"],
      categoryLabel: "PDF",
      quickAnswer: "Aplica la herramienta de compresión de GainUtility para optimizar imágenes incrustadas. Un archivo escaneado de 12 MB suele reducirse a 3–5 MB conservando nitidez absoluta.",
      keyTakeaway: "Comprime solo lo justo: mantén la legibilidad como prioridad y reduce el peso en pasos controlados.",
      toolCta: { label: "¿Necesitas un PDF ligero pero legible para un trámite?", toolId: "compress-images-inside-pdf" },
      seoTitle: "Cómo comprimir un PDF sin perder calidad | GainUtility",
      seoDescription: "Aprende a reducir el tamaño de tus archivos PDF en el navegador manteniendo las letras nítidas y sin subir información a servidores.",
      content: [
        {
          paragraphs: ["Las plataformas de empleo y trámites oficiales suelen rechazar PDFs mayores a 2 MB o 5 MB. Comprimir descuidadamente puede volver borrosos números clave y firmas."]
        },
        {
          heading: "El origen del peso en un PDF",
          paragraphs: ["El peso no proviene del texto escrito, sino de fotos e imágenes escaneadas a resoluciones exageradas para su visualización digital."]
        },
        {
          heading: "Diferencia entre texto e imágenes",
          paragraphs: ["Los documentos generados en procesadores de texto ocupan kilobytes; los escaneos de oficina son los que acumulan megabytes innecesarios."]
        },
        {
          heading: "Comprime de forma escalonada",
          paragraphs: [
            "Aplica una compresión moderada que conserve 150 DPI de resolución efectiva. Esto rebaja drásticamente el peso manteniendo la claridad en pantallas.",
            "Revisa siempre una página con letra pequeña antes de concluir el trámite."
          ],
          tool: { label: "Reduce el peso de tu PDF en tu navegador con GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Cuándo conviene dividir en vez de comprimir",
          paragraphs: ["Si el documento sigue siendo demasiado pesado tras una compresión limpia, divídelo en dos partes lógicas en vez de forzar una calidad que vuelva ilegible el contenido."]
        }
      ]
    },
    "es-co": {
      title: "Cómo comprimir un PDF sin perder legibilidad",
      description: "Las páginas escaneadas representan casi todo el peso de un PDF. Comprime en pasos graduales para bajar los megabytes sin borrar el texto.",
      readingTime: "4 min de lectura",
      tags: ["comprimir PDF", "reducir peso", "optimizar PDF", "documentos"],
      categoryLabel: "PDF",
      quickAnswer: "Aplica la herramienta de compresión de GainUtility para optimizar imágenes incrustadas. Un archivo escaneado de 12 MB suele reducirse a 3–5 MB conservando nitidez absoluta.",
      keyTakeaway: "Comprime solo lo justo: mantén la legibilidad como prioridad y reduce el peso en pasos controlados.",
      toolCta: { label: "¿Necesitas un PDF ligero pero legible para un trámite?", toolId: "compress-images-inside-pdf" },
      seoTitle: "Cómo comprimir un PDF sin perder calidad | GainUtility",
      seoDescription: "Aprende a reducir el tamaño de tus archivos PDF en el navegador manteniendo las letras nítidas y sin subir información a servidores.",
      content: [
        {
          paragraphs: ["Las plataformas de empleo y trámites oficiales suelen rechazar PDFs mayores a 2 MB o 5 MB. Comprimir descuidadamente puede volver borrosos números clave y firmas."]
        },
        {
          heading: "El origen del peso en un PDF",
          paragraphs: ["El peso no proviene del texto escrito, sino de fotos e imágenes escaneadas a resoluciones exageradas para su visualización digital."]
        },
        {
          heading: "Diferencia entre texto e imágenes",
          paragraphs: ["Los documentos generados en procesadores de texto ocupan kilobytes; los escaneos de oficina son los que acumulan megabytes innecesarios."]
        },
        {
          heading: "Comprime de forma escalonada",
          paragraphs: [
            "Aplica una compresión moderada que conserve 150 DPI de resolución efectiva. Esto rebaja drásticamente el peso manteniendo la claridad en pantallas.",
            "Revisa siempre una página con letra pequeña antes de concluir el trámite."
          ],
          tool: { label: "Reduce el peso de tu PDF en tu navegador con GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Cuándo conviene dividir en vez de comprimir",
          paragraphs: ["Si el documento sigue siendo demasiado pesado tras una compresión limpia, divídelo en dos partes lógicas en vez de forzar una calidad que vuelva ilegible el contenido."]
        }
      ]
    },
    "de": {
      title: "PDF-Dateien komprimieren ohne unleserliche Texte",
      description: "Gescannte Seiten machen den Hauptteil der Dateigröße aus. Komprimieren Sie schrittweise, um Megabytes zu sparen und Schriften klar zu halten.",
      readingTime: "4 Min. Lesezeit",
      tags: ["PDF komprimieren", "Dateigröße reduzieren", "PDF verkleinern", "Dokumente"],
      categoryLabel: "PDF",
      quickAnswer: "Nutzen Sie das GainUtility Komprimierungs-Tool für eingebettete Bilder. Ein gescanntes 12-MB-Dokument schrumpft meist auf 4–5 MB bei tadelloser Lesbarkeit.",
      keyTakeaway: "Nur so stark komprimieren wie nötig: Erst die Lesbarkeit sichern, dann schrittweise verkleinern, bis das Limit unterschritten ist.",
      toolCta: { label: "PDF unter eine Upload-Grenze bringen — lesbar und kompakt.", toolId: "compress-images-inside-pdf" },
      seoTitle: "PDF komprimieren ohne Qualitätsverlust | GainUtility",
      seoDescription: "Leitfaden zur PDF-Komprimierung im Browser: Reduzieren Sie die Dateigröße um bis zu 70 % bei perfekter Textschärfe.",
      content: [
        {
          paragraphs: ["Viele Bewerbungs- und Behördenportale blockieren Uploads über 5 MB. Eine zu aggressive Kompression lässt Unterschriften und Kleingedrucktes jedoch unleserlich verschwimmen."]
        },
        {
          heading: "Woher die Dateigröße wirklich stammt",
          paragraphs: ["Reiner Text verbraucht fast keinen Speicher. Der Speicherfresser sind gescannte Papierseiten, die als gigantische 300-DPI-Bilder im PDF eingebunden sind."]
        },
        {
          heading: "Gezielte Bildoptimierung im Dokument",
          paragraphs: ["Die Reduktion der DPI-Auflösung auf praxisgerechte 150 DPI spart den Großteil des Datenvolumens, ohne dass Zahlen oder Buchstaben am Monitor unscharf werden."]
        },
        {
          heading: "Schrittweise komprimieren",
          paragraphs: [
            "Führen Sie die Komprimierung in einer ausgewogenen Stufe durch und zoomen Sie auf eine Seite mit feinen Tabellen.",
            "Bleibt alles klar lesbar, haben Sie das perfekte Verhältnis aus Größe und Lesbarkeit erreicht."
          ],
          tool: { label: "PDFs direkt im Browser optimieren mit GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Wann Aufteilen die bessere Wahl ist",
          paragraphs: ["Ist ein Dokument nach vernünftiger Kompression immer noch zu groß, teilen Sie es lieber in zwei Teile (z. B. Teil 1 und Teil 2), anstatt die Bildqualität bis zur Unkenntlichkeit zu ruinieren."]
        }
      ]
    },
    "fr": {
      title: "Comment compresser un PDF sans le rendre illisible",
      description: "Les pages scannées constituent le poids principal d'un PDF. Compressez par étapes maîtrisées pour alléger le fichier sans altérer les textes.",
      readingTime: "4 min de lecture",
      tags: ["compresser PDF", "réduire PDF", "optimisation PDF", "documents"],
      categoryLabel: "PDF",
      quickAnswer: "Utilisez l'outil de compression GainUtility pour optimiser les visuels internes. Un scan de 12 Mo passe couramment sous les 4 Mo tout en restant d'une lisibilité parfaite.",
      keyTakeaway: "Compressez uniquement ce qui est nécessaire : préservez la lisibilité puis réduisez la taille par paliers mesurés.",
      toolCta: { label: "Besoin de réduire un PDF sous la limite d'envoi tout en restant net ?", toolId: "compress-images-inside-pdf" },
      seoTitle: "Compresser un PDF sans perdre en lisibilité | GainUtility",
      seoDescription: "Réduisez le poids de vos fichiers PDF directement dans le navigateur tout en garantissant des textes parfaitement nets.",
      content: [
        {
          paragraphs: ["De nombreux portails imposent des plafonds stricts à 2 Mo ou 5 Mo. Une compression excessive peut dégrader des chiffres fiscaux ou des signatures au point de faire rejeter votre dossier."]
        },
        {
          heading: "D'où provient le poids d'un PDF",
          paragraphs: ["Le texte pur ne pèse que quelques kilo-octets. Ce sont les pages scannées sous forme de photographies en très haute définition qui alourdissent le fichier."]
        },
        {
          heading: "Traiter les visuels avec discernement",
          paragraphs: ["La solution consiste à rééchantillonner les images internes à une résolution de 150 DPI, idéale pour un affichage sur écran sans perte de netteté."]
        },
        {
          heading: "Procéder par étapes",
          paragraphs: [
            "Appliquez une compression équilibrée et vérifiez une page comportant des mentions en petits caractères.",
            "Si la lecture reste parfaitement fluide, le fichier est prêt à être transmis."
          ],
          tool: { label: "Allégez votre PDF dans le navigateur avec GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Quand privilégier la division du document",
          paragraphs: ["Si le fichier reste trop lourd malgré une compression équilibrée, scindez-le en deux volumes plutôt que d'écraser la qualité jusqu'à l'illisibilité."]
        }
      ]
    },
    "it": {
      title: "Come comprimere un PDF senza renderlo illeggibile",
      description: "Le pagine scansionate costituiscono la quasi totalità del peso di un PDF. Riduci i megabyte a piccoli passi preservando la nitidezza del testo.",
      readingTime: "4 min di lettura",
      tags: ["comprimere PDF", "ridurre peso PDF", "ottimizzare PDF", "documenti"],
      categoryLabel: "PDF",
      quickAnswer: "Usa lo strumento di compressione GainUtility per ottimizzare le immagini incorporate nel PDF. Un documento scansionato da 12 MB scende tipicamente a 4–5 MB rimanendo leggibile.",
      keyTakeaway: "Comprimi solo quanto serve: garantisci prima la leggibilità e riduci il peso a passi controllati.",
      toolCta: { label: "Riduci il tuo PDF sotto il limite di upload senza sacrificare il testo.", toolId: "compress-images-inside-pdf" },
      seoTitle: "Come comprimere un PDF senza perdere qualità | GainUtility",
      seoDescription: "Guida per ridurre le dimensioni dei PDF nel browser mantenendo testi e timbri nitidi, senza condividere file con server esterni.",
      content: [
        {
          paragraphs: ["Molti portali pubblici o di candidatura rifiutano file superiori a 5 MB. Comprimere alla cieca può però sgranare codici fiscali o firme autografe rendendo nullo il documento."]
        },
        {
          heading: "Da dove deriva il peso di un PDF",
          paragraphs: ["Il testo vettoriale occupa pochissimo spazio. Il vero responsabile sono le scansioni ad altissima risoluzione (300 DPI o superiore) inserite nel file."]
        },
        {
          heading: "Regolare la risoluzione effettiva",
          paragraphs: ["Ridurre la risoluzione delle immagini a circa 150 DPI dimezza il peso del documento garantendo una lettura fluida sia su monitor che su smartphone."]
        },
        {
          heading: "Comprimere con metodo",
          paragraphs: [
            "Applica un'ottimizzazione bilanciata e ingrandisci una pagina ricca di dettagli prima dell'invio definitivo.",
            "Se i caratteri restano puliti e senza aloni, hai ottenuto il risultato ottimale."
          ],
          tool: { label: "Comprimi i tuoi PDF nel browser con GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Quando conviene dividere il documento",
          paragraphs: ["Se anche dopo una buona compressione il PDF supera la soglia consentita, valuta di dividerlo in due allegati anziché peggiorare la risoluzione fino a renderlo illeggibile."]
        }
      ]
    },
    "id": {
      title: "Cara Mengompres PDF Tanpa Membuat Teks Tidak Terbaca",
      description: "Halaman pindaian adalah penyebab utama file PDF menjadi besar. Kompres secara terukur untuk memangkas megabyte tanpa mengorbankan ketajaman teks.",
      readingTime: "4 mnt membaca",
      tags: ["kompres PDF", "perkecil PDF", "optimasi dokumen", "privasi"],
      categoryLabel: "PDF",
      quickAnswer: "Gunakan alat kompresi PDF GainUtility untuk mengoptimalkan gambar di dalam dokumen. File pindaian 12 MB biasanya turun menjadi 3–5 MB dan tetap sangat jelas terbaca.",
      keyTakeaway: "Hanya kompres secukupnya: utamakan keterbacaan teks, lalu kurangi ukuran file secara bertahap hingga memenuhi syarat.",
      toolCta: { label: "Perlu mengecilkan PDF agar lolos batas unggah tetapi tetap jelas?", toolId: "compress-images-inside-pdf" },
      seoTitle: "Cara Kompres PDF Tanpa Mengurangi Keterbacaan | GainUtility",
      seoDescription: "Pelajari cara mengecilkan ukuran file PDF di browser dengan hasil teks yang tetap tajam tanpa mengirim dokumen ke server pihak ketiga.",
      content: [
        {
          paragraphs: ["Banyak situs pendaftaran membatasi unggahan berkas maksimal 2 MB atau 5 MB. Mengompres sembarangan bisa membuat angka NIK atau tanda tangan menjadi buram dan berkas ditolak."]
        },
        {
          heading: "Dari mana asal ukuran besar sebuah PDF",
          paragraphs: ["Teks biasa hampir tidak memakan ruang memori. Beban ukuran berasal dari pindaian lembaran kertas yang tersimpan sebagai gambar beresolusi terlampau tinggi."]
        },
        {
          heading: "Menyesuaikan resolusi pindaian",
          paragraphs: ["Menurunkan kerapatan piksel ke sekitar 150 DPI menghemat lebih dari setengah beban file namun tetap terlihat tajam di layar perangkat."]
        },
        {
          heading: "Lakukan kompresi secara bertahap",
          paragraphs: [
            "Pilih tingkat kompresi sedang dan periksa lembaran yang memuat teks bertulisan kecil.",
            "Pastikan semua huruf masih dapat dibaca tanpa keraguan sebelum mengirimkan berkas."
          ],
          tool: { label: "Kecilkan ukuran file PDF di browser dengan GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Kapan sebaiknya membagi file daripada mengompres",
          paragraphs: ["Jika file tetap melebihi batas setelah dikompresi wajar, lebih baik pisahkan dokumen menjadi dua bagian daripada memaksakan kualitas yang merusak tulisan."]
        }
      ]
    }
  },

  "how-to-add-a-watermark-to-a-pdf": {
    "pt-br": {
      title: "Como colocar marca d'água em um PDF no navegador",
      description: "Uma marca d'água deve ser visível sem atrapalhar a leitura. Veja como posicionar textos ou logos em diagonal com opacidade suave.",
      readingTime: "4 min de leitura",
      tags: ["marca d'água PDF", "proteger PDF", "documentos", "segurança"],
      categoryLabel: "PDF",
      quickAnswer: "Abra a ferramenta de marca d'água da GainUtility, digite o texto (ex.: CONFIDENCIAL), escolha posição diagonal e opacidade entre 15% e 25% para proteger o documento sem esconder o conteúdo.",
      keyTakeaway: "Uma boa marca d'água deve ser notada, mas não intrusiva: posição diagonal com baixa opacidade protege sem cobrir os dados.",
      toolCta: { label: "Adicione uma marca d'água a um PDF sem esconder o conteúdo.", toolId: "add-pdf-watermark" },
      seoTitle: "Como adicionar marca d'água a um PDF | GainUtility",
      seoDescription: "Insira marcas d'água de texto ou imagem em documentos PDF no navegador com controle total de transparência e ângulo.",
      content: [
        {
          paragraphs: ["Ao compartilhar minutas contratuais, propostas comerciais ou cópias de documentos pessoais, aplicar uma marca d'água sinaliza o uso restrito e desencoraja o uso indevido."]
        },
        {
          heading: "Marca d'água em texto ou imagem",
          paragraphs: ["Textos como “CÓPIA”, “RASCUNHO” ou “CONFIDENCIAL” são rápidos de aplicar. Para empresas, o logotipo em tom monocromático claro confere proteção institucional."]
        },
        {
          heading: "Posicionamento e opacidade correta",
          paragraphs: [
            "A melhor prática é a orientação diagonal centralizada a 45 graus, com opacidade entre 15% e 25%. Esse ângulo atravessa o texto tornando a remoção manual difícil, enquanto a baixa opacidade mantém a leitura natural."
          ],
          tool: { label: "Aplique marcas d'água no navegador com a GainUtility.", toolId: "add-pdf-watermark" }
        },
        {
          heading: "Passo a passo no navegador",
          paragraphs: ["O processo leva poucos segundos:"],
          steps: [
            "Abra a ferramenta de marca d'água em PDF da GainUtility.",
            "Carregue o documento que deseja sinalizar.",
            "Digite o texto desejado ou importe a imagem da marca.",
            "Ajuste a transparência, tamanho da fonte e rotação.",
            "Baixe o PDF protegido."
          ]
        }
      ]
    },
    "es-mx": {
      title: "Cómo poner una marca de agua a un PDF en el navegador",
      description: "Una marca de agua debe advertir sin entorpecer la lectura. Aprende a colocar texto o logos en diagonal con transparencia sutil.",
      readingTime: "4 min de lectura",
      tags: ["marca de agua PDF", "proteger PDF", "documentos", "seguridad"],
      categoryLabel: "PDF",
      quickAnswer: "Abre la herramienta de marca de agua de GainUtility, introduce el texto (ej. CONFIDENCIAL), selecciona ángulo diagonal y opacidad baja para proteger el archivo sin tapar las letras.",
      keyTakeaway: "La marca de agua debe notarse sin estorbar: la orientación diagonal con opacidad tenue resguarda el archivo sin tapar los datos.",
      toolCta: { label: "Agrega una marca de agua a tu PDF sin ocultar el contenido.", toolId: "add-pdf-watermark" },
      seoTitle: "Cómo poner marca de agua a un PDF | GainUtility",
      seoDescription: "Añade sellos o marcas de agua de texto e imagen a tus archivos PDF en el navegador con control de opacidad y ángulo.",
      content: [
        {
          paragraphs: ["Al enviar borradores de contratos, cotizaciones o copias de identificación oficial, una marca de agua previene usos no autorizados de tu información."]
        },
        {
          heading: "Texto o logotipo como marca",
          paragraphs: ["Frases como “SOLO PARA TRÁMITE”, “BORRADOR” o “CONFIDENCIAL” son inmediatas de insertar y dejan claro el propósito del documento."]
        },
        {
          heading: "Ubicación y nivel de transparencia",
          paragraphs: [
            "Colocar el texto en diagonal a 45 grados con una opacidad del 15% al 20% es el estándar: cruza las líneas de texto dificultando su borrado, pero permite leer el contrato sin molestia."
          ],
          tool: { label: "Añade marcas de agua en tu navegador con GainUtility.", toolId: "add-pdf-watermark" }
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["Protege tus hojas en tres pasos:"],
          steps: [
            "Abre la herramienta de marca de agua de GainUtility.",
            "Carga el documento PDF correspondiente.",
            "Escribe la leyenda o selecciona la imagen del sello.",
            "Modifica la transparencia, tamaño y posición.",
            "Descarga el archivo sellado."
          ]
        }
      ]
    },
    "es-co": {
      title: "Cómo poner una marca de agua a un PDF en el navegador",
      description: "Una marca de agua debe advertir sin entorpecer la lectura. Aprende a colocar texto o logos en diagonal con transparencia sutil.",
      readingTime: "4 min de lectura",
      tags: ["marca de agua PDF", "proteger PDF", "documentos", "seguridad"],
      categoryLabel: "PDF",
      quickAnswer: "Abre la herramienta de marca de agua de GainUtility, introduce el texto (ej. CONFIDENCIAL), selecciona ángulo diagonal y opacidad baja para proteger el archivo sin tapar las letras.",
      keyTakeaway: "La marca de agua debe notarse sin estorbar: la orientación diagonal con opacidad tenue resguarda el archivo sin tapar los datos.",
      toolCta: { label: "Agrega una marca de agua a tu PDF sin ocultar el contenido.", toolId: "add-pdf-watermark" },
      seoTitle: "Cómo poner marca de agua a un PDF | GainUtility",
      seoDescription: "Añade sellos o marcas de agua de texto e imagen a tus archivos PDF en el navegador con control de opacidad y ángulo.",
      content: [
        {
          paragraphs: ["Al enviar borradores de contratos, cotizaciones o copias de identificación oficial, una marca de agua previene usos no autorizados de tu información."]
        },
        {
          heading: "Texto o logotipo como marca",
          paragraphs: ["Frases como “SOLO PARA TRÁMITE”, “BORRADOR” o “CONFIDENCIAL” son inmediatas de insertar y dejan claro el propósito del documento."]
        },
        {
          heading: "Ubicación y nivel de transparencia",
          paragraphs: [
            "Colocar el texto en diagonal a 45 grados con una opacidad del 15% al 20% es el estándar: cruza las líneas de texto dificultando su borrado, pero permite leer el contrato sin molestia."
          ],
          tool: { label: "Añade marcas de agua en tu navegador con GainUtility.", toolId: "add-pdf-watermark" }
        },
        {
          heading: "Paso a paso en tu navegador",
          paragraphs: ["Protege tus hojas en tres pasos:"],
          steps: [
            "Abre la herramienta de marca de agua de GainUtility.",
            "Carga el documento PDF correspondiente.",
            "Escribe la leyenda o selecciona la imagen del sello.",
            "Modifica la transparencia, tamaño y posición.",
            "Descarga el archivo sellado."
          ]
        }
      ]
    },
    "de": {
      title: "Wasserzeichen in PDF-Dateien im Browser einfügen",
      description: "Ein gutes Wasserzeichen schützt, ohne beim Lesen zu stören. So platzieren Sie Texte oder Logos dezent diagonal im Dokument.",
      readingTime: "4 Min. Lesezeit",
      tags: ["PDF Wasserzeichen", "PDF schützen", "Dokumente", "Sicherheit"],
      categoryLabel: "PDF",
      quickAnswer: "Geben Sie im GainUtility Wasserzeichen-Tool den Hinweistext ein (z. B. VERTRAULICH), wählen Sie eine diagonale Ausrichtung und eine geringe Deckkraft von 15–20 %, um den Text voll lesbar zu halten.",
      keyTakeaway: "Ein Wasserzeichen soll auffallen, aber nicht stören: Eine diagonale Platzierung mit geringer Deckkraft markiert die Datei, ohne Inhalte zu verdecken.",
      toolCta: { label: "Wasserzeichen zu einem PDF hinzufügen, ohne Inhalte zu überdecken.", toolId: "add-pdf-watermark" },
      seoTitle: "Wasserzeichen in PDF einfügen | GainUtility",
      seoDescription: "Bringen Sie Text- oder Logo-Wasserzeichen direkt im Browser auf Ihren PDF-Dateien an. Mit präziser Deckkraft und Drehwinkel.",
      content: [
        {
          paragraphs: ["Bei Vertragsentwürfen, internen Kalkulationen oder Ausweiskopien signalisiert ein Wasserzeichen sofort, dass das Dokument nicht für Dritte oder für den offiziellen Umlauf bestimmt ist."]
        },
        {
          heading: "Text- oder Bildwasserzeichen",
          paragraphs: ["Typische Hinweise wie „ENTWURF“, „KOPIE“ oder „NUR ZUR PRÜFUNG“ lassen sich sofort auf allen Seiten gleichzeitig anbringen."]
        },
        {
          heading: "Die richtige Positionierung und Deckkraft",
          paragraphs: [
            "Bewährt hat sich eine diagonale Ausrichtung mit ca. 45 Grad und einer Transparenz von 15 bis 20 %. So liegt der Text quer über dem Inhalt und lässt sich kaum wegschneiden, ohne das Auge beim Lesen zu behindern."
          ],
          tool: { label: "PDF-Wasserzeichen jetzt im Browser erstellen mit GainUtility.", toolId: "add-pdf-watermark" }
        },
        {
          heading: "Schritt für Schritt im Browser",
          paragraphs: ["In drei schnellen Schritten geschützt:"],
          steps: [
            "Starten Sie das GainUtility Wasserzeichen-Tool.",
            "Laden Sie Ihr PDF-Dokument hoch.",
            "Tippen Sie den Hinweistext ein und wählen Sie Schriftgröße sowie Winkel.",
            "Passen Sie die Deckkraft nach Wunsch an.",
            "Laden Sie das geschützte PDF herunter."
          ]
        }
      ]
    },
    "fr": {
      title: "Comment ajouter un filigrane sur un PDF dans le navigateur",
      description: "Un filigrane doit être visible sans gêner la lecture. Découvrez comment positionner du texte ou un logo en diagonale avec une transparence subtile.",
      readingTime: "4 min de lecture",
      tags: ["filigrane PDF", "protéger PDF", "documents", "sécurité"],
      categoryLabel: "PDF",
      quickAnswer: "Ouvrez l'outil de filigrane GainUtility, écrivez votre texte (ex. CONFIDENTIEL), sélectionnez une orientation oblique et une opacité faible pour sécuriser le document sans en masquer les lignes.",
      keyTakeaway: "Un bon filigrane doit se voir sans s'imposer : une disposition diagonale à faible opacité protège le fichier sans dissimuler les données.",
      toolCta: { label: "Ajoutez un filigrane à votre PDF sans cacher le contenu.", toolId: "add-pdf-watermark" },
      seoTitle: "Ajouter un filigrane sur un PDF | GainUtility",
      seoDescription: "Insérez des filigranes texte ou image sur vos PDF dans le navigateur avec contrôle fin de la transparence et de l'orientation.",
      content: [
        {
          paragraphs: ["Pour transmettre une version préliminaire de contrat, un devis ou une copie de pièce d'identité, l'apposition d'un filigrane dissuade toute utilisation frauduleuse."]
        },
        {
          heading: "Filigrane textuel ou graphique",
          paragraphs: ["Des mentions comme « SPÉCIMEN », « BROUILLON » ou « USAGE EXCLUSIF » s'appliquent immédiatement sur l'ensemble des pages."]
        },
        {
          heading: "Position et transparence optimales",
          paragraphs: [
            "La disposition oblique à 45° avec une opacité de 15 % à 20 % représente l'équilibre idéal : elle traverse le texte pour empêcher un effacement facile tout en maintenant la lecture fluide."
          ],
          tool: { label: "Ajoutez un filigrane en ligne avec GainUtility.", toolId: "add-pdf-watermark" }
        },
        {
          heading: "La marche à suivre",
          paragraphs: ["Une manipulation rapide et efficace :"],
          steps: [
            "Ouvrez l'outil de filigrane PDF GainUtility.",
            "Déposez votre document.",
            "Saisissez le texte du filigrane.",
            "Réglez l'inclinaison et la transparence.",
            "Téléchargez le document filigrané."
          ]
        }
      ]
    },
    "it": {
      title: "Come aggiungere una filigrana a un PDF nel browser",
      description: "Una filigrana deve essere visibile senza ostacolare la lettura. Ecco come inserire testo o loghi in diagonale con trasparenza elegante.",
      readingTime: "4 min di lettura",
      tags: ["filigrana PDF", "watermark PDF", "documenti", "sicurezza"],
      categoryLabel: "PDF",
      quickAnswer: "Usa lo strumento di filigrana di GainUtility, inserisci la dicitura desiderata (es. RISERVATO), imposta una rotazione diagonale e un'opacità leggera per marcare il documento senza coprire il testo.",
      keyTakeaway: "La filigrana ideale si nota ma non disturba: l'inclinazione diagonale a bassa opacità protegge il file senza oscurare i contenuti.",
      toolCta: { label: "Aggiungi una filigrana a un PDF senza nascondere il contenuto.", toolId: "add-pdf-watermark" },
      seoTitle: "Come mettere una filigrana su un PDF | GainUtility",
      seoDescription: "Applica timbri o filigrane di testo e logo sui tuoi file PDF nel browser con controllo accurato di opacità e angolazione.",
      content: [
        {
          paragraphs: ["Quando si condividono bozze contrattuali, piani tariffari o copie di documenti personali, inserire un watermark chiarisce subito che il documento non è definitivo o è destinato a un uso circoscritto."]
        },
        {
          heading: "Filigrana testuale o con logo",
          paragraphs: ["Parole come “BOZZA”, “COPIA CONFORME” o “RISERVATO” possono essere impresse su tutti i fogli in un solo passaggio."]
        },
        {
          heading: "Inclinazione e livello di trasparenza",
          paragraphs: [
            "L'orientamento diagonale a 45 gradi con opacità tra il 15% e il 20% è il formato ottimale: attraversa il testo impedendo ritagli furbi, lasciando ogni riga facilmente leggibile."
          ],
          tool: { label: "Inserisci filigrane nei tuoi PDF con GainUtility.", toolId: "add-pdf-watermark" }
        },
        {
          heading: "Guida passo passo",
          paragraphs: ["Tutto pronto in pochi istanti:"],
          steps: [
            "Apri lo strumento filigrana PDF di GainUtility.",
            "Importa il documento da proteggere.",
            "Digita il testo o seleziona l'immagine.",
            "Regola trasparenza, corpo del testo e angolazione.",
            "Scarica il PDF con la filigrana applicata."
          ]
        }
      ]
    },
    "id": {
      title: "Cara Menambahkan Watermark ke File PDF di Browser",
      description: "Watermark yang baik harus terlihat tanpa mengganggu keterbacaan. Begini cara menaruh teks atau logo secara diagonal dengan transparansi pas.",
      readingTime: "4 mnt membaca",
      tags: ["watermark PDF", "tanda air PDF", "dokumen", "keamanan"],
      categoryLabel: "PDF",
      quickAnswer: "Buka alat watermark PDF GainUtility, ketik teks (misal: RAHASIA / DRAF), atur posisi diagonal dan opasitas rendah (15–20%) agar dokumen terlindungi tanpa menutupi isi tulisan.",
      keyTakeaway: "Watermark harus terlihat tapi tidak menutupi: posisi diagonal dengan transparansi halus menandai dokumen tanpa menyulitkan pembaca.",
      toolCta: { label: "Tambahkan watermark ke PDF tanpa menutupi isi dokumen.", toolId: "add-pdf-watermark" },
      seoTitle: "Cara Menambahkan Watermark ke PDF | GainUtility",
      seoDescription: "Beri tanda air berupa teks atau logo pada dokumen PDF langsung di browser dengan kontrol transparansi dan rotasi yang presisi.",
      content: [
        {
          paragraphs: ["Saat mengirimkan draf perjanjian kerja, proposal bisnis, atau salinan KTP, memberi tanda air sangat penting untuk mencegah penyalahgunaan dokumen."]
        },
        {
          heading: "Watermark berupa teks atau gambar",
          paragraphs: ["Teks penanda seperti “DRAF”, “SALINAN”, atau “KHUSUS PENDAFTARAN” sangat efektif dipasang melintasi seluruh halaman."]
        },
        {
          heading: "Posisi diagonal dan tingkat transparansi",
          paragraphs: [
            "Posisi miring 45 derajat dengan opasitas 15% hingga 20% adalah standar terbaik: teks watermark melintasi tulisan dokumen sehingga sulit dihapus, namun tulisan di bawahnya tetap terbaca jelas."
          ],
          tool: { label: "Beri watermark pada dokumen PDF di GainUtility.", toolId: "add-pdf-watermark" }
        },
        {
          heading: "Langkah mudah di browser",
          paragraphs: ["Hanya butuh tiga langkah singkat:"],
          steps: [
            "Buka alat watermark PDF GainUtility.",
            "Pilih dokumen PDF yang ingin diberi tanda.",
            "Ketik teks penanda yang Anda inginkan.",
            "Atur sudut kemiringan dan transparansi.",
            "Unduh dokumen PDF yang sudah terlindungi."
          ]
        }
      ]
    }
  },

  "fix-pdf-too-big-to-upload": {
    "pt-br": {
      title: "Como resolver um PDF grande demais para enviar em formulários",
      description: "Descubra o limite de tamanho do formulário, comprima as imagens internas em uma etapa equilibrada e remova páginas irrelevantes antes de forçar a qualidade.",
      readingTime: "5 min de leitura",
      tags: ["PDF muito grande", "limite de upload", "otimização", "documentos"],
      categoryLabel: "PDF",
      quickAnswer: "Verifique o limite do site (ex.: 2 MB ou 5 MB), remova páginas dispensáveis primeiro com o divisor e aplique compressão moderada de imagens. O resultado atende ao requisito sem perder nitidez.",
      keyTakeaway: "Trabalhe de trás para frente: anote o limite do portal, encontre as páginas pesadas, comprima com moderação e corte páginas antes de arruinar a qualidade.",
      toolCta: { label: "Coloque seu PDF dentro do limite de envio — legível e sem borrões.", toolId: "compress-images-inside-pdf" },
      seoTitle: "Como diminuir um PDF grande demais para upload | GainUtility",
      seoDescription: "Soluções práticas para quando um PDF ultrapassa o limite de upload: corte de páginas desnecessárias e compressão eficiente no navegador.",
      content: [
        {
          paragraphs: ["A mensagem de erro é clássica: “O arquivo excede o tamanho máximo de 2 MB”. Você precisa submeter um edital ou formulário urgente e o arquivo foi rejeitado. Veja como resolver em minutos."]
        },
        {
          heading: "Leia o limite exato antes de alterar o arquivo",
          paragraphs: ["Saber se a meta é 10 MB, 5 MB ou 1 MB dita sua estratégia. Para ir de 12 MB para 4 MB, basta uma compressão padrão de imagens. Para atingir 800 KB em um documento longo, será necessário remover páginas."]
        },
        {
          heading: "Descubra o que está pesando no documento",
          paragraphs: ["Abra o documento e procure páginas digitalizadas ou fotos coloridas. Em um PDF de 20 páginas, frequentemente duas ou três páginas com fotos escaneadas representam 90% do tamanho total do arquivo."]
        },
        {
          heading: "Reduza em passos graduais e confira o resultado",
          paragraphs: [
            "Comprima as imagens internas no navegador. Não reduza a resolução abaixo de 150 DPI na primeira tentativa para não deixar o texto borrado."
          ],
          tool: { label: "Otimize arquivos PDF no navegador com GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Corte páginas extras antes de forçar a compressão",
          paragraphs: ["Páginas em branco, folhas de instruções ou capas irrelevantes aumentam o peso. Use o divisor de PDF para extrair estritamente as folhas exigidas antes de tentar espremer o arquivo."]
        }
      ]
    },
    "es-mx": {
      title: "Cómo solucionar un PDF demasiado grande para subir a un portal",
      description: "Averigua el límite del formulario, comprime las imágenes internas en una etapa controlada y descarta páginas sobrantes antes de sacrificar calidad.",
      readingTime: "5 min de lectura",
      tags: ["PDF muy grande", "límite de subida", "optimización", "documentos"],
      categoryLabel: "PDF",
      quickAnswer: "Revisa el límite en MB permitido, elimina las páginas prescindibles con el divisor y aplica una compresión moderada de imágenes para cumplir el requisito sin afectar la lectura.",
      keyTakeaway: "Trabaja a partir del límite: anota el peso máximo, ubica las páginas pesadas, comprime con control y recorta hojas antes de arruinar la nitidez.",
      toolCta: { label: "Ajusta tu PDF al límite de carga de cualquier portal oficial.", toolId: "compress-images-inside-pdf" },
      seoTitle: "Cómo reducir un PDF demasiado pesado para subir | GainUtility",
      seoDescription: "Aprende a solucionar el error de PDF demasiado pesado en formularios web: descarte de páginas innecesarias y compresión limpia en el navegador.",
      content: [
        {
          paragraphs: ["El temido aviso: “El archivo excede el tamaño máximo permitido de 2 MB” surge en el momento más inoportuno. Aquí te mostramos cómo reducirlo sin volverlo ilegible."]
        },
        {
          heading: "Revisa la cuota exacta antes de tocar el archivo",
          paragraphs: ["Conocer si el límite es de 10 MB, 5 MB o 2 MB define el camino. Bajar de 8 MB a 4 MB suele resolverse con compresión directa de imágenes; llegar a 1 MB en un archivo largo exige podar páginas."]
        },
        {
          heading: "Identifica qué elementos engordan el PDF",
          paragraphs: ["Revisa el documento: las hojas con firmas escaneadas o fotos a color son las responsables de casi todo el peso del archivo."]
        },
        {
          heading: "Comprime en pasos controlados",
          paragraphs: [
            "Aplica una compresión prudente a 150 DPI para que las cifras y firmas no se pixelen al abrirse en pantalla."
          ],
          tool: { label: "Reduce el tamaño de tus PDFs con GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Elimina páginas prescindibles antes de comprimir más",
          paragraphs: ["Hojas de portada vacías, anexos que no te pidieron o páginas finales en blanco pueden recortarse con la herramienta de dividir PDF para ganar espacio de inmediato."]
        }
      ]
    },
    "es-co": {
      title: "Cómo solucionar un PDF demasiado grande para subir a un portal",
      description: "Averigua el límite del formulario, comprime las imágenes internas en una etapa controlada y descarta páginas sobrantes antes de sacrificar calidad.",
      readingTime: "5 min de lectura",
      tags: ["PDF muy grande", "límite de subida", "optimización", "documentos"],
      categoryLabel: "PDF",
      quickAnswer: "Revisa el límite en MB permitido, elimina las páginas prescindibles con el divisor y aplica una compresión moderada de imágenes para cumplir el requisito sin afectar la lectura.",
      keyTakeaway: "Trabaja a partir del límite: anota el peso máximo, ubica las páginas pesadas, comprime con control y recorta hojas antes de arruinar la nitidez.",
      toolCta: { label: "Ajusta tu PDF al límite de carga de cualquier portal oficial.", toolId: "compress-images-inside-pdf" },
      seoTitle: "Cómo reducir un PDF demasiado pesado para subir | GainUtility",
      seoDescription: "Aprende a solucionar el error de PDF demasiado pesado en formularios web: descarte de páginas innecesarias y compresión limpia en el navegador.",
      content: [
        {
          paragraphs: ["El temido aviso: “El archivo excede el tamaño máximo permitido de 2 MB” surge en el momento más inoportuno. Aquí te mostramos cómo reducirlo sin volverlo ilegible."]
        },
        {
          heading: "Revisa la cuota exacta antes de tocar el archivo",
          paragraphs: ["Conocer si el límite es de 10 MB, 5 MB o 2 MB define el camino. Bajar de 8 MB a 4 MB suele resolverse con compresión directa de imágenes; llegar a 1 MB en un archivo largo exige podar páginas."]
        },
        {
          heading: "Identifica qué elementos engordan el PDF",
          paragraphs: ["Revisa el documento: las hojas con firmas escaneadas o fotos a color son las responsables de casi todo el peso del archivo."]
        },
        {
          heading: "Comprime en pasos controlados",
          paragraphs: [
            "Aplica una compresión prudente a 150 DPI para que las cifras y firmas no se pixelen al abrirse en pantalla."
          ],
          tool: { label: "Reduce el tamaño de tus PDFs con GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Elimina páginas prescindibles antes de comprimir más",
          paragraphs: ["Hojas de portada vacías, anexos que no te pidieron o páginas finales en blanco pueden recortarse con la herramienta de dividir PDF para ganar espacio de inmediato."]
        }
      ]
    },
    "de": {
      title: "PDF zu groß für den Upload: So lösen Sie das Problem sofort",
      description: "Prüfen Sie das Limit des Portals, optimieren Sie eingebettete Bilder kontrolliert und entfernen Sie überflüssige Seiten, bevor Sie Schriften ruinieren.",
      readingTime: "5 Min. Lesezeit",
      tags: ["PDF zu groß", "Upload Limit", "PDF verkleinern", "Dokumente"],
      categoryLabel: "PDF",
      quickAnswer: "Notieren Sie die geforderte Maximalgröße, trennen Sie unnötige Seiten mit dem PDF-Teiler ab und komprimieren Sie die Bildauflösung moderat, um den Upload erfolgreich abzuschließen.",
      keyTakeaway: "Vom Ziel her denken: Limit prüfen, Datenfresser finden, gezielt komprimieren und unnötige Seiten löschen, statt die Lesbarkeit zu zerstören.",
      toolCta: { label: "PDF unter ein Upload-Limit bringen — lesbar und akzeptiert.", toolId: "compress-images-inside-pdf" },
      seoTitle: "PDF zu groß für den Upload? Schnelle Lösung | GainUtility",
      seoDescription: "Praktische Anleitung für abgelehnte PDF-Uploads: Unnötige Seiten entfernen, Bilder optimieren und Grenzwerte im Browser einhalten.",
      content: [
        {
          paragraphs: ["„Die Datei überschreitet die maximale Größe von 2 MB“ — diese Fehlermeldung taucht meist kurz vor Bewerbungs- oder Abgabefristen auf. So beheben Sie das Problem gezielt."]
        },
        {
          heading: "Grenzwerte genau prüfen",
          paragraphs: ["Liegt das Limit bei 10 MB, 5 MB oder 1 MB? Von 8 MB auf 4 MB reicht meist eine Bildoptimierung. Unter 1 MB müssen fast immer überflüssige Seiten entfernt werden."]
        },
        {
          heading: "Die Datenfresser im PDF aufspüren",
          paragraphs: ["Oft sind es zwei oder drei hochauflösende Scans von Zeugnissen oder Ausweisen, die für 90 % der Gesamtgröße verantwortlich sind."]
        },
        {
          heading: "Kontrolliert komprimieren",
          paragraphs: [
            "Wählen Sie eine moderate Komprimierung, damit Schriften und Stempel scharf gezeichnet bleiben."
          ],
          tool: { label: "PDFs im Browser an Upload-Grenzen anpassen mit GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Überflüssige Seiten herausschneiden",
          paragraphs: ["Leere Abschlussseiten, Deckblätter oder allgemeine Richtlinien kosten wertvolle Kilobytes. Nutzen Sie den PDF-Teiler, um das Dokument auf das geforderte Mindestmaß zu kürzen."]
        }
      ]
    },
    "fr": {
      title: "Comment résoudre le problème d'un PDF trop lourd pour être envoyé",
      description: "Repérez la limite imposée par le formulaire, compressez les visuels de façon mesurée et supprimez les pages inutiles avant d'écraser la qualité.",
      readingTime: "5 min de lecture",
      tags: ["PDF trop lourd", "limite envoi", "optimiser PDF", "documents"],
      categoryLabel: "PDF",
      quickAnswer: "Relevez la taille maximale admise en Mo, supprimez les pages accessoires grâce au découpage et appliquez une compression d'image équilibrée pour respecter le plafond.",
      keyTakeaway: "Partez de la limite imposée : identifiez les pages lourdes, compressez avec mesure et retranchez les feuillets superflus.",
      toolCta: { label: "Ramenez un PDF sous le plafond d'envoi — lisible et conforme.", toolId: "compress-images-inside-pdf" },
      seoTitle: "PDF trop lourd pour l'envoi ? Solutions rapides | GainUtility",
      seoDescription: "Découvrez comment débloquer l'envoi d'un PDF trop volumineux : suppression de pages superflues et compression maîtrisée dans le navigateur.",
      content: [
        {
          paragraphs: ["Le message d'erreur est bien connu : « Votre fichier dépasse la taille maximale autorisée de 2 Mo ». Voici la démarche logique pour débloquer votre démarche sans perdre en clarté."]
        },
        {
          heading: "Identifier le plafond exact",
          paragraphs: ["Connaître la limite cible (10 Mo, 5 Mo ou 1 Mo) oriente la méthode. Passer de 8 Mo à 4 Mo se fait par simple optimisation d'image ; atteindre 1 Mo impose souvent de supprimer des pages."]
        },
        {
          heading: "Localiser les pages les plus lourdes",
          paragraphs: ["Ce sont presque toujours les feuillets contenant des photos d'identité ou des scans couleur qui alourdissent démesurément l'ensemble."]
        },
        {
          heading: "Compresser avec discernement",
          paragraphs: [
            "Privilégiez une compression à 150 DPI pour préserver la netteté des signatures et mentions légales."
          ],
          tool: { label: "Compressez vos fichiers PDF dans le navigateur avec GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Retrancher les pages superflues",
          paragraphs: ["Pages blanches en fin de document, intercalaires ou notices annexes : supprimez-les avec l'outil de division de PDF pour gagner immédiatement de précieux mégaoctets."]
        }
      ]
    },
    "it": {
      title: "Come risolvere un file PDF troppo pesante da caricare online",
      description: "Verifica il limite del portale, comprimi le immagini interne a piccoli passi ed elimina le pagine superflue prima di degradare la qualità.",
      readingTime: "5 min di lettura",
      tags: ["PDF troppo grande", "limite upload", "ottimizzare PDF", "documenti"],
      categoryLabel: "PDF",
      quickAnswer: "Controlla il limite in MB richiesto, rimuovi le pagine inutili con lo strumento di divisione e applica una compressione calibrata per inviare il file senza intoppi.",
      keyTakeaway: "Parti dal requisito: segnati il limite, individua le pagine pesanti, comprimi in modo mirato e taglia le pagine inutili.",
      toolCta: { label: "Porta il tuo PDF sotto il limite consentito mantenendo la nitidezza.", toolId: "compress-images-inside-pdf" },
      seoTitle: "Come ridurre un PDF troppo pesante per l'upload | GainUtility",
      seoDescription: "Risolvi l'errore di file PDF troppo grande nei moduli web: taglio delle pagine in eccesso e compressione efficiente nel browser.",
      content: [
        {
          paragraphs: ["Il messaggio «Il file supera la dimensione massima consentita di 2 MB» compare spesso al momento di inviare una domanda urgente. Ecco come intervenire rapidamente."]
        },
        {
          heading: "Controlla la soglia esatta richiesta",
          paragraphs: ["Sapere se il traguardo è 10 MB, 5 MB o 1 MB determina la strategia. Passare da 8 MB a 4 MB richiede solo compressione immagini; scendere sotto 1 MB richiede di eliminare fogli non indispensabili."]
        },
        {
          heading: "Scopri cosa appesantisce il documento",
          paragraphs: ["In un PDF di 15 pagine, spesso solo una o due scansioni a colori ad altissima risoluzione generano l'85% del peso complessivo."]
        },
        {
          heading: "Riduci le dimensioni per gradi",
          paragraphs: [
            "Applica una compressione moderata preservando circa 150 DPI per non compromettere la leggibilità di timbri e date."
          ],
          tool: { label: "Ottimizza i PDF nel browser con GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Elimina le pagine non richieste prima di comprimere oltre",
          paragraphs: ["Pagine vuote, informative sulla privacy ripetute o copertine inutili possono essere rimosse con il divisore PDF per rientrare subito nei limiti."]
        }
      ]
    },
    "id": {
      title: "Cara Mengatasi File PDF Terlalu Besar untuk Diunggah",
      description: "Cek batas ukuran formulir, optimalkan gambar pindaian secara terukur, dan buang halaman yang tidak diperlukan sebelum mengorbankan kualitas tulisan.",
      readingTime: "5 mnt membaca",
      tags: ["PDF terlalu besar", "batas unggah", "kompres berkas", "dokumen"],
      categoryLabel: "PDF",
      quickAnswer: "Catat batas MB yang diminta situs, hapus lembaran yang tidak perlu dengan pemisah PDF, lalu kompres gambar secukupnya agar berkas lolos unggah dan tetap terbaca.",
      keyTakeaway: "Mulai dari batas yang ditentukan: ketahui batas MB, cari halaman yang berat, kompres terukur, dan hapus halaman yang tidak perlu.",
      toolCta: { label: "Sesuaikan PDF Anda dengan batas unggah — tetap tajam dan jelas.", toolId: "compress-images-inside-pdf" },
      seoTitle: "Cara Mengecilkan PDF Terlalu Besar untuk Unggah | GainUtility",
      seoDescription: "Solusi cepat mengatasi error PDF terlalu besar di formulir web: buang halaman berlebih dan optimalkan resolusi langsung di browser.",
      content: [
        {
          paragraphs: ["Pemberitahuan error “Ukuran file melebihi batas maksimal 2 MB” sering muncul saat Anda sedang terburu-buru mendaftar online. Begini langkah praktis mengatasinya."]
        },
        {
          heading: "Cek batas ukuran file yang diwajibkan",
          paragraphs: ["Mengetahui apakah batasnya 5 MB, 2 MB, atau 1 MB sangat penting. Menurunkan ukuran dari 8 MB ke 4 MB cukup dengan kompresi biasa, namun mencapai di bawah 1 MB butuh menghapus halaman yang tidak penting."]
        },
        {
          heading: "Cari tahu halaman mana yang paling membebani",
          paragraphs: ["Di dalam berkas tebal, biasanya hanya satu atau dua lembar foto pindaian berwarna yang menyumbang 80% dari total ukuran file."]
        },
        {
          heading: "Lakukan kompresi secara terukur",
          paragraphs: [
            "Terapkan kompresi moderat sekitar 150 DPI agar tanda tangan dan cap stempel tetap terbaca dengan jelas saat diperbesar."
          ],
          tool: { label: "Optimasi file PDF di browser dengan GainUtility.", toolId: "compress-images-inside-pdf" }
        },
        {
          heading: "Buang lembaran lampiran yang tidak diminta",
          paragraphs: ["Lembar petunjuk, halaman kosong, atau lampiran tambahan yang tidak disyaratkan dapat dibuang menggunakan pemisah PDF untuk memangkas ukuran seketika."]
        }
      ]
    }
  }
};
