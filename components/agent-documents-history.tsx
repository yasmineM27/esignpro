"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Building2,
  FileCheck,
  Eye
} from 'lucide-react'

interface Document {
  id: string
  documentName: string
  templateId: string
  caseId: string
  caseNumber: string
  insuranceCompany: string
  clientName: string
  clientEmail: string
  isSigned: boolean
  signedAt: string | null
  hasPdf: boolean
  createdAt: string
  updatedAt: string
}

interface Stats {
  generated: number
  uploaded: number
  total: number
}

export function AgentDocumentsHistory() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSigned, setFilterSigned] = useState<'all' | 'signed' | 'unsigned'>('all')
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<Stats>({ generated: 0, uploaded: 0, total: 0 })

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [documents, searchTerm, filterSigned, filterDate])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/agent/documents-history?limit=100')
      const data = await response.json()

      if (data.success) {
        setDocuments(data.documents)
        setTotal(data.total)
        setStats(data.stats || { generated: 0, uploaded: 0, total: 0 })
        console.log('📊 Documents chargés:', data.stats)
      } else {
        console.error('Erreur API:', data.error)
      }
    } catch (error) {
      console.error('Erreur chargement documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...documents]

    // Filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(doc =>
        doc.documentName.toLowerCase().includes(term) ||
        doc.clientName.toLowerCase().includes(term) ||
        doc.caseNumber.toLowerCase().includes(term) ||
        doc.insuranceCompany.toLowerCase().includes(term)
      )
    }

    // Filtre signature
    if (filterSigned === 'signed') {
      filtered = filtered.filter(doc => doc.isSigned)
    } else if (filterSigned === 'unsigned') {
      filtered = filtered.filter(doc => !doc.isSigned)
    }

    // Filtre date
    if (filterDate !== 'all') {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.createdAt)
        if (filterDate === 'today') return docDate >= startOfToday
        if (filterDate === 'week') return docDate >= startOfWeek
        if (filterDate === 'month') return docDate >= startOfMonth
        return true
      })
    }

    setFilteredDocuments(filtered)
  }

  const downloadDocument = async (documentId: string, documentName: string) => {
    try {
      const response = await fetch(`/api/agent/download-document?documentId=${documentId}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${documentName}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  const handleDownload = async (document: Document) => {
    try {
      console.log('📥 Téléchargement document:', document.id)

      const response = await fetch('/api/agent/download-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          caseId: document.caseId,
          documentName: document.documentName
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erreur lors du téléchargement')
      }

      const contentType = response.headers.get('content-type')
      const blob = await response.blob()

      if (blob.size === 0) {
        throw new Error('Le fichier est vide')
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url

      // Déterminer l'extension selon le type de contenu
      let extension = '.pdf'
      if (contentType?.includes('image/')) {
        extension = contentType.includes('png') ? '.png' : '.jpg'
      } else if (contentType?.includes('text/')) {
        extension = '.txt'
      }

      a.download = `${document.documentName}-${document.caseNumber}${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log('✅ Document téléchargé avec succès')
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error)
      alert(`Erreur lors du téléchargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  const handleViewDocument = async (document: Document) => {
    try {
      console.log('👁️ Visualisation document:', document.id)

      const type = document.templateId ? 'generated' : 'client'
      const url = `/api/agent/view-document?documentId=${document.id}&type=${type}`

      // Ouvrir dans un nouvel onglet
      window.open(url, '_blank')

    } catch (error) {
      console.error('❌ Erreur visualisation:', error)
      alert(`Erreur lors de la visualisation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  const getStatusBadge = (isSigned: boolean) => {
    if (isSigned) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Signé
        </Badge>
      )
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <XCircle className="h-3 w-3 mr-1" />
        Non signé
        </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement de l'historique...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Documents Générés</p>
                <p className="text-2xl font-bold text-blue-600">{stats.generated}</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Documents Uploadés</p>
                <p className="text-2xl font-bold text-green-600">{stats.uploaded}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* En-tête et filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Historique des Documents
            </span>
            <Badge variant="outline">{filteredDocuments.length} / {total} document(s) affiché(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, client, dossier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadDocuments}>
              Actualiser
            </Button>
          </div>

          {/* Filtres */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              <Button
                variant={filterSigned === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSigned('all')}
              >
                Tous
              </Button>
              <Button
                variant={filterSigned === 'signed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSigned('signed')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Signés
              </Button>
              <Button
                variant={filterSigned === 'unsigned' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSigned('unsigned')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Non signés
              </Button>
            </div>

            <div className="flex gap-1">
              <Button
                variant={filterDate === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDate('all')}
              >
                Toutes dates
              </Button>
              <Button
                variant={filterDate === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDate('today')}
              >
                Aujourd'hui
              </Button>
              <Button
                variant={filterDate === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDate('week')}
              >
                7 jours
              </Button>
              <Button
                variant={filterDate === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDate('month')}
              >
                30 jours
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {filteredDocuments.length} document(s) affiché(s)
          </div>
        </CardContent>
      </Card>

      {/* Liste des documents */}
      <div className="space-y-3">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">{doc.documentName}</h3>
                    {getStatusBadge(doc.isSigned)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{doc.clientName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{doc.insuranceCompany}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>Dossier: {doc.caseNumber}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(doc.createdAt).toLocaleDateString('fr-CH')}</span>
                    </div>
                  </div>

                  {doc.isSigned && doc.signedAt && (
                    <div className="text-xs text-green-600">
                      Signé le {new Date(doc.signedAt).toLocaleString('fr-CH')}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {(doc.hasPdf || doc.templateId) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(doc)}
                      title="Visualiser le document"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    title="Télécharger le document"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {doc.hasPdf ? 'PDF' : 'Télécharger'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun document trouvé</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

