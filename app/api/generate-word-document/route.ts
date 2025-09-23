import { type NextRequest, NextResponse } from "next/server"
import { DocxGenerator } from "@/lib/docx-generator"

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

    // Validation des données requises
    if (!clientData.nomPrenom || !clientData.adresse || !clientData.npaVille) {
      return NextResponse.json(
        {
          success: false,
          message: "Données client incomplètes",
        },
        { status: 400 }
      )
    }

    // Générer le document Word
    const wordBuffer = await DocxGenerator.generateResignationDocument(clientData)

    // Générer un nom de fichier unique
    const fileName = `Resiliation_${clientData.nom}_${clientData.prenom}_${Date.now()}.docx`

    // Retourner le document comme réponse
    return new NextResponse(wordBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': wordBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error("[API] Error generating Word document:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Erreur lors de la génération du document Word",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

// Méthode GET pour télécharger un document existant (optionnel)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')
  
  if (!clientId) {
    return NextResponse.json(
      { success: false, message: "Client ID requis" },
      { status: 400 }
    )
  }

  // Dans une vraie implémentation, vous récupéreriez les données depuis la base de données
  // Pour l'instant, retournons une erreur
  return NextResponse.json(
    { success: false, message: "Document non trouvé" },
    { status: 404 }
  )
}
