"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { DigitalSignature } from "@/components/digital-signature"
import { DocumentViewer } from "@/components/document-viewer"
import { FileUploader } from "@/components/file-uploader"
import { Shield, Lock, CheckCircle, AlertTriangle, FileText, Upload, PenTool, Clock } from "lucide-react"
import Image from "next/image"

interface SecureSignatureData {
  token: string
  clientName: string
  agentName: string
  documentType: string
  expiresAt: string
  status: "pending" | "documents_uploaded" | "ready_to_sign" | "signed" | "expired"
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

// Mock data for secure signature session
const mockSecureData: Record<string, SecureSignatureData> = {
  "secure-token-123": {
    token: "secure-token-123",
    clientName: "Marie Dubois",
    agentName: "Wael Hamda",
    documentType: "Résiliation Assurance Auto",
    expiresAt: "2024-08-25T23:59:59",
    status: "pending",
    documents: [
      {
        id: "doc1",
        name: "Lettre de résiliation - Assurance Auto",
        type: "pdf",
        url: "/documents/resiliation-auto.pdf"
      }
    ],
    uploadedFiles: [],
  },
  "demo-signature-token": {
    token: "demo-signature-token",
    clientName: "Client Démo",
    agentName: "Agent Démo",
    documentType: "Résiliation Assurance Habitation",
    expiresAt: "2024-12-31T23:59:59",
    status: "pending",
    documents: [
      {
        id: "doc1",
        name: "Lettre de résiliation - Assurance Habitation",
        type: "pdf",
        url: "/documents/resiliation-habitation.pdf"
      }
    ],
    uploadedFiles: [],
  }
}

export default function SecureSignaturePage() {
  const params = useParams()
  const token = params.token as string
  const [sessionData, setSessionData] = useState<SecureSignatureData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading secure session data
    setTimeout(() => {
      const data = mockSecureData[token]
      if (data) {
        setSessionData(data)
        // Determine current step based on status
        switch (data.status) {
          case "pending":
            setCurrentStep(1)
            break
          case "documents_uploaded":
            setCurrentStep(2)
            break
          case "ready_to_sign":
            setCurrentStep(3)
            break
          case "signed":
            setCurrentStep(4)
            break
        }
      }
      setIsLoading(false)
    }, 1000)
  }, [token])

  const handleFileUpload = (files: { id: string; name: string; type: string; url: string }[]) => {
    if (!sessionData) return

    const newUploadedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      type: file.name.toLowerCase().includes('recto') ? 'id_front' : 
            file.name.toLowerCase().includes('verso') ? 'id_back' : 'additional' as const,
      url: file.url
    }))

    const updatedData = {
      ...sessionData,
      uploadedFiles: [...sessionData.uploadedFiles, ...newUploadedFiles],
      status: newUploadedFiles.length >= 2 ? "ready_to_sign" : "documents_uploaded" as const
    }

    setSessionData(updatedData)
    
    if (updatedData.status === "ready_to_sign") {
      setCurrentStep(3)
    } else {
      setCurrentStep(2)
    }
  }

  const handleSignatureComplete = (signatureData: { signature: string; timestamp: string }) => {
    if (!sessionData) return

    const updatedData = {
      ...sessionData,
      signatureData,
      status: "signed" as const
    }

    setSessionData(updatedData)
    setCurrentStep(4)
  }

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "complete"
    if (step === currentStep) return "current"
    return "pending"
  }

  const isExpired = sessionData && new Date() > new Date(sessionData.expiresAt)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre session sécurisée...</p>
        </div>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Session Invalide</h2>
            <p className="text-gray-600 mb-4">
              Le lien de signature que vous avez utilisé n'est pas valide ou a expiré.
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Session Expirée</h2>
            <p className="text-gray-600 mb-4">
              Votre lien de signature a expiré le {new Date(sessionData.expiresAt).toLocaleDateString('fr-CH')}.
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      {/* Secure Header */}
      <div className="bg-white shadow-sm border-b border-red-200">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/images/esignpro-logo.png" alt="eSignPro" width={150} height={45} className="h-10 w-auto" />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-light text-gray-800 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Signature Électronique Sécurisée
                </h1>
                <p className="text-sm text-gray-600">Session protégée par chiffrement SSL</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-800">
                <Lock className="h-3 w-3 mr-1" />
                Sécurisé
              </Badge>
              <div className="text-right text-sm">
                <p className="font-medium text-gray-900">{sessionData.clientName}</p>
                <p className="text-gray-600">Expire: {new Date(sessionData.expiresAt).toLocaleDateString('fr-CH')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-6">
        {/* Progress Steps */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Processus de Signature</h3>
              <Badge variant="outline">{sessionData.documentType}</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {[
                { step: 1, title: "Vérification", icon: Shield },
                { step: 2, title: "Documents", icon: Upload },
                { step: 3, title: "Signature", icon: PenTool },
                { step: 4, title: "Terminé", icon: CheckCircle }
              ].map(({ step, title, icon: Icon }) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    getStepStatus(step) === "complete" ? "bg-green-600 border-green-600 text-white" :
                    getStepStatus(step) === "current" ? "bg-red-600 border-red-600 text-white" :
                    "bg-gray-100 border-gray-300 text-gray-400"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      getStepStatus(step) === "complete" ? "text-green-600" :
                      getStepStatus(step) === "current" ? "text-red-600" :
                      "text-gray-400"
                    }`}>
                      {title}
                    </p>
                    {step < 4 && (
                      <div className={`h-1 mt-2 rounded-full ${
                        getStepStatus(step + 1) === "complete" || getStepStatus(step + 1) === "current" ? "bg-red-200" : "bg-gray-200"
                      }`} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Vérification de Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Session sécurisée vérifiée</strong> - Votre lien de signature est valide et sécurisé.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <p><strong>Client:</strong> {sessionData.clientName}</p>
                <p><strong>Conseiller:</strong> {sessionData.agentName}</p>
                <p><strong>Type de document:</strong> {sessionData.documentType}</p>
                <p><strong>Expire le:</strong> {new Date(sessionData.expiresAt).toLocaleDateString('fr-CH')}</p>
              </div>

              <Button 
                onClick={() => setCurrentStep(2)} 
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Continuer vers l'upload des documents
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload des Documents d'Identité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploader
                  onFilesUploaded={handleFileUpload}
                  acceptedTypes={["image/jpeg", "image/png", "application/pdf"]}
                  maxFiles={3}
                  instructions="Veuillez télécharger votre pièce d'identité (recto et verso séparément)"
                />
              </CardContent>
            </Card>

            {sessionData.uploadedFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents Téléchargés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sessionData.uploadedFiles.map((file) => (
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
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Document à Signer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentViewer 
                  documentUrl={sessionData.documents[0]?.url} 
                  documentName={sessionData.documents[0]?.name}
                />
              </CardContent>
            </Card>

            <DigitalSignature
              clientName={sessionData.clientName}
              onSignatureComplete={handleSignatureComplete}
              signatureData={sessionData.signatureData}
            />
          </div>
        )}

        {currentStep === 4 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Signature Terminée !</h2>
              <p className="text-gray-600 mb-6">
                Votre document a été signé avec succès le {sessionData.signatureData && new Date(sessionData.signatureData.timestamp).toLocaleString('fr-CH')}.
              </p>
              <Alert className="border-green-200 bg-green-50 mb-6">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Votre dossier sera automatiquement transmis à votre assureur dans les prochaines heures.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-gray-500">
                Vous recevrez une confirmation par email une fois le traitement terminé.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
