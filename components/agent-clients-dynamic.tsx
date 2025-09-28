"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Eye, 
  RefreshCw,
  Filter,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface Client {
  id: string
  userId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  address: string
  clientCreatedAt: string
  caseId: string
  caseNumber: string
  caseStatus: string
  secureToken: string
  insuranceCompany: string
  policyType: string
  policyNumber: string
  terminationDate: string
  reasonForTermination: string
  caseCreatedAt: string
  caseCompletedAt: string
  caseUpdatedAt: string
  hasSignature: boolean
  signature: any
  overallStatus: string
  portalUrl: string
  daysSinceCreated: number
  daysSinceUpdated: number
}

interface ClientsStats {
  total: number
  pending: number
  active: number
  completed: number
  withSignature: number
}

export function AgentClientsDynamic() {
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<ClientsStats>({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    withSignature: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    loadClients()
  }, [statusFilter, sortBy])

  const loadClients = async () => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        status: statusFilter,
        limit: '50',
        offset: '0'
      })
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/agent/clients?${params}`)
      const data = await response.json()

      if (data.success) {
        setClients(data.clients || [])
        setStats(data.stats || {
          total: 0,
          pending: 0,
          active: 0,
          completed: 0,
          withSignature: 0
        })
      } else {
        console.error('Erreur chargement clients:', data.error)
      }
    } catch (error) {
      console.error('Erreur API clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    loadClients()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Terminé
        </Badge>
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Actif
        </Badge>
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          En attente
        </Badge>
      default:
        return <Badge variant="secondary">Brouillon</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-l-green-500'
      case 'active': return 'border-l-blue-500'
      case 'pending': return 'border-l-orange-500'
      default: return 'border-l-gray-500'
    }
  }

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      client.fullName.toLowerCase().includes(search) ||
      client.email.toLowerCase().includes(search) ||
      client.caseNumber.toLowerCase().includes(search) ||
      (client.insuranceCompany && client.insuranceCompany.toLowerCase().includes(search))
    )
  })

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Clients</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">En Attente</p>
                <p className="text-2xl font-bold text-orange-900">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Actifs</p>
                <p className="text-2xl font-bold text-blue-900">{stats.active}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Terminés</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Signés</p>
                <p className="text-2xl font-bold text-purple-900">{stats.withSignature}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mes Clients</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadClients}
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
                  placeholder="Rechercher par nom, email, dossier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {/* Liste des clients */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Chargement des clients...</span>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun client ne correspond à votre recherche.' : 'Vous n\'avez pas encore de clients.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client, index) => (
                <Card key={`${client.caseId}-${client.id}-${index}`} className={`border-l-4 ${getStatusColor(client.overallStatus)} hover:shadow-md transition-shadow`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{client.fullName}</h3>
                            <p className="text-sm text-gray-500">Dossier: {client.caseNumber}</p>
                          </div>
                          {getStatusBadge(client.overallStatus)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{client.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Il y a {client.daysSinceCreated} jour{client.daysSinceCreated > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {client.insuranceCompany && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {client.insuranceCompany} - {client.policyType}
                            </span>
                          </div>
                        )}

                        {client.hasSignature && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Document signé</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(client.portalUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir portail
                        </Button>
                        {client.hasSignature && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Voir signature
                          </Button>
                        )}
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
