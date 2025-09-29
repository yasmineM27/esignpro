"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DocumentViewer } from "./document-viewer"
import { FileUploader } from "./file-uploader"
import { IdentityUploader } from "./identity-uploader"
import { DigitalSignature } from "./digital-signature"
import { CheckCircle, AlertCircle, FileText, Upload, PenTool } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClientPortalContentProps {
  clientId: string
}

interface ClientData {
  nomPrenom: string
  email: string
  documentContent: string
  status: "pending" | "documents_uploaded" | "signed" | "completed"
  uploadedFiles: {
    identityDocuments: string[]
    insuranceContracts: string[]
  }
  signatureData?: {
    signature: string
    timestamp: string
  }
}

export function ClientPortalContent({ clientId }: ClientPortalContentProps) {
  const { toast } = useToast()
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    fetchClientData()
  }, [clientId])

  const fetchClientData = async () => {
    try {
      // Simulate fetching client data
      // In a real app, this would fetch from your database
      const mockData: ClientData = {
        nomPrenom: "Jean Dupont",
        email: "jean.dupont@example.com",
        documentContent: `Nom prénom : Jean Dupont

Adresse: Rue de la Paix 123
Appartement 4B

NPA Ville: 1000 Lausanne

Destinataire: Assura SA, Service Résiliation

Lieu et date : Lausanne, le 19 septembre 2025

Objet : Résiliation de l'assurance maladie et/ou complémentaire

Madame, Monsieur,

Par la présente, je souhaite résilier les contrats d'assurance maladie (LAMal) et d'assurance complémentaire souscrits auprès de votre compagnie pour les personnes suivantes :

1. Nom et prénom : Jean Dupont
○ Date de naissance : 15/03/1985
○ Numéro de police : 123456789

2. Nom et prénom : Marie Dupont
○ Date de naissance : 22/07/1987
○ Numéro de police : 987654321

Conformément aux conditions générales de résiliation et à la réglementation en vigueur, je vous prie de prendre note que la résiliation prendra effet

Pour la lamal à compter de la date de : 31/12/2025

Pour la LCA complémentaires : 31/12/2025

Je vous serais reconnaissant(e) de bien vouloir me confirmer par écrit la réception de cette demande et de m'envoyer un décompte final ainsi qu'une attestation de résiliation.

Signature personnes majeures:

_________________________

Cordialement,
Jean Dupont`,
        status: "pending",
        uploadedFiles: {
          identityDocuments: [],
          insuranceContracts: [],
        },
      }

      setClientData(mockData)
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error fetching client data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dossier.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const updateClientData = (updates: Partial<ClientData>) => {
    if (clientData) {
      setClientData({ ...clientData, ...updates })
    }
  }

  const handleFilesUploaded = (type: "identity" | "insurance", files: string[]) => {
    if (!clientData) return

    const updatedFiles = {
      ...clientData.uploadedFiles,
      [type === "identity" ? "identityDocuments" : "insuranceContracts"]: files,
    }

    updateClientData({
      uploadedFiles: updatedFiles,
      status: "documents_uploaded",
    })

    // Check if we can move to next step
    if (updatedFiles.identityDocuments.length > 0 && updatedFiles.insuranceContracts.length > 0) {
      setCurrentStep(4) // Move to signature step
    }
  }

  const handleIdentityFilesUploaded = (files: { front: string[], back: string[] }) => {
    if (!clientData) return

    // Combine front and back files into identityDocuments
    const allIdentityFiles = [...files.front, ...files.back]

    const updatedFiles = {
      ...clientData.uploadedFiles,
      identityDocuments: allIdentityFiles,
    }

    updateClientData({
      uploadedFiles: updatedFiles,
      status: allIdentityFiles.length >= 2 ? "documents_uploaded" : clientData.status,
    })

    // Check if we can move to next step (need both identity files and insurance contracts)
    if (allIdentityFiles.length >= 2 && updatedFiles.insuranceContracts.length > 0) {
      setCurrentStep(4) // Move to signature step
    }
  }

  const handleSignatureComplete = (signatureData: { signature: string; timestamp: string }) => {
    updateClientData({
      signatureData,
      status: "signed",
    })

    toast({
      title: "Signature enregistrée",
      description: "Votre dossier est maintenant complet et sera traité automatiquement.",
    })

    // Simulate sending to insurance company
    setTimeout(() => {
      updateClientData({ status: "completed" })
      toast({
        title: "Dossier envoyé",
        description: "Votre demande de résiliation a été transmise à votre assureur.",
      })
    }, 2000)
  }

  const getProgressValue = () => {
    if (!clientData) return 0
    switch (clientData.status) {
      case "pending":
        return 25
      case "documents_uploaded":
        return 75
      case "signed":
        return 90
      case "completed":
        return 100
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement de votre dossier...</span>
      </div>
    )
  }

  if (!clientData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Dossier introuvable. Vérifiez que le lien est correct ou contactez votre conseiller.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progression du Dossier</span>
            <span className="text-sm font-normal text-gray-600">{getProgressValue()}% complété</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={getProgressValue()} className="w-full" />
          <div className="mt-2 text-sm text-gray-600">
            {clientData.status === "completed" ? (
              <span className="text-green-600 font-medium">✓ Dossier envoyé à votre assureur</span>
            ) : clientData.status === "signed" ? (
              <span className="text-blue-600 font-medium">Document signé - Envoi en cours...</span>
            ) : clientData.status === "documents_uploaded" ? (
              <span className="text-orange-600 font-medium">Documents uploadés - Signature requise</span>
            ) : (
              <span className="text-gray-600">En attente de vos documents</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Document Viewer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
              1
            </div>
            <FileText className="h-5 w-5 text-blue-600" />
            Votre Document de Résiliation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentViewer content={clientData.documentContent} clientId={clientId} />
        </CardContent>
      </Card>

      {/* Step 2 & 3: File Upload */}
      {clientData.status !== "completed" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                  2
                </div>
                <Upload className="h-5 w-5 text-orange-600" />
                Pièce d'Identité (Recto/Verso)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IdentityUploader
                onFilesUploaded={handleIdentityFilesUploaded}
                uploadedFiles={{
                  front: clientData.uploadedFiles.identityDocuments.slice(0, 1),
                  back: clientData.uploadedFiles.identityDocuments.slice(1, 2)
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                  3
                </div>
                <Upload className="h-5 w-5 text-purple-600" />
                Contrats d'Assurance Maladie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">📄 Documents requis :</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Contrat d'assurance maladie de base (LAMal)</li>
                    <li>• Contrats d'assurance complémentaire (LCA)</li>
                    <li>• Polices d'assurance actuelles</li>
                    <li>• Tout autre document d'assurance pertinent</li>
                  </ul>
                </div>

                <FileUploader
                  type="insurance"
                  onFilesUploaded={(files) => handleFilesUploaded("insurance", files)}
                  uploadedFiles={clientData.uploadedFiles.insuranceContracts}
                  acceptedTypes={[".pdf"]}
                  maxFiles={5}
                  description="Téléchargez vos contrats d'assurance maladie et complémentaire (format PDF uniquement)"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Step 4: Digital Signature */}
      {clientData.uploadedFiles.identityDocuments.length >= 2 &&
        clientData.status !== "completed" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm">
                  4
                </div>
                <PenTool className="h-5 w-5 text-red-600" />
                Signature Électronique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DigitalSignature
                clientName={clientData.nomPrenom}
                onSignatureComplete={handleSignatureComplete}
                signatureData={clientData.signatureData}
              />
            </CardContent>
          </Card>
        )}

      {/* Completion Message */}
      {clientData.status === "completed" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Félicitations !</strong> Votre demande de résiliation a été transmise avec succès à votre compagnie
            d'assurance. Vous recevrez une confirmation par email dans les prochaines 24 heures.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
