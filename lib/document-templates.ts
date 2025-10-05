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

// Template placeholders that will be replaced with actual data
export const TEMPLATE_PLACEHOLDERS = {
  CLIENT_NOM_PRENOM: "{{CLIENT_NOM_PRENOM}}",
  CLIENT_ADRESSE: "{{CLIENT_ADRESSE}}",
  CLIENT_NPA_VILLE: "{{CLIENT_NPA_VILLE}}",
  DESTINATAIRE: "{{DESTINATAIRE}}",
  LIEU_DATE: "{{LIEU_DATE}}",
  PERSONNES_LIST: "{{PERSONNES_LIST}}",
  DATE_LAMAL: "{{DATE_LAMAL}}",
  DATE_LCA: "{{DATE_LCA}}",
  SIGNATURE_PLACEHOLDER: "{{SIGNATURE_PLACEHOLDER}}",
}

// Base template for the resignation document (format exact selon votre spécification)
export const RESIGNATION_TEMPLATE = `
Nom prénom : ${TEMPLATE_PLACEHOLDERS.CLIENT_NOM_PRENOM}

Adresse: ${TEMPLATE_PLACEHOLDERS.CLIENT_ADRESSE}

NPA Ville: ${TEMPLATE_PLACEHOLDERS.CLIENT_NPA_VILLE}

Lieu et date : ${TEMPLATE_PLACEHOLDERS.LIEU_DATE}

Objet : Résiliation de l'assurance maladie et/ou complémentaire

Madame, Monsieur,

Destinataire: ${TEMPLATE_PLACEHOLDERS.DESTINATAIRE}

Par la présente, je souhaite résilier les contrats d'assurance maladie (LAMal) et d'assurance complémentaire souscrits auprès de votre compagnie pour les personnes suivantes :

${TEMPLATE_PLACEHOLDERS.PERSONNES_LIST}

Conformément aux conditions générales de résiliation et à la réglementation en vigueur, je vous prie de prendre note que la résiliation prendra effet

Pour la lamal à compter de la date de : ${TEMPLATE_PLACEHOLDERS.DATE_LAMAL}

Pour la LCA complémentaires : ${TEMPLATE_PLACEHOLDERS.DATE_LCA}

Je vous serais reconnaissant(e) de bien vouloir me confirmer par écrit la réception de cette demande et de m'envoyer un décompte final ainsi qu'une attestation de résiliation.

Signature personnes majeures:

${TEMPLATE_PLACEHOLDERS.SIGNATURE_PLACEHOLDER}

Cordialement,
${TEMPLATE_PLACEHOLDERS.CLIENT_NOM_PRENOM}
`.trim()

export class DocumentAutoFiller {
  /**
   * Fill the resignation template with client data
   */
  static fillResignationTemplate(clientData: ClientData, signatureDataUrl?: string): string {
    let filledTemplate = RESIGNATION_TEMPLATE

    // Replace basic placeholders
    filledTemplate = filledTemplate.replace(
      new RegExp(TEMPLATE_PLACEHOLDERS.CLIENT_NOM_PRENOM.replace(/[{}]/g, "\\$&"), "g"),
      clientData.nomPrenom,
    )

    filledTemplate = filledTemplate.replace(
      new RegExp(TEMPLATE_PLACEHOLDERS.CLIENT_ADRESSE.replace(/[{}]/g, "\\$&"), "g"),
      clientData.adresse,
    )

    filledTemplate = filledTemplate.replace(
      new RegExp(TEMPLATE_PLACEHOLDERS.CLIENT_NPA_VILLE.replace(/[{}]/g, "\\$&"), "g"),
      clientData.npaVille,
    )

    filledTemplate = filledTemplate.replace(
      new RegExp(TEMPLATE_PLACEHOLDERS.DESTINATAIRE.replace(/[{}]/g, "\\$&"), "g"),
      clientData.destinataire,
    )

    filledTemplate = filledTemplate.replace(
      new RegExp(TEMPLATE_PLACEHOLDERS.LIEU_DATE.replace(/[{}]/g, "\\$&"), "g"),
      clientData.lieuDate,
    )

    // Format dates
    const formattedDateLamal = this.formatDate(clientData.dateLamal)
    const formattedDateLCA = this.formatDate(clientData.dateLCA)

    filledTemplate = filledTemplate.replace(
      new RegExp(TEMPLATE_PLACEHOLDERS.DATE_LAMAL.replace(/[{}]/g, "\\$&"), "g"),
      formattedDateLamal,
    )

    filledTemplate = filledTemplate.replace(
      new RegExp(TEMPLATE_PLACEHOLDERS.DATE_LCA.replace(/[{}]/g, "\\$&"), "g"),
      formattedDateLCA,
    )

    // Generate persons list
    const personsList = this.generatePersonsList(clientData.personnes)
    filledTemplate = filledTemplate.replace(
      new RegExp(TEMPLATE_PLACEHOLDERS.PERSONNES_LIST.replace(/[{}]/g, "\\$&"), "g"),
      personsList,
    )

    // Handle signature
    const signaturePlaceholder = signatureDataUrl
      ? `[Signature électronique appliquée le ${new Date().toLocaleString("fr-CH")}]`
      : "_________________________"

    filledTemplate = filledTemplate.replace(
      new RegExp(TEMPLATE_PLACEHOLDERS.SIGNATURE_PLACEHOLDER.replace(/[{}]/g, "\\$&"), "g"),
      signaturePlaceholder,
    )

    return filledTemplate
  }

