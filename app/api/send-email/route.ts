import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { generateSecureToken, supabaseAdmin } from "@/lib/supabase"

interface EmailData {
  clientEmail: string
  clientName: string
  clientId: string
  documentContent: string
}

export async function POST(request: NextRequest) {
  try {
    const { clientEmail, clientName, clientId: formClientId, documentContent }: EmailData = await request.json()

    console.log('Creating insurance case for client form workflow:', { clientEmail, clientName, formClientId })

    // First, find or create the user
    const { data: existingUser, error: userQueryError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', clientEmail)
      .single()

    let userId: string

    if (userQueryError || !existingUser) {
      // Create user if doesn't exist
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          email: clientEmail,
          first_name: clientName.split(' ')[0],
          last_name: clientName.split(' ')[1] || '',
          role: 'client'
        })
        .select('id')
        .single()

      if (userError || !newUser) {
        console.error('Error creating user:', userError)
        throw new Error('Failed to create user')
      }
      userId = newUser.id
    } else {
      userId = existingUser.id
    }

    // Find or create client
    const { data: existingClient, error: clientQueryError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .single()

    let dbClientId: string

    if (clientQueryError || !existingClient) {
      // Create client if doesn't exist
      const { data: newClient, error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: userId,
          country: 'CH'
        })
        .select('id')
        .single()

      if (clientError || !newClient) {
        console.error('Error creating client:', clientError)
        throw new Error('Failed to create client')
      }
      dbClientId = newClient.id
    } else {
      dbClientId = existingClient.id
    }

    // Find or create agent (use default agent)
    const { data: existingAgent, error: agentQueryError } = await supabaseAdmin
      .from('agents')
      .select('id')
      .limit(1)
      .single()

    let agentId: string | undefined

    if (agentQueryError || !existingAgent) {
      // Create default agent if none exists
      const { data: defaultUser, error: defaultUserError } = await supabaseAdmin
        .from('users')
        .insert({
          email: 'agent@esignpro.ch',
          first_name: 'Support',
          last_name: 'eSignPro',
          role: 'agent'
        })
        .select('id')
        .single()

      if (!defaultUserError && defaultUser) {
        const { data: newAgent, error: agentError } = await supabaseAdmin
          .from('agents')
          .insert({
            user_id: defaultUser.id,
            agent_code: 'DEFAULT'
          })
          .select('id')
          .single()

        if (!agentError && newAgent) {
          agentId = newAgent.id
        }
      }
    } else {
      agentId = existingAgent.id
    }

    // Generate a secure token for the client portal
    const secureToken = generateSecureToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create insurance case
    const { data: insuranceCase, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .insert({
        case_number: `FORM-${Date.now()}`,
        client_id: dbClientId,
        agent_id: agentId,
        insurance_company: 'Client Form Submission',
        policy_number: 'FORM-SUBMISSION',
        policy_type: 'Résiliation',
        status: 'email_sent',
        secure_token: secureToken,
        termination_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        reason_for_termination: `Document généré automatiquement via formulaire client - ${clientName}`,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (caseError) {
      console.error('Error creating insurance case:', caseError)
      throw new Error('Failed to create insurance case')
    }

    console.log('Insurance case created:', insuranceCase.id, 'with token:', secureToken)

    // Generate the secure client portal link
    const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://esignpro.ch"}/client-portal/${secureToken}`

    // Send email to client using direct data (bypass database lookup)
    const clientEmailSent = await emailService.sendClientNotification({
      clientEmail,
      clientName,
      clientId: formClientId,
      portalLink,
      documentContent: `Dossier d'assurance ${insuranceCase.case_number} - ${insuranceCase.insurance_company}`
    })

    if (!clientEmailSent) {
      throw new Error("Échec de l'envoi de l'email au client")
    }

    return NextResponse.json({
      success: true,
      message: "Email envoyé avec succès",
      portalLink,
      emailSent: true,
      secureToken
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
