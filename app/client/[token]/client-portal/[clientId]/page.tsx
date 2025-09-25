"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
  Calendar
} from "lucide-react"
import Image from "next/image"

interface ClientPortalData {
  token: string
  clientId: string
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

export default function ClientPortalPage() {
  const params = useParams()
  const token = params.token as string
  const clientId = params.clientId as string
  const [portalData, setPortalData] = useState<ClientPortalData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 Portail Client - Token:', token, 'ClientId:', clientId)
    
    // Valider le token via API
    const validateAndLoadData = async () => {
      try {
        const response = await fetch(`/api/client/validate-token?token=${encodeURIComponent(token)}`)
        const result = await response.json()
        
        if (result.valid && result.data) {
          const apiData = result.data
          const data: ClientPortalData = {
            token,
            clientId,
            clientName: apiData.clientName,
            clientEmail: apiData.clientEmail,
            agentName: apiData.agentName,
            agentEmail: apiData.agentEmail,
            documentType: apiData.documentType,
            createdAt: apiData.createdAt || new Date().toISOString(),
            expiresAt: apiData.expiresAt,
            status: apiData.status as any || "email_sent",
            documents: [
              {
                id: "doc1",
                name: `Document - ${apiData.documentType}`,
                type: "pdf",
                url: "/documents/document-generated.pdf"
              }
            ],
            uploadedFiles: [],
          }
          
          setPortalData(data)
          console.log('✅ Données portail chargées:', data)
        } else {
          // Fallback avec données mock
          const mockData: ClientPortalData = {
            token,
            clientId,
            clientName: "Client eSignPro",
            clientEmail: "yasminemassaoudi27@gmail.com",
            agentName: "Wael Hamda",
            agentEmail: "wael.hamda@esignpro.ch",
            documentType: "Résiliation Assurance",
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: "email_sent",
            documents: [
              {
                id: "doc1",
                name: "Lettre de résiliation - Assurance",
                type: "pdf",
                url: "/documents/resiliation-assurance.pdf"
              }
            ],
            uploadedFiles: [],
          }
          setPortalData(mockData)
          console.log('📝 Utilisation des données mock')
        }
      } catch (error) {
        console.error('❌ Erreur validation token:', error)
      } finally {
        setIsLoading(false)
      }
    }

    validateAndLoadData()
  }, [token, clientId])

  const handleFileUpload = (files: { id: string; name: string; type: string; url: string }[]) => {
    if (!portalData) return

    const newUploadedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      type: (file.name.toLowerCase().includes('recto') ? 'id_front' :
            file.name.toLowerCase().includes('verso') ? 'id_back' : 'additional') as "id_front" | "id_back" | "additional",
      url: file.url
    }))

    const updatedData = {
      ...portalData,
      uploadedFiles: newUploadedFiles,
      status: newUploadedFiles.length >= 1 ? "documents_uploaded" : portalData.status
    }

    setPortalData(updatedData)

    if (updatedData.status === "documents_uploaded") {
      setCurrentStep(2)
    }
  }

  const handleDocumentReviewed = () => {
    if (!portalData) return

    const updatedData = {
      ...portalData,
      status: "document_reviewed" as const
    }

    setPortalData(updatedData)
    setCurrentStep(3)
  }

  const handleSignatureComplete = (signatureData: { signature: string; timestamp: string }) => {
    if (!portalData) return

    const updatedData = {
      ...portalData,
      signatureData,
      status: "signed" as const
    }

    setPortalData(updatedData)
    setCurrentStep(4)

    // Simuler l'envoi de confirmation après 2 secondes
    setTimeout(() => {
      setPortalData(prev => prev ? { ...prev, status: "completed" } : null)
      setCurrentStep(5)
    }, 2000)
  }

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "complete"
    if (step === currentStep) return "current"
    return "pending"
  }

  const getProgressPercentage = () => {
    return (currentStep / 5) * 100
  }

  const isExpired = portalData && new Date() > new Date(portalData.expiresAt)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre portail sécurisé...</p>
        </div>
      </div>
    )
  }

  if (!portalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès Refusé</h2>
            <p className="text-gray-600 mb-4">
              Impossible d'accéder à ce portail client.
            </p>
            <p className="text-sm text-gray-500">
              Veuillez contacter votre conseiller pour obtenir un nouveau lien.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Lien Expiré</h2>
            <p className="text-gray-600 mb-4">
              Votre lien a expiré le {new Date(portalData.expiresAt).toLocaleDateString('fr-CH')}.
            </p>
            <p className="text-sm text-gray-500">
              Veuillez contacter votre conseiller pour obtenir un nouveau lien.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-200">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/images/esignpro-logo.png" alt="eSignPro" width={150} height={45} className="h-10 w-auto" />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-light text-gray-800 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  Signature Électronique Sécurisée
                </h1>
                <p className="text-sm text-gray-600">Portail Client - Finalisation de votre dossier</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-1" />
                {portalData.clientName}
              </p>
              <p className="text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Expire: {new Date(portalData.expiresAt).toLocaleDateString('fr-CH')}
              </p>
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
                <h2 className="text-xl font-semibold mb-1">Bonjour {portalData.clientName},</h2>
                <p className="text-red-100">
                  Votre conseiller vous invite à finaliser la signature électronique de vos documents via notre
                  plateforme sécurisée.
                </p>
                <div className="flex items-center mt-2 text-sm text-red-100">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Lien personnel et sécurisé - Expire le {new Date(portalData.expiresAt).toLocaleDateString('fr-CH')}</span>
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
                  ID Dossier: <span className="font-mono font-medium">{clientId}</span>
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

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Progression de votre dossier</h3>
              <Badge variant="outline">{portalData.documentType}</Badge>
            </div>
            
            <div className="space-y-4">
              <Progress value={getProgressPercentage()} className="h-2" />
              
              <div className="grid grid-cols-5 gap-2">
                {[
                  { step: 1, title: "Documents", icon: Upload },
                  { step: 2, title: "Révision", icon: FileText },
                  { step: 3, title: "Signature", icon: PenTool },
                  { step: 4, title: "Envoi", icon: Mail },
                  { step: 5, title: "Terminé", icon: CheckCircle }
                ].map(({ step, title, icon: Icon }) => (
                  <div key={step} className="text-center">
                    <div className={`mx-auto w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${
                      getStepStatus(step) === "complete" ? "bg-green-600 border-green-600 text-white" :
                      getStepStatus(step) === "current" ? "bg-blue-600 border-blue-600 text-white" :
                      "bg-gray-100 border-gray-300 text-gray-400"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className={`text-xs font-medium ${
                      getStepStatus(step) === "complete" ? "text-green-600" :
                      getStepStatus(step) === "current" ? "text-blue-600" :
                      "text-gray-400"
                    }`}>
                      {title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload de vos Documents d'Identité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Sécurité garantie</strong> - Vos documents sont chiffrés et sécurisés.
                  Ils ne seront utilisés que pour la vérification de votre identité.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p><strong>Votre conseiller:</strong> {portalData.agentName}</p>
                <p><strong>Type de dossier:</strong> {portalData.documentType}</p>
                <p><strong>Créé le:</strong> {new Date(portalData.createdAt).toLocaleDateString('fr-CH')}</p>
              </div>

              <FileUploader
                onFilesUploaded={handleFileUpload}
                acceptedTypes={["image/jpeg", "image/png", "application/pdf"]}
                maxFiles={3}
                instructions="Veuillez télécharger votre pièce d'identité (recto et verso séparément) ainsi que tout document complémentaire requis."
              />

              {portalData.uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Documents téléchargés :</h4>
                  {portalData.uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Téléchargé
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {portalData.uploadedFiles.length >= 1 && (
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Continuer vers la révision du document
                </Button>
              )}

              {/* Demo skip button */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">🎯 Pour la démonstration :</p>
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  Passer directement à la révision (démo)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <DocumentViewer
              documentUrl={portalData.documents[0]?.url}
              documentName={portalData.documents[0]?.name}
            />

            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Document Révisé</h3>
                <p className="text-gray-600 mb-4">
                  Avez-vous lu et compris le contenu du document ?
                </p>
                <Button
                  onClick={handleDocumentReviewed}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Oui, j'ai lu et je souhaite procéder à la signature
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PenTool className="mr-2 h-5 w-5" />
                Signature Électronique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DigitalSignature
                clientName={portalData.clientName}
                onSignatureComplete={handleSignatureComplete}
                signatureData={portalData.signatureData}
              />
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-semibold mb-4">Envoi en cours...</h2>
              <p className="text-gray-600 mb-6">
                Votre dossier signé est en cours de transmission à votre assureur.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Signature enregistrée</strong> - Votre signature électronique a été validée avec succès.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 5 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Dossier Terminé !</h2>
              <p className="text-gray-600 mb-6">
                Votre dossier de {portalData.documentType.toLowerCase()} a été finalisé avec succès.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-green-800 mb-2">Prochaines étapes :</h4>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Votre dossier sera transmis à votre assureur dans les 24h</li>
                  <li>• Vous recevrez une confirmation par email</li>
                  <li>• Un certificat de résiliation vous sera envoyé</li>
                  <li>• Le remboursement éventuel sera traité automatiquement</li>
                </ul>
              </div>

              <Alert className="border-blue-200 bg-blue-50 mb-6">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Confirmation envoyée</strong> - Un email de confirmation a été envoyé à {portalData.clientEmail}
                </AlertDescription>
              </Alert>

              {/* Signature du conseiller */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">Cordialement,</p>
                  <p className="font-semibold text-gray-800 text-lg">{portalData.agentName}</p>
                  <p className="text-gray-600">Votre conseiller - eSignPro</p>
                  <p className="text-gray-500 mt-2">
                    Email: {portalData.agentEmail}
                  </p>
                  <p className="text-gray-500">
                    Traité le {new Date().toLocaleDateString('fr-CH')} à {new Date().toLocaleTimeString('fr-CH')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Card className="mt-8 bg-gray-50 border-gray-200">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              En utilisant cette plateforme et en procédant à la signature électronique, vous acceptez nos conditions
              d'utilisation et notre politique de confidentialité.
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-500 mb-4">
              <a href="/terms" className="hover:text-red-600 underline">
                Conditions d'utilisation
              </a>
              <a href="/privacy" className="hover:text-red-600 underline">
                Politique de confidentialité
              </a>
              <a href="/help" className="hover:text-red-600 underline">
                Support technique
              </a>
            </div>
            <div className="text-xs text-gray-400 border-t pt-4">
              <p>© 2024 eSignPro - Signature électronique sécurisée</p>
              <p>Conforme à la législation suisse (SCSE)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
