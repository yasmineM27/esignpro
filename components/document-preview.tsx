"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Mail, ExternalLink, Eye, FileText } from "lucide-react"
import { useState } from "react"

interface DocumentPreviewProps {
  content: string
  clientId: string // This can be either a UUID or secure token
}

export function DocumentPreview({ content, clientId }: DocumentPreviewProps) {
  const [downloadFormat, setDownloadFormat] = useState<"txt" | "html" | "pdf">("txt")
  // Use clientId as token for portal link - it will be the secure token if available
  const portalLink = `${window.location.origin}/client-portal/${clientId}`
  const emailPreviewLink = `${window.location.origin}/api/email-preview?clientName=Client&clientId=${clientId}&token=${clientId}`

  const downloadDocument = async (format: "txt" | "html" | "pdf" = "txt") => {
    let blob: Blob
    let filename: string

    switch (format) {
      case "html":
        // Generate HTML version
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Document de Résiliation</title>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 2cm; }
        .content { white-space: pre-line; }
    </style>
</head>
<body>
    <div class="content">${content}</div>
</body>
</html>`
        blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })
        filename = `resiliation_${clientId}.html`
        break

      case "pdf":
        // In a real implementation, this would generate a proper PDF
        blob = new Blob([content], { type: "application/pdf" })
        filename = `resiliation_${clientId}.pdf`
        break

      default:
        blob = new Blob([content], { type: "text/plain;charset=utf-8" })
        filename = `resiliation_${clientId}.txt`
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyPortalLink = () => {
    navigator.clipboard.writeText(portalLink)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Aperçu du Document Auto-Rempli
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadDocument("txt")}>
                <Download className="h-4 w-4 mr-2" />
                TXT
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadDocument("html")}>
                <Download className="h-4 w-4 mr-2" />
                HTML
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadDocument("pdf")}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded-lg p-6 font-mono text-sm whitespace-pre-line max-h-96 overflow-y-auto">
            {content}
          </div>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>✓ Remplissage automatique terminé :</strong> Tous les champs ont été automatiquement remplis avec
              les données saisies. Le document est prêt à être envoyé au client.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email et Portail Client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-blue-700 mb-2">
              <strong>Lien portail client :</strong>
            </p>
            <div className="flex items-center gap-2 p-3 bg-white rounded border">
              <code className="flex-1 text-sm text-gray-800">{portalLink}</code>
              <Button variant="outline" size="sm" onClick={copyPortalLink}>
                Copier
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(portalLink, "_blank")}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-blue-700 mb-2">
              <strong>Aperçu de l'email envoyé :</strong>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(emailPreviewLink, "_blank")}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir l'aperçu de l'email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
