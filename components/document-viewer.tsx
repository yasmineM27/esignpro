"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"

interface DocumentViewerProps {
  documentUrl: string
  documentName: string
}

export function DocumentViewer({ documentUrl, documentName }: DocumentViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState<string>("Chargement du document...")

  // Mock document content for demonstration
  const mockContent = `LETTRE DE RÉSILIATION - ASSURANCE

Destinataire:
Assureur XYZ
Service Résiliation
123 Rue de l'Assurance
1000 Lausanne

Objet: Résiliation de mon contrat d'assurance automobile

Madame, Monsieur,

Par la présente, je vous informe de ma décision de résilier mon contrat d'assurance automobile numéro POL-TEST-001, souscrit auprès de votre compagnie.

Conformément aux conditions générales de mon contrat et à la législation suisse en vigueur (art. 7 LCA), je souhaite exercer mon droit de résiliation annuel.

Cette résiliation prendra effet à la date anniversaire de mon contrat, soit le 31 décembre 2024.

Je vous remercie de bien vouloir prendre en compte cette demande et de m'adresser un certificat de radiation attestant de la résiliation effective de mon contrat.

Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

[Signature électronique]

Date: ${new Date().toLocaleDateString('fr-CH')}
Nom: Client eSignPro
Adresse: Rue de Test 123, 1000 Lausanne`

  useEffect(() => {
    // Simulate loading document content
    setTimeout(() => {
      setContent(mockContent)
    }, 500)
  }, [])

  const downloadDocument = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${documentName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const previewContent = content && content.length > 0 ? content.substring(0, 500) + (content.length > 500 ? "..." : "") : "Contenu non disponible"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Vérifiez que toutes les informations sont correctes avant de continuer.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Réduire
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Voir tout
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadDocument}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            className={`bg-gray-50 border rounded-lg p-4 font-mono text-sm whitespace-pre-line ${
              isExpanded ? "max-h-none" : "max-h-64"
            } overflow-y-auto`}
          >
            {isExpanded ? content : previewContent}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
