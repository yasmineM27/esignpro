import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { generateClientEmailTemplate } from "@/lib/email-templates"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")
    const clientId = searchParams.get("clientId")
    const clientName = searchParams.get("clientName")

    console.log('📧 Email preview:', { token, clientId, clientName })

    // Si on a un token, récupérer les vraies données
    if (token) {
      const { data: caseData, error } = await supabaseAdmin
        .from('insurance_cases')
        .select(`
          id,
          case_number,
          secure_token,
          insurance_company,
          clients (
            id,
            users (
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('secure_token', token)
        .single()

      if (!error && caseData) {
        const realClientName = `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`
        const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/client-portal/${token}`

        const template = generateClientEmailTemplate({
          clientName: realClientName,
          portalLink,
          documentContent: `Dossier ${caseData.case_number} - ${caseData.insurance_company}`,
          agentName: "wael hamda",
          companyName: "eSignPro"
        })

        return new Response(template.html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        })
      }
    }

    // Sinon, utiliser les données de la requête ou des valeurs par défaut
    const finalClientName = clientName || "Client Test"
    const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/client-portal/${token || 'demo'}`

    const template = generateClientEmailTemplate({
      clientName: finalClientName,
      portalLink,
      documentContent: "Document de résiliation généré automatiquement...",
      agentName: "wael hamda",
      companyName: "eSignPro"
    })

    return new Response(template.html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error('❌ Erreur email preview:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération de l\'aperçu'
    }, { status: 500 })
  }
}
