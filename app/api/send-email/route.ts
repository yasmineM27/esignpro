import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email"
import { generateSecureToken } from "@/lib/supabase"

interface EmailData {
  clientEmail: string
  clientName: string
  clientId: string
  documentContent: string
}

export async function POST(request: NextRequest) {
  try {
    const { clientEmail, clientName, clientId, documentContent }: EmailData = await request.json()

    // Generate a secure token for the client portal
    const secureToken = generateSecureToken()

    // Generate the secure client portal link
    const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://esignpro.ch"}/client/${secureToken}`

    // Send email to client using the new email service
    const clientEmailSent = await emailService.sendClientInvitation({
      id: clientId,
      client: {
        user: {
          email: clientEmail,
          first_name: clientName.split(' ')[0],
          last_name: clientName.split(' ')[1] || '',
        }
      },
      agent: {
        user: {
          first_name: 'wael',
          last_name: 'hamda',
        }
      },
      case_number: `CASE-${clientId}`,
      secure_token: secureToken,
      token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      insurance_company: 'Assurance Test',
      policy_number: 'POL-TEST-001',
    })

    if (!clientEmailSent.success) {
      throw new Error(clientEmailSent.error || "Échec de l'envoi de l'email au client")
    }

    return NextResponse.json({
      success: true,
      message: "Email envoyé avec succès",
      portalLink,
      emailSent: true,
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
