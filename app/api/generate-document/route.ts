import { type NextRequest, NextResponse } from "next/server"
import { DocumentAutoFiller } from "@/lib/document-templates"
import { WordDocumentGenerator } from "@/lib/word-generator"

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

export async function POST(request: NextRequest) {
  try {
    const clientData: ClientData = await request.json()

    // Validate client data
    const validation = DocumentAutoFiller.validateClientData(clientData)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Données incomplètes",
          missingFields: validation.missingFields,
        },
        { status: 400 },
      )
    }

    // Generate the document content using auto-fill logic
    const documentContent = DocumentAutoFiller.fillResignationTemplate(clientData)

    // Generate HTML version for preview
    const htmlContent = WordDocumentGenerator.generateHTML(documentContent)

    // Generate client ID
    const clientId = generateClientId()

    // In a real implementation, you would also:
    // 1. Generate actual Word document
    // 2. Save to database
    // 3. Create audit trail

    console.log("[v0] Document generated with auto-fill:", {
      clientId,
      clientName: clientData.nomPrenom,
      personCount: clientData.personnes.length,
      contentLength: documentContent.length,
    })

    return NextResponse.json({
      success: true,
      documentContent,
      htmlContent,
      clientId,
      message: "Document généré avec succès",
      metadata: {
        generatedAt: new Date().toISOString(),
        personCount: clientData.personnes.length,
        templateVersion: "1.0",
      },
    })
  } catch (error) {
    console.error("[v0] Error generating document:", error)
    return NextResponse.json({ success: false, message: "Erreur lors de la génération du document" }, { status: 500 })
  }
}

function generateClientId(): string {
  return "CLI_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}
