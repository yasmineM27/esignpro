import { type NextRequest, NextResponse } from "next/server"
import { DocxGenerator } from "@/lib/docx-generator"

interface FinalDocumentRequest {
  clientData: {
    nom: string
    prenom: string
    adresse: string
    npa: string
    ville: string
    dateNaissance: string
    numeroPolice: string
    typeFormulaire: string
  }
  documents: {
    identityFront?: string
    identityBack?: string
    insuranceContracts: string[]
    signature?: string
  }
  signatureTimestamp?: string
  caseNumber: string
}

export async function POST(request: NextRequest) {
  try {
    const data: FinalDocumentRequest = await request.json()

    // Validate required fields
    if (!data.clientData || !data.documents || !data.caseNumber) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Données manquantes pour générer le document final" 
        }, 
        { status: 400 }
      )
    }

    // Create enhanced client data with signature information
    const enhancedClientData = {
      ...data.clientData,
      signatureData: data.documents.signature,
      signatureTimestamp: data.signatureTimestamp,
      caseNumber: data.caseNumber,
      documentsAttached: {
        identityDocuments: [data.documents.identityFront, data.documents.identityBack].filter(Boolean).length,
        insuranceContracts: data.documents.insuranceContracts.length
      }
    }

    // Generate the final document with signature
    const documentBuffer = await DocxGenerator.generateFinalSignedDocument(enhancedClientData)

    // Generate filename with case number and timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${data.caseNumber}_${data.clientData.nom}_${data.clientData.prenom}_FINAL_${timestamp}.docx`

    return new NextResponse(documentBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': documentBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error("[API] Error generating final document:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Erreur lors de la génération du document final",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

// GET method for testing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId') || 'CLI_TEST'
    
    // Mock data for testing
    const mockData: FinalDocumentRequest = {
      clientData: {
        nom: "Hamda",
        prenom: "Wael",
        adresse: "Rue de la Paix 123",
        npa: "1000",
        ville: "Lausanne",
        dateNaissance: "01.01.1990",
        numeroPolice: "CSS-789456123",
        typeFormulaire: "Résiliation Assurance Maladie"
      },
      documents: {
        identityFront: "/uploads/wael_id_front.jpg",
        identityBack: "/uploads/wael_id_back.jpg",
        insuranceContracts: ["/uploads/wael_css_contract.pdf"],
        signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
      },
      signatureTimestamp: new Date().toISOString(),
      caseNumber: caseId
    }

    // Generate the final document
    const enhancedClientData = {
      ...mockData.clientData,
      signatureData: mockData.documents.signature,
      signatureTimestamp: mockData.signatureTimestamp,
      caseNumber: mockData.caseNumber,
      documentsAttached: {
        identityDocuments: 2,
        insuranceContracts: 1
      }
    }

    const documentBuffer = await DocxGenerator.generateFinalSignedDocument(enhancedClientData)

    const filename = `${mockData.caseNumber}_${mockData.clientData.nom}_${mockData.clientData.prenom}_FINAL_TEST.docx`

    return new NextResponse(documentBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': documentBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error("[API] Error generating test final document:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Erreur lors de la génération du document de test",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}
