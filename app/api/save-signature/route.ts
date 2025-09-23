import { type NextRequest, NextResponse } from "next/server"

interface SignatureData {
  clientId: string
  signature: string
  timestamp: string
  clientName: string
}

export async function POST(request: NextRequest) {
  try {
    const { clientId, signature, timestamp, clientName }: SignatureData = await request.json()

    if (!clientId || !signature || !timestamp || !clientName) {
      return NextResponse.json({ success: false, message: "Données manquantes" }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Save signature to secure database
    // 2. Create audit trail
    // 3. Generate signed document with timestamp
    // 4. Send confirmation email
    // 5. Update client status

    console.log("[v0] Signature saved:", {
      clientId,
      clientName,
      timestamp,
      signatureLength: signature.length,
    })

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      message: "Signature enregistrée avec succès",
      signatureId: `SIG_${clientId}_${Date.now()}`,
      timestamp,
    })
  } catch (error) {
    console.error("[v0] Signature save error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'enregistrement de la signature" },
      { status: 500 },
    )
  }
}
