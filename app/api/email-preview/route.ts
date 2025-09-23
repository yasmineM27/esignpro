import type { NextRequest } from "next/server"
import { generateClientEmailTemplate } from "@/lib/email-templates"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const clientName = searchParams.get("clientName") || "Wael Hamda"
  const clientId = searchParams.get("clientId") || "CLI_PREVIEW"

  // Generate a secure token for the client portal
  const secureToken = `SECURE_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`
  const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://esignpro.vercel.app"}/client/${secureToken}`

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
