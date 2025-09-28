"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Clock, 
  AlertTriangle, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Eye, 
  RefreshCw,
  Filter,
  User,
  Building,
  Send,
  AlertCircle,
  CheckCircle,
  Zap
} from "lucide-react"

interface PendingCase {
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
  updatedAt: string
  expiresAt: string
  daysWaiting: number
  daysSinceUpdate: number
  daysUntilExpiry: number | null
  priority: string
  priorityScore: number
  emailsSent: number
  lastEmailSent: any
  portalUrl: string
  detailedStatus: string
  recommendedActions: string[]
}

interface PendingStats {
  total: number
  urgent: number
  high: number
  normal: number
  expiringSoon: number
  noResponse: number
}

export function AgentPendingDynamic() {
  const [cases, setCases] = useState<PendingCase[]>([])
  const [stats, setStats] = useState<PendingStats>({
    total: 0,
    urgent: 0,
    high: 0,
    normal: 0,
    expiringSoon: 0,
    noResponse: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    loadPendingCases()
    
    // Recharger toutes les 60 secondes
    const interval = setInterval(loadPendingCases, 60000)
    return () => clearInterval(interval)
  }, [priorityFilter])

  const loadPendingCases = async () => {
    try {
      setIsLoading(true)
      
      const params = new URLSearchParams({
        priority: priorityFilter,
        limit: '50',
        offset: '0'
      })

      const response = await fetch(`/api/agent/pending?${params}`)
      const data = await response.json()

      if (data.success) {
        setCases(data.cases || [])
        setStats(data.stats || {
          total: 0,
          urgent: 0,
          high: 0,
          normal: 0,
          expiringSoon: 0,
          noResponse: 0
        })
      } else {
        console.error('Erreur chargement dossiers en attente:', data.error)
      }
    } catch (error) {
      console.error('Erreur API dossiers en attente:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityBadge = (priority: string, daysUntilExpiry: number | null) => {
    if (daysUntilExpiry !== null && daysUntilExpiry <= 1) {
      return <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
        <Zap className="w-3 h-3 mr-1" />
        CRITIQUE
      </Badge>
    }
    
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 border-red-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Urgent
        </Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Élevé
        </Badge>
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Normal
        </Badge>
      default:
        return <Badge variant="secondary">-</Badge>
    }
  }

  const getPriorityColor = (priority: string, daysUntilExpiry: number | null) => {
    if (daysUntilExpiry !== null && daysUntilExpiry <= 1) {
      return 'border-l-red-600 bg-red-50'
    }
    
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50'
      case 'high': return 'border-l-orange-500 bg-orange-50'
      case 'normal': return 'border-l-blue-500 bg-blue-50'
      default: return 'border-l-gray-500'
    }
  }

  const handleSendReminder = async (caseId: string) => {
    try {
      const response = await fetch('/api/agent/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_reminder',
          caseId: caseId
        })
      })

      const data = await response.json()
      if (data.success) {
        // Recharger les données
        loadPendingCases()
      }
    } catch (error) {
      console.error('Erreur envoi rappel:', error)
    }
  }

  const handleExtendExpiry = async (caseId: string, days: number) => {
    try {
      const response = await fetch('/api/agent/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extend_expiry',
          caseId: caseId,
          data: { days }
        })
      })

      const data = await response.json()
      if (data.success) {
        // Recharger les données
        loadPendingCases()
      }
    } catch (error) {
      console.error('Erreur prolongation délai:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Urgent</p>
                <p className="text-2xl font-bold text-red-900">{stats.urgent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Élevé</p>
                <p className="text-2xl font-bold text-orange-900">{stats.high}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Normal</p>
                <p className="text-2xl font-bold text-blue-900">{stats.normal}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Expire bientôt</p>
                <p className="text-2xl font-bold text-purple-900">{stats.expiringSoon}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sans réponse</p>
                <p className="text-2xl font-bold text-gray-900">{stats.noResponse}</p>
              </div>
              <Mail className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dossiers en Attente</span>
            <div className="flex items-center space-x-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">Élevé</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadPendingCases}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Liste des dossiers */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Chargement des dossiers en attente...</span>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun dossier en attente</h3>
              <p className="text-gray-500">
                Tous vos dossiers sont à jour ! 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((caseItem) => (
                <Card key={caseItem.id} className={`border-l-4 ${getPriorityColor(caseItem.priority, caseItem.daysUntilExpiry)} hover:shadow-md transition-shadow`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{caseItem.client.fullName}</h3>
                            <p className="text-sm text-gray-500">Dossier: {caseItem.caseNumber}</p>
                          </div>
                          {getPriorityBadge(caseItem.priority, caseItem.daysUntilExpiry)}
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">{caseItem.detailedStatus}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{caseItem.client.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                En attente depuis {caseItem.daysWaiting} jour{caseItem.daysWaiting > 1 ? 's' : ''}
                              </span>
                            </div>
                            {caseItem.daysUntilExpiry !== null && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className={`text-sm ${caseItem.daysUntilExpiry <= 3 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                  Expire dans {caseItem.daysUntilExpiry} jour{caseItem.daysUntilExpiry > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>

                          {caseItem.insuranceCompany && (
                            <div className="flex items-center space-x-2 mb-3">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {caseItem.insuranceCompany} - {caseItem.policyType}
                              </span>
                            </div>
                          )}

                          {caseItem.emailsSent > 0 && (
                            <div className="flex items-center space-x-2 text-blue-600">
                              <Send className="h-4 w-4" />
                              <span className="text-sm">
                                {caseItem.emailsSent} email{caseItem.emailsSent > 1 ? 's' : ''} envoyé{caseItem.emailsSent > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions recommandées */}
                        {caseItem.recommendedActions.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                            <h4 className="text-sm font-medium text-yellow-800 mb-2">Actions recommandées:</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {caseItem.recommendedActions.map((action, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <span className="w-1 h-1 bg-yellow-600 rounded-full"></span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(caseItem.portalUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir portail
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendReminder(caseItem.id)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Rappel
                        </Button>

                        {caseItem.daysUntilExpiry !== null && caseItem.daysUntilExpiry <= 5 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleExtendExpiry(caseItem.id, 30)}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Prolonger
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
