import type { NextRequest } from "next/server"
import { generateClientEmailTemplate } from "@/lib/email-templates"
import { generateSecureToken } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const clientName = searchParams.get("clientName") || "Wael Hamda"
  const clientId = searchParams.get("clientId") || crypto.randomUUID()

  // Generate a secure token for the client portal
  const secureToken = generateSecureToken()
  const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://esignpro.ch"}/client-portal/${secureToken}`

  const template = generateClientEmailTemplate({
    clientName,
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
}
