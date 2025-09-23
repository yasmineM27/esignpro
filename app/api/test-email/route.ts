import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email"

interface TestEmailData {
  to: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message }: TestEmailData = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Paramètres manquants: to, subject, message" },
        { status: 400 }
      )
    }

    const result = await emailService.sendTestEmail(to, subject, message)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email de test envoyé avec succès",
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Erreur lors de l'envoi de l'email",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[v0] Error sending test email:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de l'envoi de l'email de test",
      },
      { status: 500 }
    )
  }
}