"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  Target,
  Zap,
  Download
} from "lucide-react"

interface AgentStats {
  totalCases: number
  newCases: number
  casesByStatus: {
    draft: number
    email_sent: number
    documents_uploaded: number
    signed: number
    completed: number
    validated: number
  }
  totalSignatures: number
  signaturesValidated: number
  signaturesPending: number
  signaturesRejected: number
  totalEmails: number
  emailsSent: number
  emailsPending: number
  emailsFailed: number
  conversionRate: number
  completionRate: number
  averageProcessingTime: number
  recentActivity: Array<{
    date: string
    cases: number
    signatures: number
    emails: number
  }>
}

export function AgentAnalyticsDynamic() {
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState("30")

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/agent/stats?period=${period}`)
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      } else {
        console.error('Erreur chargement statistiques:', data.error)
      }
    } catch (error) {
      console.error('Erreur API statistiques:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des statistiques...</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-500">Impossible de charger les statistiques.</p>
        <Button onClick={loadStats} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    )
  }

  const totalActive = stats.casesByStatus.email_sent + stats.casesByStatus.documents_uploaded + stats.casesByStatus.signed
  const totalCompleted = stats.casesByStatus.completed + stats.casesByStatus.validated

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de période */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6" />
              <span>Statistiques et Analyses</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-48">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 derniers jours</SelectItem>
                  <SelectItem value="30">30 derniers jours</SelectItem>
                  <SelectItem value="90">90 derniers jours</SelectItem>
                  <SelectItem value="365">1 an</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={loadStats}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/agent/export-stats?period=${period}`)
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `eSignPro_Stats_${new Date().toISOString().split('T')[0]}.xlsx`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(url)
                  } catch (error) {
                    console.error('Erreur export:', error)
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Dossiers</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalCases}</p>
                <p className="text-xs text-blue-600 mt-1">
                  +{stats.newCases} aujourd'hui
                </p>
              </div>
              <FileText className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Taux de Conversion</p>
                <p className="text-3xl font-bold text-green-900">{stats.conversionRate}%</p>
                <div className="flex items-center mt-1">
                  {stats.conversionRate >= 70 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <p className="text-xs text-green-600">
                    {stats.totalSignatures}/{stats.totalCases} signés
                  </p>
                </div>
              </div>
              <Target className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Taux de Finalisation</p>
                <p className="text-3xl font-bold text-purple-900">{stats.completionRate}%</p>
                <p className="text-xs text-purple-600 mt-1">
                  {totalCompleted} dossiers terminés
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Temps Moyen</p>
                <p className="text-3xl font-bold text-orange-900">{stats.averageProcessingTime}h</p>
                <p className="text-xs text-orange-600 mt-1">
                  Traitement par dossier
                </p>
              </div>
              <Clock className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition des dossiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Dossiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm">Brouillons</span>
                </div>
                <span className="font-medium">{stats.casesByStatus.draft}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Emails envoyés</span>
                </div>
                <span className="font-medium">{stats.casesByStatus.email_sent}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm">Documents reçus</span>
                </div>
                <span className="font-medium">{stats.casesByStatus.documents_uploaded}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="text-sm">Signés</span>
                </div>
                <span className="font-medium">{stats.casesByStatus.signed}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm">Terminés</span>
                </div>
                <span className="font-medium">{stats.casesByStatus.completed}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">Validés</span>
                </div>
                <span className="font-medium">{stats.casesByStatus.validated}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signatures et Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Signatures */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Signatures</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Validées</span>
                    </div>
                    <span className="font-medium text-green-600">{stats.signaturesValidated}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">En attente</span>
                    </div>
                    <span className="font-medium text-orange-600">{stats.signaturesPending}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Rejetées</span>
                    </div>
                    <span className="font-medium text-red-600">{stats.signaturesRejected}</span>
                  </div>
                </div>
              </div>

              {/* Emails */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Emails</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Envoyés</span>
                    </div>
                    <span className="font-medium text-green-600">{stats.emailsSent}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">En attente</span>
                    </div>
                    <span className="font-medium text-orange-600">{stats.emailsPending}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Échecs</span>
                    </div>
                    <span className="font-medium text-red-600">{stats.emailsFailed}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle>Activité des 7 derniers jours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString('fr-FR', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">{day.cases} dossiers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">{day.signatures} signatures</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600">{day.emails} emails</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Globale</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((stats.conversionRate + stats.completionRate) / 2)}%
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.conversionRate + stats.completionRate >= 140 ? 'Excellente' : 
                   stats.conversionRate + stats.completionRate >= 100 ? 'Bonne' : 'À améliorer'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dossiers Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
                <p className="text-xs text-blue-600 mt-1">
                  En cours de traitement
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficacité Email</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEmails > 0 ? Math.round((stats.emailsSent / stats.totalEmails) * 100) : 0}%
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Taux de livraison
                </p>
              </div>
              <Mail className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
