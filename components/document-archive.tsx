"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Archive, 
  Search, 
  Download, 
  Send, 
  Eye, 
  Calendar,
  Building,
  User,
  FileText,
  CheckCircle,
  Clock,
  Mail
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ArchivedDocument {
  id: string
  caseNumber: string
  clientName: string
  clientEmail: string
  insuranceCompany: string
  policyNumber: string
  documentType: string
  createdAt: string
  archivedAt: string
  status: 'archived' | 'sent_to_insurer' | 'confirmed_by_insurer'
  finalDocumentUrl: string
  originalDocumentUrl: string
  agentName: string
  notes?: string
}

// Mock data pour la démonstration
const mockArchivedDocuments: ArchivedDocument[] = [
  {
    id: "ARC_001",
    caseNumber: "RES-2024-001",
    clientName: "Marie Dubois",
    clientEmail: "marie.dubois@email.com",
    insuranceCompany: "CSS Assurance",
    policyNumber: "CSS-789456123",
    documentType: "Résiliation Assurance Maladie",
    createdAt: "2024-01-15T10:30:00Z",
    archivedAt: "2024-01-16T15:45:00Z",
    status: "confirmed_by_insurer",
    finalDocumentUrl: "/archive/RES-2024-001_Marie_Dubois_FINAL.docx",
    originalDocumentUrl: "/archive/RES-2024-001_Marie_Dubois_ORIGINAL.docx",
    agentName: "wael hamda",
    notes: "Résiliation confirmée par CSS le 17.01.2024"
  },
  {
    id: "ARC_002",
    caseNumber: "RES-2024-002",
    clientName: "Jean Martin",
    clientEmail: "jean.martin@email.com",
    insuranceCompany: "Groupe Mutuel",
    policyNumber: "GM-456789012",
    documentType: "Résiliation Assurance Maladie",
    createdAt: "2024-01-14T09:15:00Z",
    archivedAt: "2024-01-15T17:20:00Z",
    status: "sent_to_insurer",
    finalDocumentUrl: "/archive/RES-2024-002_Jean_Martin_FINAL.docx",
    originalDocumentUrl: "/archive/RES-2024-002_Jean_Martin_ORIGINAL.docx",
    agentName: "wael hamda",
    notes: "Envoyé à Groupe Mutuel le 16.01.2024"
  },
  {
    id: "ARC_003",
    caseNumber: "RES-2024-003",
    clientName: "Sophie Laurent",
    clientEmail: "sophie.laurent@email.com",
    insuranceCompany: "Allianz Suisse",
    policyNumber: "ALZ-123789456",
    documentType: "Résiliation Assurance Maladie",
    createdAt: "2024-01-13T14:20:00Z",
    archivedAt: "2024-01-14T11:30:00Z",
    status: "archived",
    finalDocumentUrl: "/archive/RES-2024-003_Sophie_Laurent_FINAL.docx",
    originalDocumentUrl: "/archive/RES-2024-003_Sophie_Laurent_ORIGINAL.docx",
    agentName: "wael hamda"
  }
]

