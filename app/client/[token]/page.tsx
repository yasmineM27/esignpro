"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

// Mock data for client workflow
const mockClientData: Record<string, ClientWorkflowData> = {
  "client-demo-token": {
    token: "client-demo-token",
    clientName: "Marie Dubois",
    clientEmail: "marie.dubois@email.com",
    agentName: "Wael Hamda",
    agentEmail: "wael.hamda@esignpro.ch",
    documentType: "Résiliation Assurance Auto",
    createdAt: "2024-01-15T10:00:00",
    expiresAt: "2024-02-15T23:59:59",
    status: "email_sent",
    documents: [
      {
        id: "doc1",
        name: "Lettre de résiliation - Assurance Auto",
        type: "pdf",
        url: "/documents/resiliation-auto.pdf"
      }
    ],
    uploadedFiles: [],
  }
}

export default function ClientWorkflowPage() {
  const params = useParams()
  const token = params.token as string
  const [workflowData, setWorkflowData] = useState<ClientWorkflowData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading client workflow data
    setTimeout(() => {
      let data = mockClientData[token]

      // If token is not in mock data but starts with "SECURE_", create dynamic mock data
      if (!data && token.startsWith('SECURE_')) {
        data = {
          token,
          clientName: "Client eSignPro",
          clientEmail: "yasminemassaoudi27@gmail.com",
          agentName: "Wael Hamda",
          agentEmail: "wael.hamda@esignpro.ch",
          documentType: "Résiliation Assurance",
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          status: "email_sent" as const,
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
      }

      if (data) {
        setWorkflowData(data)
        // Determine current step based on status
        switch (data.status) {
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
          case "completed":
            setCurrentStep(4)
            break
        }
      }
      setIsLoading(false)
    }, 1000)
  }, [token])

  const handleFileUpload = (files: { id: string; name: string; type: string; url: string }[]) => {
    if (!workflowData) return

    const newUploadedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      type: file.name.toLowerCase().includes('recto') ? 'id_front' : 
            file.name.toLowerCase().includes('verso') ? 'id_back' : 'additional' as const,
      url: file.url
    }))

    const updatedData = {
      ...workflowData,
      uploadedFiles: newUploadedFiles,
      status: newUploadedFiles.length >= 1 ? "documents_uploaded" : workflowData.status as const
    }

    setWorkflowData(updatedData)

    if (updatedData.status === "documents_uploaded") {
      setCurrentStep(2)
    }
  }

  const handleDocumentReviewed = () => {
    if (!workflowData) return

    const updatedData = {
      ...workflowData,
      status: "document_reviewed" as const
    }

    setWorkflowData(updatedData)
    setCurrentStep(3)
  }

  const handleSignatureComplete = (signatureData: { signature: string; timestamp: string }) => {
    if (!workflowData) return

    const updatedData = {
      ...workflowData,
      signatureData,
      status: "signed" as const
    }

    setWorkflowData(updatedData)
    setCurrentStep(4)
  }

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "complete"
    if (step === currentStep) return "current"
    return "pending"
  }

  const getProgressPercentage = () => {
    return (currentStep / 4) * 100
  }

  const isExpired = workflowData && new Date() > new Date(workflowData.expiresAt)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre dossier...</p>
        </div>
      </div>
    )
  }

  if (!workflowData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Lien Invalide</h2>
            <p className="text-gray-600 mb-4">
              Le lien que vous avez utilisé n'est pas valide ou a expiré.
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
              Votre lien a expiré le {new Date(workflowData.expiresAt).toLocaleDateString('fr-CH')}.
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
                <p className="text-sm text-gray-600">Espace Client - Finalisation de votre dossier</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-1" />
                {workflowData.clientName}
              </p>
              <p className="text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Expire: {new Date(workflowData.expiresAt).toLocaleDateString('fr-CH')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-6">
        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Progression de votre dossier</h3>
              <Badge variant="outline">{workflowData.documentType}</Badge>
            </div>
            
            <div className="space-y-4">
              <Progress value={getProgressPercentage()} className="h-2" />
              
              <div className="grid grid-cols-4 gap-4">
                {[
                  { step: 1, title: "Documents d'identité", icon: Upload },
                  { step: 2, title: "Révision", icon: FileText },
                  { step: 3, title: "Signature", icon: PenTool },
                  { step: 4, title: "Terminé", icon: CheckCircle }
                ].map(({ step, title, icon: Icon }) => (
                  <div key={step} className="text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 ${
                      getStepStatus(step) === "complete" ? "bg-green-600 border-green-600 text-white" :
                      getStepStatus(step) === "current" ? "bg-blue-600 border-blue-600 text-white" :
                      "bg-gray-100 border-gray-300 text-gray-400"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className={`text-sm font-medium ${
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
                <p><strong>Votre conseiller:</strong> {workflowData.agentName}</p>
                <p><strong>Type de dossier:</strong> {workflowData.documentType}</p>
                <p><strong>Créé le:</strong> {new Date(workflowData.createdAt).toLocaleDateString('fr-CH')}</p>
              </div>

              <FileUploader
                onFilesUploaded={handleFileUpload}
                acceptedTypes={["image/jpeg", "image/png", "application/pdf"]}
                maxFiles={3}
                instructions="Veuillez télécharger votre pièce d'identité (recto et verso séparément) ainsi que tout document complémentaire requis."
              />

              {workflowData.uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Documents téléchargés :</h4>
                  {workflowData.uploadedFiles.map((file) => (
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

              {workflowData.uploadedFiles.length >= 1 && (
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
              documentUrl={workflowData.documents[0]?.url} 
              documentName={workflowData.documents[0]?.name}
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
          <DigitalSignature
            clientName={workflowData.clientName}
            onSignatureComplete={handleSignatureComplete}
            signatureData={workflowData.signatureData}
          />
        )}

        {currentStep === 4 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Dossier Terminé !</h2>
              <p className="text-gray-600 mb-6">
                Votre dossier de {workflowData.documentType.toLowerCase()} a été finalisé avec succès.
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

              <Alert className="border-blue-200 bg-blue-50">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Confirmation envoyée</strong> - Un email de confirmation a été envoyé à {workflowData.clientEmail}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
