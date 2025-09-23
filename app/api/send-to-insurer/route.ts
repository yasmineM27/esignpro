import { type NextRequest, NextResponse } from "next/server"

interface SendToInsurerRequest {
  documentId: string
  caseNumber: string
  clientName: string
  insuranceCompany: string
  insuranceEmail?: string
  documentUrl: string
  agentName: string
  notes?: string
}

// Configuration des emails des compagnies d'assurance
const INSURANCE_EMAILS: Record<string, string> = {
  "CSS Assurance": "resiliation@css.ch",
  "Groupe Mutuel": "resiliation@groupemutuel.ch",
  "Allianz Suisse": "resiliation@allianz.ch",
  "AXA Assurances": "resiliation@axa.ch",
  "Zurich Assurances": "resiliation@zurich.ch",
  "Swica": "resiliation@swica.ch",
  "Helsana": "resiliation@helsana.ch"
}

export async function POST(request: NextRequest) {
  try {
    const data: SendToInsurerRequest = await request.json()

    // Validate required fields
    if (!data.documentId || !data.caseNumber || !data.insuranceCompany || !data.documentUrl) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Données manquantes pour l'envoi à l'assureur" 
        }, 
        { status: 400 }
      )
    }

    // Get insurance company email
    const insuranceEmail = data.insuranceEmail || INSURANCE_EMAILS[data.insuranceCompany]
    
    if (!insuranceEmail) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Email de contact non trouvé pour ${data.insuranceCompany}` 
        }, 
        { status: 400 }
      )
    }

    // Prepare email content for insurance company
    const emailSubject = `eSignPro - Demande de résiliation - Dossier ${data.caseNumber}`
    
    const emailContent = `
Madame, Monsieur,

Nous vous transmettons par la présente une demande de résiliation d'assurance pour votre client :

INFORMATIONS CLIENT :
- Nom : ${data.clientName}
- Dossier : ${data.caseNumber}
- Date de demande : ${new Date().toLocaleDateString('fr-CH')}

DOCUMENTS JOINTS :
- Document de résiliation signé électroniquement
- Pièces d'identité du client
- Contrats d'assurance actuels

La signature électronique a été effectuée selon les standards suisses (SCSE) et a la même valeur juridique qu'une signature manuscrite.

${data.notes ? `NOTES COMPLÉMENTAIRES :\n${data.notes}\n\n` : ''}

Nous vous remercions de bien vouloir traiter cette demande dans les meilleurs délais et de nous confirmer la prise en compte de cette résiliation.

Pour toute question, vous pouvez nous contacter :
- Agent responsable : ${data.agentName}
- Email : contact@esignpro.ch
- Téléphone : +41 21 123 45 67

Cordialement,
${data.agentName}
eSignPro - Solutions de signature électronique
    `.trim()

    // Simulate sending email to insurance company
    // In a real implementation, you would use an email service like Resend, SendGrid, etc.
    console.log(`Sending email to ${insuranceEmail}:`)
    console.log(`Subject: ${emailSubject}`)
    console.log(`Content: ${emailContent}`)
    console.log(`Document URL: ${data.documentUrl}`)

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Log the action for audit trail
    const auditLog = {
      timestamp: new Date().toISOString(),
      action: 'SENT_TO_INSURER',
      documentId: data.documentId,
      caseNumber: data.caseNumber,
      insuranceCompany: data.insuranceCompany,
      insuranceEmail: insuranceEmail,
      agentName: data.agentName,
      success: true
    }

    console.log('Audit Log:', auditLog)

    return NextResponse.json({
      success: true,
      message: `Document envoyé avec succès à ${data.insuranceCompany}`,
      data: {
        sentTo: insuranceEmail,
        sentAt: new Date().toISOString(),
        caseNumber: data.caseNumber,
        trackingId: `TRACK_${data.caseNumber}_${Date.now()}`
      }
    })

  } catch (error) {
    console.error("[API] Error sending document to insurer:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Erreur lors de l'envoi du document à l'assureur",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

// GET method to retrieve insurance company contacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company')

    if (company) {
      const email = INSURANCE_EMAILS[company]
      if (email) {
        return NextResponse.json({
          success: true,
          company: company,
          email: email
        })
      } else {
        return NextResponse.json(
          { 
            success: false, 
            message: `Compagnie d'assurance non trouvée: ${company}` 
          }, 
          { status: 404 }
        )
      }
    }

    // Return all insurance companies and their emails
    return NextResponse.json({
      success: true,
      insuranceCompanies: INSURANCE_EMAILS
    })

  } catch (error) {
    console.error("[API] Error retrieving insurance contacts:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Erreur lors de la récupération des contacts assureurs",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}
