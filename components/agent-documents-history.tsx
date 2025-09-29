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
  FileCheck
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

export function AgentDocumentsHistory() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSigned, setFilterSigned] = useState<'all' | 'signed' | 'unsigned'>('all')
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [total, setTotal] = useState(0)

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
      {/* En-tête et filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Historique des Documents
            </span>
            <Badge variant="outline">{total} document(s)</Badge>
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
                  {doc.hasPdf && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(doc.id, doc.documentName)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  )}
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

