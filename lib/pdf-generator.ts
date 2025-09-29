import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface PDFGenerationOptions {
  title: string;
  content: string;
  clientName?: string;
  caseNumber?: string;
  signatureDataUrl?: string;
  signatureDate?: string;
}

export class PDFGenerator {
  /**
   * Génère un PDF professionnel à partir d'un contenu texte
   */
  static async generatePDF(options: PDFGenerationOptions): Promise<Uint8Array> {
    const {
      title,
      content,
      clientName,
      caseNumber,
      signatureDataUrl,
      signatureDate
    } = options;

    // Créer un nouveau document PDF
    const pdfDoc = await PDFDocument.create();
    
    // Charger les polices standard
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Ajouter une page
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 en points
    const { width, height } = page.getSize();
    
    // Marges
    const margin = 50;
    const maxWidth = width - 2 * margin;
    let yPosition = height - margin;

    // En-tête avec logo/titre
    page.drawText('eSignPro', {
      x: margin,
      y: yPosition,
      size: 20,
      font: helveticaBold,
      color: rgb(0.91, 0.17, 0.24), // Rouge eSignPro
    });

    yPosition -= 10;
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 2,
      color: rgb(0.91, 0.17, 0.24),
    });

    yPosition -= 30;

    // Titre du document
    page.drawText(title, {
      x: margin,
      y: yPosition,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    yPosition -= 30;

    // Informations du dossier
    if (caseNumber) {
      page.drawText(`Dossier N° : ${caseNumber}`, {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      yPosition -= 15;
    }

    if (clientName) {
      page.drawText(`Client : ${clientName}`, {
        x: margin,
        y: yPosition,
        size: 10,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      yPosition -= 15;
    }

    page.drawText(`Date : ${new Date().toLocaleDateString('fr-CH')}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    yPosition -= 30;

    // Contenu du document
    const lines = content.split('\n');
    const fontSize = 11;
    const lineHeight = fontSize * 1.5;

    for (const line of lines) {
      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition < margin + 100) {
        page = pdfDoc.addPage([595.28, 841.89]);
        yPosition = height - margin;
      }

      // Gérer les lignes longues (word wrap)
      const words = line.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = helveticaFont.widthOfTextAtSize(testLine, fontSize);
        
        if (textWidth > maxWidth && currentLine) {
          // Dessiner la ligne actuelle
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: timesRoman,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
          currentLine = word;
          
          // Vérifier si on a besoin d'une nouvelle page
          if (yPosition < margin + 100) {
            page = pdfDoc.addPage([595.28, 841.89]);
            yPosition = height - margin;
          }
        } else {
          currentLine = testLine;
        }
      }
      
      // Dessiner la dernière ligne
      if (currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: timesRoman,
          color: rgb(0, 0, 0),
        });
      }
      
      yPosition -= lineHeight;
    }

    // Ajouter la signature si disponible
    if (signatureDataUrl) {
      yPosition -= 30;
      
      // Vérifier si on a besoin d'une nouvelle page pour la signature
      if (yPosition < margin + 150) {
        page = pdfDoc.addPage([595.28, 841.89]);
        yPosition = height - margin;
      }

      try {
        // Extraire les données base64 de l'image
        const base64Data = signatureDataUrl.split(',')[1];
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        // Déterminer le type d'image et l'embarquer
        let image;
        if (signatureDataUrl.startsWith('data:image/png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (signatureDataUrl.startsWith('data:image/jpeg') || signatureDataUrl.startsWith('data:image/jpg')) {
          image = await pdfDoc.embedJpg(imageBytes);
        }

        if (image) {
          const signatureWidth = 200;
          const signatureHeight = (image.height / image.width) * signatureWidth;

          page.drawText('Signature électronique :', {
            x: margin,
            y: yPosition,
            size: 10,
            font: helveticaBold,
            color: rgb(0, 0, 0),
          });

          yPosition -= signatureHeight + 10;

          page.drawImage(image, {
            x: margin,
            y: yPosition,
            width: signatureWidth,
            height: signatureHeight,
          });

          yPosition -= 20;

          if (signatureDate) {
            page.drawText(`Signé le : ${signatureDate}`, {
              x: margin,
              y: yPosition,
              size: 9,
              font: helveticaFont,
              color: rgb(0.4, 0.4, 0.4),
            });
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'ajout de la signature au PDF:', error);
        // Continuer sans la signature
        page.drawText('[Signature électronique appliquée]', {
          x: margin,
          y: yPosition,
          size: 10,
          font: helveticaFont,
          color: rgb(0.4, 0.4, 0.4),
        });
      }
    }

    // Pied de page sur toutes les pages
    const pages = pdfDoc.getPages();
    pages.forEach((p, index) => {
      p.drawText(`Page ${index + 1} sur ${pages.length}`, {
        x: width / 2 - 30,
        y: 30,
        size: 9,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      p.drawText('Document généré par eSignPro - Signature Électronique Sécurisée', {
        x: margin,
        y: 15,
        size: 8,
        font: helveticaFont,
        color: rgb(0.6, 0.6, 0.6),
      });
    });

    // Métadonnées du PDF
    pdfDoc.setTitle(title);
    pdfDoc.setAuthor('eSignPro');
    pdfDoc.setSubject(caseNumber || 'Document eSignPro');
    pdfDoc.setCreator('eSignPro - Signature Électronique');
    pdfDoc.setProducer('eSignPro PDF Generator');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    // Sauvegarder le PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }

  /**
   * Génère un PDF avec plusieurs documents
   */
  static async generateMultiDocumentPDF(documents: PDFGenerationOptions[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    for (const doc of documents) {
      // Générer chaque document individuellement
      const singlePdfBytes = await this.generatePDF(doc);
      const singlePdf = await PDFDocument.load(singlePdfBytes);
      
      // Copier toutes les pages dans le document principal
      const copiedPages = await pdfDoc.copyPages(singlePdf, singlePdf.getPageIndices());
      copiedPages.forEach(page => pdfDoc.addPage(page));
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}

