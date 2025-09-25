"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileUploader } from "@/components/file-uploader"
import { DocumentViewer } from "@/components/document-viewer"
import { DigitalSignature } from "@/components/digital-signature"
import {
  Mail,
  Upload,
  FileText,
  PenTool,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  User,
  Calendar,
  Download
} from "lucide-react"
import Image from "next/image"

interface ClientPortalPageProps {
  params: {
    clientId: string
  }
}

interface ClientWorkflowData {
  token: string
  clientName: string
  clientEmail: string
  agentName: string
  agentEmail: string
  documentType: string
  createdAt: string
  expiresAt: string
  status: "email_sent" | "documents_uploaded" | "document_reviewed" | "signed" | "completed" | "expired"
  documents: {
    id: string
    name: string
    type: string
    url: string
  }[]
  uploadedFiles: {
    id: string
    name: string
    type: "id_front" | "id_back" | "additional"
    url: string
  }[]
  signatureData?: {
    signature: string
    timestamp: string
  }
}

export default function ClientPortalPage({ params }: ClientPortalPageProps) {
  const { clientId: token } = params // Le token est maintenant le clientId
  const [workflowData, setWorkflowData] = useState<ClientWorkflowData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Charger les données du workflow au montage
  useEffect(() => {
    const fetchWorkflowData = async () => {
      try {
        setLoading(true)
        console.log('🔍 Chargement des données pour token:', token)

        // Simuler l'appel API - remplacer par vraie API
        const mockData: ClientWorkflowData = {
          token,
          clientName: "Wael Hamda",
          clientEmail: "yasminemassaoudi27@gmail.com",
          agentName: "wael hamda",
          agentEmail: "wael.hamda@esignpro.ch",
          documentType: "Résiliation Assurance Auto",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "email_sent",
          documents: [
            {
              id: "doc1",
              name: "Lettre de résiliation",
              type: "termination_letter",
              url: "/documents/sample.pdf"
            }
          ],
          uploadedFiles: []
        }

        setWorkflowData(mockData)

        // Déterminer l'étape actuelle basée sur le statut
        switch (mockData.status) {
          case "email_sent":
            setCurrentStep(1)
            break
          case "documents_uploaded":
            setCurrentStep(2)
            break
          case "document_reviewed":
            setCurrentStep(3)
            break
          case "signed":
            setCurrentStep(4)
            break
          case "completed":
            setCurrentStep(5)
            break
        }

      } catch (error) {
        console.error('❌ Erreur chargement données:', error)
        setError('Impossible de charger les données du dossier')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflowData()
  }, [token])

  // Gestion de l'upload de fichiers
  const handleFileUpload = async (files: File[]) => {
    setIsSubmitting(true)
    try {
      console.log('📤 Upload de fichiers:', files.map(f => f.name))

      // Simuler l'upload - remplacer par vraie API
      await new Promise(resolve => setTimeout(resolve, 2000))

      setUploadedFiles(files)
      setWorkflowData(prev => prev ? { ...prev, status: "documents_uploaded" } : null)
      setCurrentStep(2)

    } catch (error) {
      console.error('❌ Erreur upload:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Gestion de la révision des documents
  const handleDocumentReview = () => {
    setWorkflowData(prev => prev ? { ...prev, status: "document_reviewed" } : null)
    setCurrentStep(3)
  }

  // Gestion de la signature
  const handleSignatureComplete = async (signatureData: { signature: string; timestamp: string }) => {
    if (!workflowData) return

    setIsSubmitting(true)
    try {
      console.log('✍️ Signature complétée:', signatureData)

      // Appeler l'API pour finaliser la signature et sauvegarder en base
      const response = await fetch('/api/client/complete-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          signatureData,
          clientName: workflowData.clientName,
          clientEmail: workflowData.clientEmail,
          agentName: workflowData.agentName,
          agentEmail: workflowData.agentEmail,
          documentType: workflowData.documentType,
          uploadedFiles: workflowData.uploadedFiles
        })
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Signature finalisée et sauvegardée:', result)

        const updatedData = {
          ...workflowData,
          signatureData,
          status: "signed" as const
        }

        setWorkflowData(updatedData)
        setCurrentStep(4)

        // Passer à la confirmation après 2 secondes
        setTimeout(() => {
          setWorkflowData(prev => prev ? { ...prev, status: "completed" } : null)
          setCurrentStep(5)
        }, 2000)
      } else {
        console.error('❌ Erreur finalisation signature:', result.error)
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('❌ Erreur signature:', error)
      setError('Erreur lors de la finalisation de la signature')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p>Chargement de votre dossier...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !workflowData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || 'Dossier non trouvé'}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const expiryDate = new Date(workflowData.expiresAt).toLocaleDateString('fr-CH')
  const progress = (currentStep / 5) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      {/* Client Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/images/esignpro-logo.png" alt="eSignPro" width={150} height={45} className="h-10 w-auto" />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-light text-gray-800">Signature Électronique Sécurisée</h1>
                <p className="text-sm text-gray-600">Espace Client - Finalisation de votre dossier</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Connexion sécurisée</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-6">
        {/* Welcome Message */}
        <Card className="mb-6 bg-gradient-to-r from-red-600 to-gray-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Bonjour {workflowData.clientName},</h2>
                <p className="text-red-100">
                  Votre conseiller <strong>{workflowData.agentName}</strong> vous invite à finaliser la signature électronique de vos documents via notre
                  plateforme sécurisée.
                </p>
                <div className="flex items-center mt-2 text-sm text-red-100">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Lien personnel et sécurisé - Expire le {expiryDate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Info */}
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">📋 Documents préparés pour signature</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  Vos documents ont été soigneusement préparés par votre conseiller et sont maintenant prêts pour la
                  signature électronique. Une seule signature validera l'ensemble de vos documents.
                </p>
                <p className="text-xs text-yellow-600">
                  ID Dossier: <span className="font-mono font-medium">{token}</span> | Type: {workflowData.documentType}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Guarantee */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">🛡️ Sécurité garantie</h3>
                <p className="text-sm text-green-700">
                  Votre signature électronique a la même valeur juridique qu'une signature manuscrite selon la
                  législation suisse (SCSE).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progression du dossier</span>
              <span className="text-sm text-gray-500">{currentStep}/5</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Début</span>
              <span>Upload</span>
              <span>Révision</span>
              <span>Signature</span>
              <span>Terminé</span>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        <div className="space-y-6">

          {/* Étape 1: Upload de documents */}
          {currentStep === 1 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                    1
                  </div>
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload de vos documents d'identité
                </CardTitle>
                <CardDescription>
                  Veuillez télécharger vos pièces d'identité pour vérification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader
                  onFilesUploaded={handleFileUpload}
                  acceptedTypes={["image/*", ".pdf"]}
                  maxFiles={3}
                  isSubmitting={isSubmitting}
                />
              </CardContent>
            </Card>
          )}

          {/* Étape 2: Révision des documents */}
          {currentStep === 2 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-sm">
                    2
                  </div>
                  <FileText className="h-5 w-5 text-orange-600" />
                  Révision de votre document
                </CardTitle>
                <CardDescription>
                  Vérifiez le contenu de votre document avant signature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentViewer
                  documentUrl="/documents/sample.pdf"
                  documentName="Lettre de résiliation"
                />
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleDocumentReview} className="bg-orange-600 hover:bg-orange-700">
                    Valider et Continuer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 3: Signature électronique */}
          {currentStep === 3 && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm">
                    3
                  </div>
                  <PenTool className="h-5 w-5 text-purple-600" />
                  Signature électronique
                </CardTitle>
                <CardDescription>
                  Signez électroniquement votre document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DigitalSignature
                  onSignatureComplete={handleSignatureComplete}
                  clientName={workflowData.clientName}
                  isSubmitting={isSubmitting}
                />
              </CardContent>
            </Card>
          )}

          {/* Étape 4: Traitement en cours */}
          {currentStep === 4 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-600 text-white font-bold text-sm">
                    4
                  </div>
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Traitement en cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                  <p className="text-yellow-800 font-medium">Finalisation de votre signature...</p>
                  <p className="text-sm text-yellow-600 mt-2">
                    Génération du document final avec signature intégrée
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 5: Confirmation finale */}
          {currentStep === 5 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold text-sm">
                    5
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Signature terminée avec succès !
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="border-blue-200 bg-blue-50 mb-6">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Confirmation envoyée</strong> - Un email de confirmation a été envoyé à {workflowData.clientEmail}
                  </AlertDescription>
                </Alert>

                {/* Bouton de téléchargement du document signé */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-green-800 mb-2">📄 Votre document signé est prêt</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Téléchargez votre document de résiliation avec signature électronique intégrée.
                  </p>
                  <Button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = `/api/client/download-document?token=${token}&clientId=${token}`
                      link.download = `document-signe-${token}.pdf`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le Document Signé
                  </Button>
                </div>

                {/* Signature du conseiller */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">✍️ Signature de validation</h4>
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">{workflowData.agentName}</p>
                      <p className="text-sm text-gray-600">Conseiller eSignPro</p>
                      <p className="text-xs text-gray-500">
                        Document validé et signé le {new Date().toLocaleDateString('fr-CH')} à {new Date().toLocaleTimeString('fr-CH')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Votre dossier sera transmis à votre compagnie d'assurance dans les 24h.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            <strong>eSignPro</strong> - Signature Électronique Sécurisée
          </p>
          <p>Conforme à la législation suisse (SCSE) - Valeur juridique garantie</p>
        </div>
      </div>
    </div>
  )
}
                <div className="h-12 w-12 bg-purple-600 text-white rounded-full flex items-center justify-center mb-3">
                  <span className="font-bold">3</span>
                </div>
                <h3 className="font-semibold text-purple-900 mb-1">Procédez à votre</h3>
                <p className="text-sm text-purple-700">signature électronique</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="h-12 w-12 bg-green-600 text-white rounded-full flex items-center justify-center mb-3">
                  <span className="font-bold">4</span>
                </div>
                <h3 className="font-semibold text-green-900 mb-1">Recevez la confirmation</h3>
                <p className="text-sm text-green-700">de signature</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <ClientPortalContent clientId={params.clientId} />

        {/* Footer */}
        <Card className="mt-8 bg-gray-50 border-gray-200">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              En utilisant cette plateforme et en procédant à la signature électronique, vous acceptez nos conditions
              d'utilisation et notre politique de confidentialité.
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-500 mb-4">
              <a href="#" className="hover:text-red-600 underline">
                Conditions d'utilisation
              </a>
              <a href="#" className="hover:text-red-600 underline">
                Politique de confidentialité
              </a>
              <a href="#" className="hover:text-red-600 underline">
                Support technique
              </a>
            </div>
            <div className="text-xs text-gray-400 border-t pt-4">
              <p>Cordialement,</p>
              <p className="font-semibold">wael hamda</p>
              <p>Votre conseiller - eSignPro</p>
              <p>Envoyé le 18.08.2025</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
