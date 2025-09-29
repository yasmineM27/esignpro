"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  User,
  Calendar,
  Mail,
  Phone,
  Building,
  Signature,
  Download,
  Send,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SignatureData {
  id: string
  signatureData: string
  signedAt: string
  isValid: boolean
  ipAddress: string
  userAgent: string
  validationStatus: 'signed' | 'validated' | 'rejected'
  validatedAt?: string
  validatedBy?: string
  validationNotes?: string
  case: {
    id: string
    caseNumber: string
    status: string
    secureToken: string
    insuranceCompany: string
    insuranceType: string
    policyNumber: string
    createdAt: string
    completedAt?: string
    client: {
      id: string
      firstName: string
      lastName: string
      email: string
      phone?: string
    }
  }
}

interface Template {
  id: string
  name: string
  category: string
  description: string
  variables: string[]
  content: string
  isActive: boolean
  usageCount: number
  lastUsed: string
}

export function AgentCompleted() {
  const { toast } = useToast()
  const [signatures, setSignatures] = useState<SignatureData[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedSignature, setSelectedSignature] = useState<SignatureData | null>(null)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [validationNotes, setValidationNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showTemplateSelection, setShowTemplateSelection] = useState(false)
  const [generatedDocuments, setGeneratedDocuments] = useState<any[]>([])

  // Charger les signatures en attente de validation
  useEffect(() => {
    loadSignatures()
    loadTemplates()
  }, [])

  const loadSignatures = async () => {
    try {
      const response = await fetch('/api/agent/signatures?status=signed')
      const data = await response.json()

      if (data.success) {
        setSignatures(data.signatures)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les signatures",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur chargement signatures:', error)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/agent/templates')
      const data = await response.json()

      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error)
    }
  }

  const handleValidateSignature = async (signatureId: string, action: 'validate' | 'reject') => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/agent/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatureId,
          action,
          notes: validationNotes,
          agentId: 'agent-001' // TODO: Récupérer l'ID de l'agent connecté
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: action === 'validate' ? "Signature validée" : "Signature rejetée",
          description: `La signature de ${result.signature.clientName} a été ${action === 'validate' ? 'validée' : 'rejetée'}.`,
        })

        // Recharger les signatures
        await loadSignatures()

        // Si validée, montrer la sélection de templates
        if (action === 'validate') {
          setShowTemplateSelection(true)
        } else {
          setSelectedSignature(null)
          setValidationNotes('')
        }
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la validation",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateDocuments = async () => {
    if (!selectedSignature || selectedTemplates.length === 0) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/agent/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateIds: selectedTemplates,
          caseId: selectedSignature.case.id,
          agentId: 'agent-001' // TODO: Récupérer l'ID de l'agent connecté
        })
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedDocuments(result.documents)
        toast({
          title: "Documents générés",
          description: `${result.count} document(s) généré(s) avec succès.`,
        })
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération des documents",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <Badge className="bg-blue-100 text-blue-800">En attente de validation</Badge>
      case 'validated':
        return <Badge className="bg-green-100 text-green-800">Validée</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  // Vue détaillée d'une signature
  if (selectedSignature) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedSignature(null)
              setShowTemplateSelection(false)
              setGeneratedDocuments([])
              setValidationNotes('')
              setSelectedTemplates([])
            }}
          >
            ← Retour à la liste
          </Button>
        </div>

        {/* Détails de la signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Signature className="h-5 w-5" />
              Validation Signature - {selectedSignature.case.client.firstName} {selectedSignature.case.client.lastName}
              {getStatusBadge(selectedSignature.validationStatus)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations client et dossier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations Client
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>Nom :</strong> {selectedSignature.case.client.firstName} {selectedSignature.case.client.lastName}</p>
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedSignature.case.client.email}
                  </p>
                  {selectedSignature.case.client.phone && (
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedSignature.case.client.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Informations Dossier
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>Numéro :</strong> {selectedSignature.case.caseNumber}</p>
                  <p><strong>Type :</strong> {selectedSignature.case.insuranceType}</p>
                  <p><strong>Compagnie :</strong> {selectedSignature.case.insuranceCompany}</p>
                  <p><strong>Police :</strong> {selectedSignature.case.policyNumber}</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Signé le {new Date(selectedSignature.signedAt).toLocaleString('fr-CH')}
                  </p>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Signature className="h-4 w-4" />
                Signature Électronique
              </h4>
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={selectedSignature.signatureData}
                  alt="Signature client"
                  className="max-w-md h-24 border bg-white rounded"
                />
                <div className="mt-2 text-xs text-gray-600">
                  <p>IP: {selectedSignature.ipAddress}</p>
                  <p>Navigateur: {selectedSignature.userAgent.substring(0, 50)}...</p>
                </div>
              </div>
            </div>

            {/* Actions de validation */}
            {selectedSignature.validationStatus === 'signed' && !showTemplateSelection && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes de validation (optionnel)</label>
                  <Textarea
                    value={validationNotes}
                    onChange={(e) => setValidationNotes(e.target.value)}
                    placeholder="Ajoutez des commentaires sur cette signature..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleValidateSignature(selectedSignature.id, 'validate')}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Valider la Signature
                  </Button>
                  <Button
                    onClick={() => handleValidateSignature(selectedSignature.id, 'reject')}
                    disabled={isLoading}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter la Signature
                  </Button>
                </div>
              </div>
            )}

            {/* Sélection de templates après validation */}
            {showTemplateSelection && generatedDocuments.length === 0 && (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Signature validée !</strong> Sélectionnez maintenant les templates de documents à générer automatiquement.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-semibold">Sélectionner les Templates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <div key={template.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={template.id}
                          checked={selectedTemplates.includes(template.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTemplates([...selectedTemplates, template.id])
                            } else {
                              setSelectedTemplates(selectedTemplates.filter(id => id !== template.id))
                            }
                          }}
                        />
                        <div className="flex-1">
                          <label htmlFor={template.id} className="text-sm font-medium cursor-pointer">
                            {template.name}
                          </label>
                          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleGenerateDocuments}
                    disabled={selectedTemplates.length === 0 || isLoading}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Générer {selectedTemplates.length} Document(s)
                  </Button>
                </div>
              </div>
            )}

            {/* Documents générés */}
            {generatedDocuments.length > 0 && (
              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>{generatedDocuments.length} document(s) généré(s) !</strong> Les documents sont prêts à être signés automatiquement et envoyés.
                  </AlertDescription>
                </Alert>

                {/* Boutons d'action pour les documents générés */}
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/agent/auto-sign-documents', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            documentIds: generatedDocuments.map(d => d.id),
                            caseId: selectedSignature?.caseId
                          })
                        })
                        const data = await response.json()
                        if (data.success) {
                          alert(`✅ ${data.signedDocuments.length} document(s) signé(s) automatiquement !`)
                          loadSignatures()
                        }
                      } catch (error) {
                        console.error('Erreur signature auto:', error)
                      }
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Signer Automatiquement
                  </Button>
                  <Button
                    onClick={async () => {
                      const message = prompt('Message optionnel pour le client:')
                      try {
                        const response = await fetch('/api/agent/send-documents-email', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            documentIds: generatedDocuments.map(d => d.id),
                            caseId: selectedSignature?.caseId,
                            message
                          })
                        })
                        const data = await response.json()
                        if (data.success) {
                          alert(`✅ Documents envoyés à ${data.clientEmail} !`)
                        }
                      } catch (error) {
                        console.error('Erreur envoi email:', error)
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer par Email
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Documents Générés</h4>
                  {generatedDocuments.map((doc, index) => (
                    <Card key={index} className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{doc.templateName}</h5>
                            <p className="text-sm text-gray-600">Catégorie: {doc.category}</p>
                            <p className="text-xs text-gray-500">Généré le {new Date(doc.generatedAt).toLocaleString('fr-CH')}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Prévisualiser
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3 mr-1" />
                              Télécharger
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Signature className="h-4 w-4 mr-2" />
                      Signer Automatiquement
                    </Button>
                    <Button variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer au Client
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Liste des signatures
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Signatures à Valider</h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {signatures.length} signature{signatures.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {signatures.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Signature className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune signature en attente</h3>
            <p className="text-gray-500">Les signatures des clients apparaîtront ici pour validation.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {signatures.map((signature) => (
            <Card key={signature.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {signature.case.client.firstName} {signature.case.client.lastName}
                      </h3>
                      {getStatusBadge(signature.validationStatus)}
                      <Badge variant="outline" className="text-xs">
                        {signature.case.insuranceType}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Dossier :</strong> {signature.case.caseNumber}</p>
                        <p><strong>Email :</strong> {signature.case.client.email}</p>
                      </div>
                      <div>
                        <p><strong>Compagnie :</strong> {signature.case.insuranceCompany}</p>
                        <p><strong>Police :</strong> {signature.case.policyNumber}</p>
                      </div>
                      <div>
                        <p><strong>Signé le :</strong> {new Date(signature.signedAt).toLocaleDateString('fr-CH')}</p>
                        <p><strong>IP :</strong> {signature.ipAddress}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSignature(signature)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Valider
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
