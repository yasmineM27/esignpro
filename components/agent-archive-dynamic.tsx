"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Archive, 
  Calendar, 
  FileText, 
  Eye, 
  RefreshCw,
  Filter,
  User,
  Building,
  Download,
  Trash2,
  RotateCcw,
  FolderOpen
} from "lucide-react"

interface ArchivedCase {
  id: string
  caseNumber: string
  status: string
  secureToken: string
  client: {
    id: string
    firstName: string
    lastName: string
    fullName: string
    email: string
    phone: string
  }
  insuranceCompany: string
  policyType: string
  policyNumber: string
  createdAt: string
  archivedAt: string
  archivedBy: string
  archiveReason: string
  portalUrl: string
  daysArchived: number
}

interface ArchiveStats {
  total: number
  thisMonth: number
  thisYear: number
  totalSize: string
}

export function AgentArchiveDynamic() {
  const [cases, setCases] = useState<ArchivedCase[]>([])
  const [stats, setStats] = useState<ArchiveStats>({
    total: 0,
    thisMonth: 0,
    thisYear: 0,
    totalSize: "0 MB"
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [reasonFilter, setReasonFilter] = useState("all")

  useEffect(() => {
    loadArchivedCases()
  }, [dateFilter, reasonFilter])

  const loadArchivedCases = async () => {
    try {
      setIsLoading(true)
      
      // Pour l'instant, simulons des données d'archive
      // En production, cela viendrait d'une API dédiée
      const mockArchivedCases: ArchivedCase[] = [
        {
          id: "arch-001",
          caseNumber: "FORM-1759001234567",
          status: "archived",
          secureToken: "SECURE_1759001234_archived",
          client: {
            id: "client-001",
            firstName: "Jean",
            lastName: "Dupont",
            fullName: "Jean Dupont",
            email: "jean.dupont@example.com",
            phone: "+33 1 23 45 67 89"
          },
          insuranceCompany: "AXA",
          policyType: "Auto",
          policyNumber: "AXA123456",
          createdAt: "2024-01-15T10:00:00Z",
          archivedAt: "2024-02-15T14:30:00Z",
          archivedBy: "Agent eSignPro",
          archiveReason: "Dossier terminé - Conservation légale",
          portalUrl: "https://esignpro.ch/client-portal/SECURE_1759001234_archived",
          daysArchived: 30
        },
        {
          id: "arch-002",
          caseNumber: "FORM-1759001234568",
          status: "archived",
          secureToken: "SECURE_1759001235_archived",
          client: {
            id: "client-002",
            firstName: "Marie",
            lastName: "Martin",
            fullName: "Marie Martin",
            email: "marie.martin@example.com",
            phone: "+33 1 23 45 67 90"
          },
          insuranceCompany: "Allianz",
          policyType: "Habitation",
          policyNumber: "ALL789012",
          createdAt: "2024-01-10T09:00:00Z",
          archivedAt: "2024-02-10T16:45:00Z",
          archivedBy: "Agent eSignPro",
          archiveReason: "Annulation client",
          portalUrl: "https://esignpro.ch/client-portal/SECURE_1759001235_archived",
          daysArchived: 35
        }
      ]

      setCases(mockArchivedCases)
      
      // Calculer les statistiques
      const now = new Date()
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      
      const thisMonth = mockArchivedCases.filter(c => new Date(c.archivedAt) >= monthAgo).length
      const thisYear = mockArchivedCases.filter(c => new Date(c.archivedAt) >= yearAgo).length
      
      setStats({
        total: mockArchivedCases.length,
        thisMonth,
        thisYear,
        totalSize: "15.2 MB" // Simulé
      })
    } catch (error) {
      console.error('Erreur chargement archives:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    // La recherche se fait côté client pour simplifier
  }

  const handleRestore = async (caseId: string) => {
    try {
      // Simuler la restauration
      console.log('Restauration du dossier:', caseId)
      // En production, appeler l'API de restauration
      loadArchivedCases()
    } catch (error) {
      console.error('Erreur restauration:', error)
    }
  }

  const handleDelete = async (caseId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce dossier ?')) {
      try {
        // Simuler la suppression
        console.log('Suppression définitive du dossier:', caseId)
        // En production, appeler l'API de suppression
        loadArchivedCases()
      } catch (error) {
        console.error('Erreur suppression:', error)
      }
    }
  }

  const getArchiveReasonBadge = (reason: string) => {
    if (reason.includes('terminé')) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Terminé</Badge>
    } else if (reason.includes('annulation')) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Annulé</Badge>
    } else if (reason.includes('expir')) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Expiré</Badge>
    } else {
      return <Badge variant="secondary">Autre</Badge>
    }
  }

  const filteredCases = cases.filter(caseItem => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      caseItem.client.fullName.toLowerCase().includes(search) ||
      caseItem.client.email.toLowerCase().includes(search) ||
      caseItem.caseNumber.toLowerCase().includes(search) ||
      (caseItem.insuranceCompany && caseItem.insuranceCompany.toLowerCase().includes(search))
    )
  })

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Archives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Archive className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Ce Mois</p>
                <p className="text-2xl font-bold text-blue-900">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Cette Année</p>
                <p className="text-2xl font-bold text-purple-900">{stats.thisYear}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Taille Totale</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalSize}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Archives</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadArchivedCases}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher dans les archives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {/* Liste des archives */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Chargement des archives...</span>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune archive trouvée</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucune archive ne correspond à votre recherche.' : 'Aucun dossier n\'a encore été archivé.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCases.map((caseItem, index) => (
                <Card key={`${caseItem.id}-${index}`} className="border-l-4 border-l-gray-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="bg-gray-100 p-2 rounded-full">
                            <Archive className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{caseItem.client.fullName}</h3>
                            <p className="text-sm text-gray-500">Dossier: {caseItem.caseNumber}</p>
                          </div>
                          {getArchiveReasonBadge(caseItem.archiveReason)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{caseItem.client.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Archivé il y a {caseItem.daysArchived} jour{caseItem.daysArchived > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Par: {caseItem.archivedBy}</span>
                          </div>
                        </div>

                        {caseItem.insuranceCompany && (
                          <div className="flex items-center space-x-2 mb-3">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {caseItem.insuranceCompany} - {caseItem.policyType}
                            </span>
                          </div>
                        )}

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-sm text-gray-700">
                            <strong>Raison d'archivage:</strong> {caseItem.archiveReason}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(caseItem.portalUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRestore(caseItem.id)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restaurer
                        </Button>

                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exporter
                        </Button>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(caseItem.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
