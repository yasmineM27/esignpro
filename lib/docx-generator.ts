import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel,
  UnderlineType,
  BorderStyle,
  WidthType,
  Table,
  TableRow,
  TableCell,
  SectionType,
  PageBreak
} from 'docx'

interface PersonInfo {
  nom: string
  prenom: string
  dateNaissance: string
  numeroPolice: string
}

interface ClientData {
  // Informations principales du client
  nom: string
  prenom: string
  dateNaissance: string
  numeroPolice: string
  email: string
  
  // Adresse séparée
  adresse: string
  npa: string
  ville: string
  
  // Type de formulaire et destinataire
  typeFormulaire: 'resiliation' | 'souscription' | 'modification' | 'autre'
  destinataire: string
  lieuDate: string
  
  // Personnes supplémentaires (famille)
  personnes: PersonInfo[]
  
  // Dates spécifiques
  dateLamal: string
  dateLCA: string
  
  // Champs calculés/legacy (pour compatibilité)
  nomPrenom: string
  npaVille: string
}

export class DocxGenerator {
  /**
   * Génère un document Word (.docx) final avec signature intégrée
   */
  static async generateFinalSignedDocument(clientData: any): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              },
            },
          },
          children: [
            // En-tête avec informations du dossier
            new Paragraph({
              children: [
                new TextRun({
                  text: `DOCUMENT FINAL - DOSSIER ${clientData.caseNumber}`,
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Date de génération
            new Paragraph({
              children: [
                new TextRun({
                  text: `Généré le ${new Date().toLocaleDateString('fr-CH')} à ${new Date().toLocaleTimeString('fr-CH')}`,
                  italics: true,
                  size: 20,
                }),
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 600 },
            }),

            // Informations client
            new Paragraph({
              children: [
                new TextRun({
                  text: "INFORMATIONS CLIENT",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Nom et Prénom: ${clientData.nom} ${clientData.prenom}`,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Adresse: ${clientData.adresse}, ${clientData.npa} ${clientData.ville}`,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Date de naissance: ${clientData.dateNaissance}`,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Numéro de police: ${clientData.numeroPolice}`,
                  size: 24,
                }),
              ],
              spacing: { after: 400 },
            }),

            // Type de formulaire
            new Paragraph({
              children: [
                new TextRun({
                  text: "TYPE DE DEMANDE",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: clientData.typeFormulaire || "Résiliation d'assurance",
                  size: 24,
                }),
              ],
              spacing: { after: 400 },
            }),

            // Documents fournis
            new Paragraph({
              children: [
                new TextRun({
                  text: "DOCUMENTS FOURNIS",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `✓ Pièce d'identité (${clientData.documentsAttached?.identityDocuments || 0} document${(clientData.documentsAttached?.identityDocuments || 0) > 1 ? 's' : ''})`,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `✓ Contrats d'assurance (${clientData.documentsAttached?.insuranceContracts || 0} document${(clientData.documentsAttached?.insuranceContracts || 0) > 1 ? 's' : ''})`,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "✓ Signature électronique",
                  size: 24,
                }),
              ],
              spacing: { after: 400 },
            }),

            // Signature
            new Paragraph({
              children: [
                new TextRun({
                  text: "SIGNATURE ÉLECTRONIQUE",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Signé électroniquement par ${clientData.nom} ${clientData.prenom}`,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Date et heure de signature: ${clientData.signatureTimestamp ? new Date(clientData.signatureTimestamp).toLocaleString('fr-CH') : 'Non disponible'}`,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),

            // Note sur la signature électronique
            new Paragraph({
              children: [
                new TextRun({
                  text: "Cette signature électronique a la même valeur juridique qu'une signature manuscrite selon la législation suisse (SCSE).",
                  italics: true,
                  size: 20,
                }),
              ],
              spacing: { after: 600 },
            }),

            // Déclaration finale
            new Paragraph({
              children: [
                new TextRun({
                  text: "DÉCLARATION",
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Je soussigné(e) confirme que toutes les informations fournies sont exactes et que je souhaite procéder à la demande selon les termes indiqués dans ce document.",
                  size: 24,
                }),
              ],
              spacing: { after: 400 },
            }),

            // Pied de page avec informations de traitement
            new Paragraph({
              children: [
                new TextRun({
                  text: "---",
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 600, after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Document généré automatiquement par eSignPro",
                  italics: true,
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Traité par: wael hamda - Conseiller eSignPro`,
                  italics: true,
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
      ],
    })

    return await Packer.toBuffer(doc)
  }

  /**
   * Génère un document Word (.docx) de résiliation d'assurance
   */
  static async generateResignationDocument(clientData: ClientData, signatureDataUrl?: string): Promise<Buffer> {
    // Créer les paragraphes du document
    const children = [
      // En-tête avec informations du demandeur
      new Paragraph({
        children: [
          new TextRun({
            text: `Nom prénom : ${clientData.nomPrenom}`,
            bold: false,
            size: 24, // 12pt
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: `Adresse: ${clientData.adresse}`,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: `NPA Ville: ${clientData.npaVille}`,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: `Lieu et date : ${clientData.lieuDate}`,
            size: 24,
          }),
        ],
        spacing: { after: 400 },
      }),

      // Objet
      new Paragraph({
        children: [
          new TextRun({
            text: "Objet : Résiliation de l'assurance maladie et/ou complémentaire",
            bold: true,
            size: 24,
          }),
        ],
        spacing: { after: 400 },
      }),

      // Formule de politesse
      new Paragraph({
        children: [
          new TextRun({
            text: "Madame, Monsieur,",
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      }),

      // Destinataire
      new Paragraph({
        children: [
          new TextRun({
            text: `Destinataire: ${clientData.destinataire}`,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      }),

      // Corps du texte
      new Paragraph({
        children: [
          new TextRun({
            text: "Par la présente, je souhaite résilier les contrats d'assurance maladie (LAMal) et d'assurance complémentaire souscrits auprès de votre compagnie pour les personnes suivantes :",
            size: 24,
          }),
        ],
        spacing: { after: 400 },
      }),
    ]

    // Ajouter le demandeur principal
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "1. Nom et prénom :",
            size: 24,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `   ○ Date de naissance : ${this.formatDate(clientData.dateNaissance)}`,
            size: 24,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `   ○ Numéro de police : ${clientData.numeroPolice}`,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      })
    )

    // Ajouter les personnes supplémentaires
    clientData.personnes.forEach((personne, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 2}. Nom et prénom : ${personne.prenom} ${personne.nom}`,
              size: 24,
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `   ○ Date de naissance : ${this.formatDate(personne.dateNaissance)}`,
              size: 24,
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `   ○ Numéro de police : ${personne.numeroPolice}`,
              size: 24,
            }),
          ],
          spacing: { after: 200 },
        })
      )
    })

    // Ajouter les places vides pour les personnes non utilisées
    for (let i = clientData.personnes.length + 1; i < 4; i++) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${i + 1}. Nom et prénom :`,
              size: 24,
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   ○ Date de naissance :",
              size: 24,
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "   ○ Numéro de police :",
              size: 24,
            }),
          ],
          spacing: { after: 200 },
        })
      )
    }

    // Suite du texte
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Conformément aux conditions générales de résiliation et à la réglementation en vigueur, je vous prie de prendre note que la résiliation prendra effet",
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: `Pour la lamal à compter de la date de : ${this.formatDate(clientData.dateLamal)}`,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: `Pour la LCA complémentaires : ${this.formatDate(clientData.dateLCA)}`,
            size: 24,
          }),
        ],
        spacing: { after: 400 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Je vous serais reconnaissant(e) de bien vouloir me confirmer par écrit la réception de cette demande et de m'envoyer un décompte final ainsi qu'une attestation de résiliation.",
            size: 24,
          }),
        ],
        spacing: { after: 400 },
      }),

      // Signature
      new Paragraph({
        children: [
          new TextRun({
            text: "Signature personnes majeures:",
            size: 24,
          }),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: signatureDataUrl 
              ? `[Signature électronique appliquée le ${new Date().toLocaleString("fr-CH")}]`
              : "_________________________",
            size: 24,
          }),
        ],
        spacing: { after: 400 },
      })
    )

    // Créer le document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch = 1440 twips
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: children,
        },
      ],
    })

    // Générer le buffer
    return await Packer.toBuffer(doc)
  }

  /**
   * Formate une date au format français
   */
  private static formatDate(dateString: string): string {
    if (!dateString) return ""
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-CH')
    } catch (error) {
      return dateString
    }
  }

  /**
   * Génère un document Word et le retourne comme Blob
   */
  static async generateWordBlob(clientData: ClientData, signatureDataUrl?: string): Promise<Blob> {
    const buffer = await this.generateResignationDocument(clientData, signatureDataUrl)
    return new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    })
  }
}
