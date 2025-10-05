"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, FileText, Mail, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DocumentPreview } from "./document-preview"

interface PersonInfo {
  nom: string
  prenom: string
  dateNaissance: string
  numeroPolice: string
}

interface ClientData {
  // Informations principales du client
  nom: string
  prenom: string
  dateNaissance: string
  numeroPolice: string
  email: string
  telephone: string

  // Adresse séparée
  adresse: string
  npa: string
  ville: string

  // Type de formulaire et destinataire
  typeFormulaire: 'resiliation' | 'souscription' | 'modification' | 'autre'
  destinataire: string
  lieuDate: string

  // Personnes supplémentaires (famille)
  personnes: PersonInfo[]

  // Dates spécifiques
  dateLamal: string
  dateLCA: string

  // Champs calculés/legacy (pour compatibilité)
  nomPrenom: string
  npaVille: string
}

export function ClientForm() {
  const { toast } = useToast()
  const [clientData, setClientData] = useState<ClientData>({
    // Informations principales du client
    nom: "",
    prenom: "",
    dateNaissance: "",
    numeroPolice: "",
    email: "",
    telephone: "",

    // Adresse séparée
    adresse: "",
    npa: "",
    ville: "",

    // Type de formulaire et destinataire
    typeFormulaire: 'resiliation' as const,
    destinataire: "",
    lieuDate: new Date().toLocaleDateString('fr-CH'),

    // Personnes supplémentaires (famille)
    personnes: [],

    // Dates spécifiques
    dateLamal: "",
    dateLCA: "",

    // Champs calculés/legacy (pour compatibilité)
    nomPrenom: "",
    npaVille: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isDownloadingWord, setIsDownloadingWord] = useState(false)
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [secureToken, setSecureToken] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Fonction pour calculer les champs legacy automatiquement
  const updateCalculatedFields = (data: Partial<ClientData>) => {
    const updatedData = { ...clientData, ...data }

    // Calculer nomPrenom
    if (updatedData.nom && updatedData.prenom) {
      updatedData.nomPrenom = `${updatedData.prenom} ${updatedData.nom}`
    }

    // Calculer npaVille
    if (updatedData.npa && updatedData.ville) {
      updatedData.npaVille = `${updatedData.npa} ${updatedData.ville}`
    }

    return updatedData
  }

  // Fonction helper pour mettre à jour les données client
  const updateClientData = (updates: Partial<ClientData>) => {
    const updatedData = updateCalculatedFields(updates)
    setClientData(updatedData)
  }

  const addPerson = () => {
    if (clientData.personnes.length < 4) {
      updateClientData({
        personnes: [...clientData.personnes, { nom: "", prenom: "", dateNaissance: "", numeroPolice: "" }],
      })
    }
  }

  const removePerson = (index: number) => {
    const newPersonnes = clientData.personnes.filter((_, i) => i !== index)
    updateClientData({ personnes: newPersonnes })
  }

  const updatePerson = (index: number, field: keyof PersonInfo, value: string) => {
    const newPersonnes = [...clientData.personnes]
    newPersonnes[index] = { ...newPersonnes[index], [field]: value }
    updateClientData({ personnes: newPersonnes })
  }

  const downloadWordDocument = async () => {
    setIsDownloadingWord(true)

    try {
      const response = await fetch("/api/generate-word-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du document")
      }

      // Télécharger le fichier
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Resiliation_${clientData.nom}_${clientData.prenom}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Document téléchargé",
        description: "Le document Word a été généré et téléchargé avec succès.",
      })

    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      toast({
        title: "Erreur",
        description: "Impossible de générer le document Word.",
        variant: "destructive",
      })
    } finally {
      setIsDownloadingWord(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const generateResponse = await fetch("/api/generate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      })

      if (!generateResponse.ok) {
        throw new Error(`Erreur HTTP ${generateResponse.status}: ${generateResponse.statusText}`)
      }

      const generateResult = await generateResponse.json()

      if (!generateResult.success) {
        throw new Error(generateResult.error || generateResult.message || 'Erreur lors de la génération du document')
      }

      setGeneratedDocument(generateResult.documentContent)
      setClientId(generateResult.secureToken) // Utiliser le token sécurisé

      console.log('✅ Document généré et dossier créé:', {
        caseId: generateResult.caseId,
        caseNumber: generateResult.caseNumber,
        secureToken: generateResult.secureToken
      })

      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientEmail: clientData.email,
          clientName: `${clientData.prenom} ${clientData.nom}`,
          clientId: generateResult.secureToken, // Passer le token sécurisé
          documentContent: generateResult.documentContent,
          caseId: generateResult.caseId,
          caseNumber: generateResult.caseNumber,
          secureToken: generateResult.secureToken
        }),
      })

      if (!emailResponse.ok) {
        throw new Error(`Erreur HTTP ${emailResponse.status}: ${emailResponse.statusText}`)
      }

      const emailResult = await emailResponse.json()

      if (!emailResult.success) {
        throw new Error(emailResult.error || emailResult.message || 'Erreur lors de l\'envoi de l\'email')
      }

      // Store the secure token for the portal link
      setSecureToken(emailResult.secureToken)

      const actualRecipient = process.env.NODE_ENV === 'development' ? (process.env.TEST_CLIENT_EMAIL || 'yasminemassaoudi27@gmail.com') : clientData.email

      toast({
        title: "Dossier créé avec succès",
        description: process.env.NODE_ENV === 'development'
          ? `Document généré. Email de test envoyé à ${actualRecipient} (au lieu de ${clientData.email}). Lien portail: ${emailResult.portalLink}`
          : `Document généré et email envoyé à ${clientData.email}. Lien portail: ${emailResult.portalLink}`,
      })

      // Show preview
      setShowPreview(true)
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création du dossier.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setClientData({
      nom: "",
      prenom: "",
      dateNaissance: "",
      numeroPolice: "",
      email: "",
      telephone: "",
      adresse: "",
      npa: "",
      ville: "",
      typeFormulaire: 'resiliation',
      destinataire: "",
      lieuDate: new Date().toLocaleDateString('fr-CH'),
      personnes: [],
      dateLamal: "",
      dateLCA: "",
      nomPrenom: "",
      npaVille: "",
    })
    setGeneratedDocument(null)
    setClientId(null)
    setSecureToken(null)
    setShowPreview(false)
  }

  if (showPreview && generatedDocument) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Document Généré</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              <Eye className="h-4 w-4 mr-2" />
              Retour au Formulaire
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Nouveau Dossier
            </Button>
          </div>
        </div>

        <DocumentPreview content={generatedDocument} clientId={secureToken || clientId || ""} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informations du demandeur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <FileText className="h-5 w-5" />
            Informations du Demandeur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nom et Prénom séparés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={clientData.prenom}
                onChange={(e) => updateClientData({ prenom: e.target.value })}
                placeholder="Jean"
                required
              />
            </div>
            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={clientData.nom}
                onChange={(e) => updateClientData({ nom: e.target.value })}
                placeholder="Dupont"
                required
              />
            </div>
          </div>

          {/* Date de naissance et numéro de police */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateNaissance">Date de Naissance *</Label>
              <Input
                id="dateNaissance"
                type="date"
                value={clientData.dateNaissance}
                onChange={(e) => updateClientData({ dateNaissance: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="numeroPolice">Numéro de Police d'Assurance *</Label>
              <Input
                id="numeroPolice"
                value={clientData.numeroPolice}
                onChange={(e) => updateClientData({ numeroPolice: e.target.value })}
                placeholder="POL-123456789"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email du Client *</Label>
            <Input
              id="email"
              type="email"
              value={clientData.email}
              onChange={(e) => updateClientData({ email: e.target.value })}
              placeholder="client@example.com"
              required
            />
          </div>

          {/* Téléphone */}
          <div>
            <Label htmlFor="telephone">Téléphone du Client</Label>
            <Input
              id="telephone"
              type="tel"
              value={clientData.telephone}
              onChange={(e) => updateClientData({ telephone: e.target.value })}
              placeholder="+41 XX XXX XX XX"
            />
          </div>

          {/* Adresse */}
          <div>
            <Label htmlFor="adresse">Adresse *</Label>
            <Input
              id="adresse"
              value={clientData.adresse}
              onChange={(e) => updateClientData({ adresse: e.target.value })}
              placeholder="Rue de la Paix 123"
              required
            />
          </div>

          {/* NPA et Ville séparés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="npa">NPA *</Label>
              <Input
                id="npa"
                value={clientData.npa}
                onChange={(e) => updateClientData({ npa: e.target.value })}
                placeholder="1000"
                required
              />
            </div>
            <div>
              <Label htmlFor="ville">Ville *</Label>
              <Input
                id="ville"
                value={clientData.ville}
                onChange={(e) => updateClientData({ ville: e.target.value })}
                placeholder="Lausanne"
                required
              />
            </div>
            <div>
              <Label htmlFor="lieuDate">Lieu et Date *</Label>
              <Input
                id="lieuDate"
                value={clientData.lieuDate}
                onChange={(e) => updateClientData({ lieuDate: e.target.value })}
                placeholder="Lausanne, le 19 septembre 2025"
                required
              />
            </div>
          </div>

          {/* Type de formulaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="typeFormulaire">Type de Formulaire *</Label>
              <select
                id="typeFormulaire"
                value={clientData.typeFormulaire}
                onChange={(e) => updateClientData({ typeFormulaire: e.target.value as ClientData['typeFormulaire'] })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="resiliation">Résiliation</option>
                <option value="souscription">Souscription</option>
                <option value="modification">Modification</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <Label htmlFor="destinataire">Destinataire (Compagnie d'Assurance) *</Label>
              <Input
                id="destinataire"
                value={clientData.destinataire}
                onChange={(e) => updateClientData({ destinataire: e.target.value })}
                placeholder="Assura, CSS, Groupe Mutuel..."
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personnes assurées supplémentaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-blue-700">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Personnes Assurées Supplémentaires (Famille)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPerson}
              disabled={clientData.personnes.length >= 4}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter Personne
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {clientData.personnes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune personne supplémentaire ajoutée.</p>
              <p className="text-sm">Le demandeur principal est déjà inclus dans le document.</p>
            </div>
          ) : (
            clientData.personnes.map((personne, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Personne {index + 1}</h4>
                {clientData.personnes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePerson(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`nom-${index}`}>Nom *</Label>
                  <Input
                    id={`nom-${index}`}
                    value={personne.nom}
                    onChange={(e) => updatePerson(index, "nom", e.target.value)}
                    placeholder="Dupont"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`prenom-${index}`}>Prénom *</Label>
                  <Input
                    id={`prenom-${index}`}
                    value={personne.prenom}
                    onChange={(e) => updatePerson(index, "prenom", e.target.value)}
                    placeholder="Jean"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`dateNaissance-${index}`}>Date de Naissance *</Label>
                  <Input
                    id={`dateNaissance-${index}`}
                    type="date"
                    value={personne.dateNaissance}
                    onChange={(e) => updatePerson(index, "dateNaissance", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`numeroPolice-${index}`}>Numéro de Police *</Label>
                  <Input
                    id={`numeroPolice-${index}`}
                    value={personne.numeroPolice}
                    onChange={(e) => updatePerson(index, "numeroPolice", e.target.value)}
                    placeholder="123456789"
                    required
                  />
                </div>
              </div>
            </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dates de résiliation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-700">Dates de Résiliation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateLamal">Date de résiliation LAMal *</Label>
              <Input
                id="dateLamal"
                type="date"
                value={clientData.dateLamal}
                onChange={(e) => updateClientData({ dateLamal: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="dateLCA">Date de résiliation LCA complémentaires *</Label>
              <Input
                id="dateLCA"
                type="date"
                value={clientData.dateLCA}
                onChange={(e) => updateClientData({ dateLCA: e.target.value })}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {/* Bouton pour télécharger le document Word */}
        <Button
          type="button"
          size="lg"
          onClick={downloadWordDocument}
          disabled={isDownloadingWord || !clientData.nom || !clientData.prenom}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3"
        >
          {isDownloadingWord ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Génération...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Télécharger Document Word
            </>
          )}
        </Button>

        {/* Bouton pour prévisualiser */}
        <Button
          type="button"
          size="lg"
          onClick={() => setShowPreview(!showPreview)}
          disabled={!clientData.nom || !clientData.prenom}
          variant="outline"
          className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3"
        >
          <Eye className="h-4 w-4 mr-2" />
          {showPreview ? "Masquer Aperçu" : "Aperçu Document"}
        </Button>

        {/* Bouton principal pour générer et envoyer */}
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Traitement en cours...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Générer et Envoyer l'Email
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