export function DocumentArchive() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<ArchivedDocument[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [insuranceFilter, setInsuranceFilter] = useState("all")
  const [selectedDocument, setSelectedDocument] = useState<ArchivedDocument | null>(null)

  useEffect(() => {
    // Simuler le chargement des documents archivés
    setDocuments(mockArchivedDocuments)
  }, [])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    const matchesInsurance = insuranceFilter === "all" || doc.insuranceCompany === insuranceFilter
    
    return matchesSearch && matchesStatus && matchesInsurance
  })

  const handleSendToInsurer = async (document: ArchivedDocument) => {
    try {
      // Simuler l'envoi à l'assureur
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, status: 'sent_to_insurer' as const, notes: `Envoyé à ${doc.insuranceCompany} le ${new Date().toLocaleDateString('fr-CH')}` }
          : doc
      ))

      toast({
        title: "Document envoyé",
        description: `Le document de ${document.clientName} a été envoyé à ${document.insuranceCompany}.`,
      })

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le document à l'assureur.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadDocument = (document: ArchivedDocument, type: 'final' | 'original') => {
    const url = type === 'final' ? document.finalDocumentUrl : document.originalDocumentUrl
    toast({
      title: "Téléchargement",
      description: `Téléchargement du document ${type === 'final' ? 'final' : 'original'} de ${document.clientName}...`,
    })
    // Ici, on déclencherait le téléchargement réel
  }

  const getStatusBadge = (status: ArchivedDocument['status']) => {
    switch (status) {
      case 'archived':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Archivé</Badge>
      case 'sent_to_insurer':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Envoyé assureur</Badge>
      case 'confirmed_by_insurer':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Confirmé assureur</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const getUniqueInsuranceCompanies = () => {
    return [...new Set(documents.map(doc => doc.insuranceCompany))]
  }

  if (selectedDocument) {
    return (
      <div className="space-y-6">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedDocument(null)}
            className="mb-4"
          >
            ← Retour à l'archive
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleDownloadDocument(selectedDocument, 'original')}
            >
              <Download className="h-4 w-4 mr-2" />
              Document Original
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDownloadDocument(selectedDocument, 'final')}
            >
              <Download className="h-4 w-4 mr-2" />
              Document Final
            </Button>
            {selectedDocument.status === 'archived' && (
              <Button
                onClick={() => handleSendToInsurer(selectedDocument)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Envoyer à l'Assureur
              </Button>
            )}
          </div>
        </div>

        {/* Détails du document */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Document Archivé - {selectedDocument.caseNumber}
              {getStatusBadge(selectedDocument.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations Client
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Nom :</strong> {selectedDocument.clientName}</p>
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedDocument.clientEmail}
                  </p>
                  <p><strong>Numéro de police :</strong> {selectedDocument.policyNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Informations Assurance
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Compagnie :</strong> {selectedDocument.insuranceCompany}</p>
                  <p><strong>Type :</strong> {selectedDocument.documentType}</p>
                  <p><strong>Agent :</strong> {selectedDocument.agentName}</p>
                </div>
              </div>
            </div>

            {/* Dates importantes */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Historique
              </h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <strong>Créé le :</strong> {new Date(selectedDocument.createdAt).toLocaleString('fr-CH')}
                </p>
                <p className="flex items-center gap-2">
                  <Archive className="h-3 w-3" />
                  <strong>Archivé le :</strong> {new Date(selectedDocument.archivedAt).toLocaleString('fr-CH')}
                </p>
              </div>
            </div>

            {/* Notes */}
            {selectedDocument.notes && (
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm">{selectedDocument.notes}</p>
                </div>
              </div>
            )}

            {/* Status spécifique */}
            {selectedDocument.status === 'confirmed_by_insurer' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Traitement terminé !</strong> Ce document a été confirmé par l'assureur et le dossier est clos.
                </AlertDescription>
              </Alert>
            )}

            {selectedDocument.status === 'sent_to_insurer' && (
              <Alert className="border-orange-200 bg-orange-50">
                <Clock className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>En attente de confirmation.</strong> Le document a été envoyé à l'assureur et nous attendons leur confirmation.
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
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Archive className="h-6 w-6" />
          Archive des Documents
        </h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, dossier, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
                <SelectItem value="sent_to_insurer">Envoyé assureur</SelectItem>
                <SelectItem value="confirmed_by_insurer">Confirmé assureur</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={insuranceFilter} onValueChange={setInsuranceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Compagnie d'assurance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les compagnies</SelectItem>
                {getUniqueInsuranceCompanies().map((company) => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des documents */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun document archivé</h3>
            <p className="text-gray-500">Les documents finalisés apparaîtront ici après archivage.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{document.clientName}</h3>
                      {getStatusBadge(document.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Dossier :</strong> {document.caseNumber}</p>
                        <p><strong>Email :</strong> {document.clientEmail}</p>
                      </div>
                      <div>
                        <p><strong>Assurance :</strong> {document.insuranceCompany}</p>
                        <p><strong>Police :</strong> {document.policyNumber}</p>
                      </div>
                      <div>
                        <p><strong>Archivé :</strong> {new Date(document.archivedAt).toLocaleDateString('fr-CH')}</p>
                        <p><strong>Agent :</strong> {document.agentName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDocument(document)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir Détails
                    </Button>
                    {document.status === 'archived' && (
                      <Button
                        onClick={() => handleSendToInsurer(document)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer
                      </Button>
                    )}
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
