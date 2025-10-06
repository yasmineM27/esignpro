import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const clientId = formData.get("clientId") as string
    const fileType = formData.get("type") as string

    if (!file || !clientId || !fileType) {
      return NextResponse.json({ success: false, message: "Données manquantes" }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, message: "Fichier trop volumineux (max 10MB)" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = {
      identity: [".pdf", ".jpg", ".jpeg", ".png"], // ✅ PDF déjà supporté
      insurance: [".pdf"],
    }

    const extension = "." + file.name.split(".").pop()?.toLowerCase()
    const validTypes = allowedTypes[fileType as keyof typeof allowedTypes] || []

    if (!validTypes.includes(extension)) {
      return NextResponse.json(
        { success: false, message: `Type de fichier non supporté: ${extension}` },
        { status: 400 },
      )
    }

    // In a real implementation, you would:
    // 1. Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
    // 2. Store file metadata in database
    // 3. Run virus scanning
    // 4. Generate thumbnails for images

    console.log("[v0] File upload simulation:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      clientId,
      type: fileType,
    })

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a mock file URL
    const fileUrl = `https://storage.example.com/${clientId}/${fileType}/${file.name}`

    return NextResponse.json({
      success: true,
      message: "Fichier uploadé avec succès",
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("[v0] File upload error:", error)
    return NextResponse.json({ success: false, message: "Erreur lors de l'upload du fichier" }, { status: 500 })
  }
}
