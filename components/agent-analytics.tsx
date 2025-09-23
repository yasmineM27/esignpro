"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Clock, CheckCircle, Users, FileText, Calendar, Target } from "lucide-react"
import { useState } from "react"

interface AnalyticsData {
  period: string
  totalCases: number
  completedCases: number
  pendingCases: number
  averageProcessingTime: number
  completionRate: number
  clientSatisfaction: number
  documentTypes: {
    auto: number
    habitation: number
    sante: number
  }
  monthlyTrend: {
    month: string
    cases: number
    completed: number
  }[]
}

const mockAnalyticsData: Record<string, AnalyticsData> = {
  "7days": {
    period: "7 derniers jours",
    totalCases: 12,
    completedCases: 8,
    pendingCases: 4,
    averageProcessingTime: 2.5,
    completionRate: 67,
    clientSatisfaction: 4.8,
    documentTypes: { auto: 5, habitation: 4, sante: 3 },
    monthlyTrend: [
      { month: "Lun", cases: 2, completed: 1 },
      { month: "Mar", cases: 3, completed: 2 },
      { month: "Mer", cases: 1, completed: 1 },
      { month: "Jeu", cases: 2, completed: 2 },
      { month: "Ven", cases: 3, completed: 2 },
      { month: "Sam", cases: 1, completed: 0 },
      { month: "Dim", cases: 0, completed: 0 }
    ]
  },
  "30days": {
    period: "30 derniers jours",
    totalCases: 45,
    completedCases: 38,
    pendingCases: 7,
    averageProcessingTime: 3.2,
    completionRate: 84,
    clientSatisfaction: 4.7,
    documentTypes: { auto: 18, habitation: 15, sante: 12 },
    monthlyTrend: [
      { month: "Sem 1", cases: 12, completed: 10 },
      { month: "Sem 2", cases: 15, completed: 12 },
      { month: "Sem 3", cases: 10, completed: 9 },
      { month: "Sem 4", cases: 8, completed: 7 }
    ]
  },
  "90days": {
    period: "90 derniers jours",
    totalCases: 156,
    completedCases: 142,
    pendingCases: 14,
    averageProcessingTime: 3.8,
    completionRate: 91,
    clientSatisfaction: 4.6,
    documentTypes: { auto: 65, habitation: 52, sante: 39 },
    monthlyTrend: [
      { month: "Mois 1", cases: 48, completed: 45 },
      { month: "Mois 2", cases: 52, completed: 49 },
      { month: "Mois 3", cases: 56, completed: 48 }
    ]
  }
}

export function AgentAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30days")
  const data = mockAnalyticsData[selectedPeriod]

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600"
    if (rate >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (rate >= 75) return <Badge className="bg-yellow-100 text-yellow-800">Bon</Badge>
    return <Badge className="bg-red-100 text-red-800">À améliorer</Badge>
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center">
              <BarChart3 className="mr-3 h-6 w-6" />
              Statistiques & Performance
            </CardTitle>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 derniers jours</SelectItem>
                <SelectItem value="30days">30 derniers jours</SelectItem>
                <SelectItem value="90days">90 derniers jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Dossiers</p>
                    <p className="text-2xl font-bold text-blue-900">{data.totalCases}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Terminés</p>
                    <p className="text-2xl font-bold text-green-900">{data.completedCases}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">En Attente</p>
                    <p className="text-2xl font-bold text-orange-900">{data.pendingCases}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Temps Moyen</p>
                    <p className="text-2xl font-bold text-purple-900">{data.averageProcessingTime}j</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Taux de Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Performance actuelle</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${getPerformanceColor(data.completionRate)}`}>
                        {data.completionRate}%
                      </span>
                      {getPerformanceBadge(data.completionRate)}
                    </div>
                  </div>
                  <Progress value={data.completionRate} className="h-3" />
                  <div className="text-xs text-gray-600">
                    Objectif: 85% • {data.completedCases} dossiers terminés sur {data.totalCases}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Satisfaction Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Note moyenne</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-yellow-600">
                        {data.clientSatisfaction}/5
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < Math.floor(data.clientSatisfaction) ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Progress value={(data.clientSatisfaction / 5) * 100} className="h-3" />
                  <div className="text-xs text-gray-600">
                    Basé sur les retours clients des dossiers terminés
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Types Distribution */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Répartition par Type de Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Résiliation Auto</span>
                  <div className="flex items-center space-x-3">
                    <Progress value={(data.documentTypes.auto / data.totalCases) * 100} className="w-32 h-2" />
                    <span className="text-sm font-bold w-12">{data.documentTypes.auto}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Résiliation Habitation</span>
                  <div className="flex items-center space-x-3">
                    <Progress value={(data.documentTypes.habitation / data.totalCases) * 100} className="w-32 h-2" />
                    <span className="text-sm font-bold w-12">{data.documentTypes.habitation}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Résiliation Santé</span>
                  <div className="flex items-center space-x-3">
                    <Progress value={(data.documentTypes.sante / data.totalCases) * 100} className="w-32 h-2" />
                    <span className="text-sm font-bold w-12">{data.documentTypes.sante}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Évolution des Dossiers - {data.period}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.monthlyTrend.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm font-medium">{item.month}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Créés: {item.cases}</span>
                        <span>Terminés: {item.completed}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Progress value={(item.cases / Math.max(...data.monthlyTrend.map(t => t.cases))) * 100} className="flex-1 h-2" />
                        <Progress value={(item.completed / Math.max(...data.monthlyTrend.map(t => t.completed))) * 100} className="flex-1 h-2 bg-green-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
