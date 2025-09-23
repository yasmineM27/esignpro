"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  Download, 
  Eye, 
  FileText, 
  User, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CompletedCase {
  id: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  clientAddress?: string
  caseNumber: string
  insuranceType: string
  insuranceCompany: string
  policyNumber: string
  status: 'documents_uploaded' | 'signed' | 'completed'
  createdAt: string
  completedAt?: string
  documents: {
    identityFront?: string
    identityBack?: string
    insuranceContracts: string[]
    signature?: string
  }
  signatureTimestamp?: string
}

// Mock data pour la démonstration
const mockCompletedCases: CompletedCase[] = [
  {
    id: "CLI_001",
    clientName: "Marie Dubois",
    clientEmail: "marie.dubois@email.com",
    clientPhone: "+41 79 123 45 67",
    clientAddress: "Rue de la Paix 123, 1000 Lausanne",
    caseNumber: "RES-2024-001",
    insuranceType: "Résiliation Assurance Maladie",
    insuranceCompany: "CSS Assurance",
    policyNumber: "CSS-789456123",
    status: "signed",
    createdAt: "2024-01-15T10:30:00Z",
    completedAt: "2024-01-16T14:20:00Z",
    documents: {
      identityFront: "/uploads/marie_id_front.jpg",
      identityBack: "/uploads/marie_id_back.jpg",
      insuranceContracts: ["/uploads/marie_css_contract.pdf"],
      signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    },
    signatureTimestamp: "2024-01-16T14:20:00Z"
  },
  {
    id: "CLI_002",
    clientName: "Jean Martin",
    clientEmail: "jean.martin@email.com",
    clientPhone: "+41 78 987 65 43",
    clientAddress: "Avenue des Alpes 456, 1820 Montreux",
    caseNumber: "RES-2024-002",
    insuranceType: "Résiliation Assurance Maladie",
    insuranceCompany: "Groupe Mutuel",
    policyNumber: "GM-456789012",
    status: "completed",
    createdAt: "2024-01-14T09:15:00Z",
    completedAt: "2024-01-15T16:45:00Z",
    documents: {
      identityFront: "/uploads/jean_id_front.jpg",
      identityBack: "/uploads/jean_id_back.jpg",
      insuranceContracts: ["/uploads/jean_gm_contract.pdf", "/uploads/jean_gm_complementaire.pdf"],
      signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    },
    signatureTimestamp: "2024-01-15T16:45:00Z"
  }
]

export function AgentCompletedCases() {
  const { toast } = useToast()
  const [cases, setCases] = useState<CompletedCase[]>([])
  const [selectedCase, setSelectedCase] = useState<CompletedCase | null>(null)
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false)

  useEffect(() => {
    // Simuler le chargement des dossiers complétés
    setCases(mockCompletedCases)
  }, [])

  const handleViewCase = (caseItem: CompletedCase) => {
    setSelectedCase(caseItem)
  }

  const handleGenerateFinalDocument = async (caseItem: CompletedCase) => {
    setIsGeneratingDocument(true)
    
    try {
      // Simuler la génération du document final avec signature
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Document généré",
        description: `Le document final pour ${caseItem.clientName} a été généré avec succès.`,
      })

      // Mettre à jour le statut du dossier
      setCases(prev => prev.map(c => 
        c.id === caseItem.id 
          ? { ...c, status: 'completed' as const }
          : c
      ))

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le document final.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingDocument(false)
    }
  }

  const getStatusBadge = (status: CompletedCase['status']) => {
    switch (status) {
      case 'documents_uploaded':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Documents reçus</Badge>
      case 'signed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Signé</Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Terminé</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  if (selectedCase) {
    return (
      <div className="space-y-6">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCase(null)}
            className="mb-4"
          >
            ← Retour à la liste
          </Button>
          <div className="flex gap-2">
            {selectedCase.status === 'signed' && (
              <Button
                onClick={() => handleGenerateFinalDocument(selectedCase)}
                disabled={isGeneratingDocument}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGeneratingDocument ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Générer Document Final
                  </>
                )}
              </Button>
            )}
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger Tout
            </Button>
          </div>
        </div>

        {/* Détails du dossier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dossier {selectedCase.caseNumber} - {selectedCase.clientName}
              {getStatusBadge(selectedCase.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations client */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations Client
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>Nom :</strong> {selectedCase.clientName}</p>
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedCase.clientEmail}
                  </p>
                  {selectedCase.clientPhone && (
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedCase.clientPhone}
                    </p>
                  )}
                  {selectedCase.clientAddress && (
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedCase.clientAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Informations Assurance
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>Type :</strong> {selectedCase.insuranceType}</p>
                  <p><strong>Compagnie :</strong> {selectedCase.insuranceCompany}</p>
                  <p className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Police : {selectedCase.policyNumber}
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Créé : {new Date(selectedCase.createdAt).toLocaleDateString('fr-CH')}
                  </p>
                  {selectedCase.completedAt && (
                    <p className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Complété : {new Date(selectedCase.completedAt).toLocaleDateString('fr-CH')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents Reçus
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pièce d'identité */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h5 className="font-medium mb-2">Pièce d'Identité</h5>
                    <div className="space-y-2">
                      {selectedCase.documents.identityFront && (
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir Recto
                        </Button>
                      )}
                      {selectedCase.documents.identityBack && (
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir Verso
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Contrats d'assurance */}
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <h5 className="font-medium mb-2">Contrats d'Assurance</h5>
                    <div className="space-y-2">
                      {selectedCase.documents.insuranceContracts.map((contract, index) => (
                        <Button key={index} variant="outline" size="sm" className="w-full">
                          <Eye className="h-3 w-3 mr-1" />
                          Contrat {index + 1}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Signature */}
                {selectedCase.documents.signature && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <h5 className="font-medium mb-2">Signature Électronique</h5>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir Signature
                        </Button>
                        {selectedCase.signatureTimestamp && (
                          <p className="text-xs text-gray-600">
                            Signée le {new Date(selectedCase.signatureTimestamp).toLocaleString('fr-CH')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Actions */}
            {selectedCase.status === 'completed' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Dossier terminé !</strong> Le document final a été généré et peut être envoyé à la compagnie d'assurance.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dossiers Complétés</h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {cases.length} dossier{cases.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {cases.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun dossier complété</h3>
            <p className="text-gray-500">Les dossiers signés par vos clients apparaîtront ici.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cases.map((caseItem) => (
            <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{caseItem.clientName}</h3>
                      {getStatusBadge(caseItem.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Dossier :</strong> {caseItem.caseNumber}</p>
                        <p><strong>Email :</strong> {caseItem.clientEmail}</p>
                      </div>
                      <div>
                        <p><strong>Assurance :</strong> {caseItem.insuranceCompany}</p>
                        <p><strong>Police :</strong> {caseItem.policyNumber}</p>
                      </div>
                      <div>
                        <p><strong>Créé :</strong> {new Date(caseItem.createdAt).toLocaleDateString('fr-CH')}</p>
                        {caseItem.completedAt && (
                          <p><strong>Complété :</strong> {new Date(caseItem.completedAt).toLocaleDateString('fr-CH')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleViewCase(caseItem)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir Détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
