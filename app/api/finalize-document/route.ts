import { type NextRequest, NextResponse } from "next/server"
import { DocumentAutoFiller } from "@/lib/document-templates"
import { WordDocumentGenerator } from "@/lib/word-generator"

interface FinalizeDocumentRequest {
  clientId: string
  clientData: any
  signatureDataUrl: string
  uploadedFiles: {
    identityDocuments: string[]
    insuranceContracts: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { clientId, clientData, signatureDataUrl, uploadedFiles }: FinalizeDocumentRequest = await request.json()

    if (!clientId || !clientData || !signatureDataUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Données manquantes pour finaliser le document",
        },
        { status: 400 },
      )
    }

    // Generate final document with signature
    const finalDocumentContent = DocumentAutoFiller.fillResignationTemplate(clientData, signatureDataUrl)

    // Generate Word document
    const wordBlob = await WordDocumentGenerator.generateWordFile(finalDocumentContent, clientId)

    // Generate PDF version
    const pdfBlob = await WordDocumentGenerator.generatePDF(finalDocumentContent, clientId)

    // In a real implementation, you would:
    // 1. Save final document to secure storage
    // 2. Create digital signature certificate
    // 3. Send to insurance company API
    // 4. Update client status in database
    // 5. Send confirmation email
    // 6. Create audit trail

    console.log("[v0] Document finalized:", {
      clientId,
      signatureApplied: !!signatureDataUrl,
      identityDocsCount: uploadedFiles.identityDocuments.length,
      insuranceDocsCount: uploadedFiles.insuranceContracts.length,
      finalContentLength: finalDocumentContent.length,
    })

    // Simulate sending to insurance company
    const insuranceSubmissionResult = await simulateInsuranceSubmission(clientId, finalDocumentContent, uploadedFiles)

    return NextResponse.json({
      success: true,
      message: "Document finalisé et envoyé avec succès",
      finalDocument: finalDocumentContent,
      submissionId: insuranceSubmissionResult.submissionId,
      estimatedProcessingTime: "2-5 jours ouvrables",
      nextSteps: [
        "Votre demande a été transmise à votre assureur",
        "Vous recevrez une confirmation par email dans les 24h",
        "Le traitement prend généralement 2-5 jours ouvrables",
        "Vous serez notifié dès que la résiliation sera effective",
      ],
    })
  } catch (error) {
    console.error("[v0] Error finalizing document:", error)
    return NextResponse.json({ success: false, message: "Erreur lors de la finalisation du document" }, { status: 500 })
  }
}

async function simulateInsuranceSubmission(clientId: string, documentContent: string, uploadedFiles: any) {
  // Simulate API call to insurance company
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return {
    submissionId: `INS_${clientId}_${Date.now()}`,
    status: "submitted",
    timestamp: new Date().toISOString(),
  }
}