  /**
   * Generate the list of insured persons
   */
  private static generatePersonsList(personnes: PersonInfo[]): string {
    return personnes
      .map((personne, index) => {
        const formattedDate = this.formatDate(personne.dateNaissance)
        return `${index + 1}. Nom et prénom : ${personne.prenom} ${personne.nom}
○ Date de naissance : ${formattedDate}
○ Numéro de police : ${personne.numeroPolice}`
      })
      .join("\n\n")
  }

  /**
   * Format date from YYYY-MM-DD to DD/MM/YYYY
   */
  private static formatDate(dateString: string): string {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  /**
   * Generate Word document content (simplified version)
   * In a real implementation, you would use libraries like docx or mammoth
   */
  static generateWordDocument(clientData: ClientData, signatureDataUrl?: string): string {
    const filledContent = this.fillResignationTemplate(clientData, signatureDataUrl)

    // This is a simplified version. In production, you would:
    // 1. Use a library like 'docx' to create proper Word documents
    // 2. Apply formatting, fonts, and styles
    // 3. Insert images for signatures
    // 4. Add headers, footers, and letterhead

    return filledContent
  }

  /**
   * Validate that all required fields are filled
   */
  static validateClientData(clientData: ClientData): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = []

    if (!clientData.nomPrenom.trim()) missingFields.push("Nom et prénom")
    if (!clientData.adresse.trim()) missingFields.push("Adresse")
    if (!clientData.npaVille.trim()) missingFields.push("NPA Ville")
    if (!clientData.destinataire.trim()) missingFields.push("Destinataire")
    if (!clientData.lieuDate.trim()) missingFields.push("Lieu et date")
    if (!clientData.dateLamal) missingFields.push("Date résiliation LAMal")
    if (!clientData.dateLCA) missingFields.push("Date résiliation LCA")
    if (!clientData.email.trim()) missingFields.push("Email")

    // Validate persons
    clientData.personnes.forEach((personne, index) => {
      if (!personne.nom.trim()) missingFields.push(`Nom personne ${index + 1}`)
      if (!personne.prenom.trim()) missingFields.push(`Prénom personne ${index + 1}`)
      if (!personne.dateNaissance) missingFields.push(`Date naissance personne ${index + 1}`)
      // Note: numeroPolice est seulement sur le client principal, pas sur chaque personne
    })

    return {
      isValid: missingFields.length === 0,
      missingFields,
    }
  }

  /**
   * Generate preview with highlighted placeholders
   */
  static generatePreviewWithHighlights(clientData: Partial<ClientData>): string {
    let template = RESIGNATION_TEMPLATE

    // Replace filled fields
    if (clientData.nomPrenom) {
      template = template.replace(
        new RegExp(TEMPLATE_PLACEHOLDERS.CLIENT_NOM_PRENOM.replace(/[{}]/g, "\\$&"), "g"),
        `**${clientData.nomPrenom}**`,
      )
    }

    if (clientData.adresse) {
      template = template.replace(
        new RegExp(TEMPLATE_PLACEHOLDERS.CLIENT_ADRESSE.replace(/[{}]/g, "\\$&"), "g"),
        `**${clientData.adresse}**`,
      )
    }

    // Highlight remaining placeholders
    template = template.replace(/\{\{[^}]+\}\}/g, "**[À COMPLÉTER]**")

    return template
  }
}
