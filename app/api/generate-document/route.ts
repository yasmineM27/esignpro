import { type NextRequest, NextResponse } from "next/server"
import { DocumentAutoFiller } from "@/lib/document-templates"
import { WordDocumentGenerator } from "@/lib/word-generator"
import { DatabaseService, type ClientData } from "@/lib/database-service"

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

    console.log("📝 Génération document avec sauvegarde BDD:", {
      nom: clientData.nom,
      prenom: clientData.prenom,
      email: clientData.email,
      typeFormulaire: clientData.typeFormulaire
    })

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

    // ✅ 1. SAUVEGARDER EN BASE DE DONNÉES
    const dbService = new DatabaseService()
    const caseResult = await dbService.createInsuranceCase(clientData)

    if (!caseResult.success) {
      console.error("❌ Erreur création dossier BDD:", caseResult.error)
      return NextResponse.json({
        success: false,
        message: "Erreur lors de la sauvegarde en base de données",
        error: caseResult.error
      }, { status: 500 })
    }

    console.log("✅ Dossier créé en BDD:", {
      caseId: caseResult.caseId,
      caseNumber: caseResult.caseNumber,
      secureToken: caseResult.secureToken
    })

    // ✅ 2. GÉNÉRER LE DOCUMENT
    const documentContent = DocumentAutoFiller.fillResignationTemplate(clientData)
    const htmlContent = WordDocumentGenerator.generateHTML(documentContent)

    console.log("✅ Document généré:", {
      caseNumber: caseResult.caseNumber,
      clientName: `${clientData.prenom} ${clientData.nom}`,
      personCount: clientData.personnes?.length || 0,
      contentLength: documentContent.length,
    })

    return NextResponse.json({
      success: true,
      documentContent,
      htmlContent,
      clientId: caseResult.secureToken, // Utiliser le token sécurisé comme clientId
      caseId: caseResult.caseId,
      caseNumber: caseResult.caseNumber,
      secureToken: caseResult.secureToken,
      message: "Document généré et dossier créé avec succès",
      metadata: {
        generatedAt: new Date().toISOString(),
        personCount: clientData.personnes?.length || 0,
        templateVersion: "1.0",
        savedToDatabase: true
      },
    })
  } catch (error) {
    console.error("❌ Erreur génération document:", error)
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la génération du document",
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 })
  }
}
