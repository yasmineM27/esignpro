import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { generateSecureToken, supabaseAdmin } from "@/lib/supabase"

interface EmailData {
  clientEmail: string
  clientName: string
  clientId: string // Maintenant c'est le secureToken du dossier créé
  documentContent: string
  caseId?: string
  caseNumber?: string
  secureToken?: string
}

export async function POST(request: NextRequest) {
  try {
    const {
      clientEmail,
      clientName,
      clientId: secureToken,
      documentContent,
      caseId,
      caseNumber
    }: EmailData = await request.json()

    console.log('📧 Envoi email pour dossier existant:', {
      clientEmail,
      clientName,
      secureToken,
      caseId,
      caseNumber
    })

    // ✅ Récupérer le dossier existant au lieu de le créer
    const { data: existingCase, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        secure_token,
        status,
        client_id
      `)
      .eq('secure_token', secureToken)
      .single()

    if (caseError || !existingCase) {
      console.error('❌ Dossier non trouvé:', caseError)
      return NextResponse.json({
        success: false,
        error: 'Dossier non trouvé. Veuillez régénérer le document.'
      }, { status: 404 })
    }

    // Récupérer les informations du client séparément
    const { data: clientInfo, error: clientError } = await supabaseAdmin
      .from('clients')
      .select(`
        id,
        users!inner(
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', existingCase.client_id)
      .single()

    if (clientError || !clientInfo) {
      console.error('❌ Client non trouvé:', clientError)
      return NextResponse.json({
        success: false,
        error: 'Informations client non trouvées.'
      }, { status: 404 })
    }

    console.log('✅ Dossier trouvé:', {
      caseId: existingCase.id,
      caseNumber: existingCase.case_number,
      clientEmail: clientInfo.users.email
    })

    // ✅ Mettre à jour le statut du dossier existant
    const { data: updatedCase, error: updateError } = await supabaseAdmin
      .from('insurance_cases')
      .update({
        status: 'email_sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingCase.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erreur mise à jour statut:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la mise à jour du dossier'
      }, { status: 500 })
    }

    console.log('✅ Statut dossier mis à jour:', updatedCase.status)

    // Generate the secure client portal link
    const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://esignpro.ch"}/client-portal/${existingCase.secure_token}`

    // Send email to client using direct data (bypass database lookup)
    const clientEmailSent = await emailService.sendClientNotification({
      clientEmail: clientInfo.users.email,
      clientName: `${clientInfo.users.first_name} ${clientInfo.users.last_name}`,
      clientId: existingCase.secure_token,
      portalLink,
      documentContent: `Dossier d'assurance ${existingCase.case_number} - Document de résiliation`
    })

    if (!clientEmailSent) {
      throw new Error("Échec de l'envoi de l'email au client")
    }

    console.log('✅ Email envoyé avec succès à:', clientInfo.users.email)

    return NextResponse.json({
      success: true,
      message: "Email envoyé avec succès",
      portalLink,
      emailSent: true,
      caseId: existingCase.id,
      caseNumber: existingCase.case_number,
      secureToken: existingCase.secure_token
    })
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de l'envoi de l'email",
        emailSent: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 },
    )
  }
}
