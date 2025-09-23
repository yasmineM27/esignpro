"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Download, Calendar, TrendingUp, Users, FileText, Clock, Target, Filter } from "lucide-react"
import { useState } from "react"

interface ReportData {
  period: string
  totalAgents: number
  totalCases: number
  completedCases: number
  averageProcessingTime: number
  clientSatisfaction: number
  topPerformers: {
    name: string
    cases: number
    rate: number
  }[]
  documentTypes: {
    type: string
    count: number
    percentage: number
  }[]
  monthlyTrend: {
    month: string
    cases: number
    completed: number
  }[]
}

const mockReportData: Record<string, ReportData> = {
  "7days": {
    period: "7 derniers jours",
    totalAgents: 12,
    totalCases: 89,
    completedCases: 76,
    averageProcessingTime: 2.3,
    clientSatisfaction: 4.7,
    topPerformers: [
      { name: "Sophie Martin", cases: 18, rate: 94 },
      { name: "Wael Hamda", cases: 15, rate: 91 },
      { name: "Jean Dupont", cases: 12, rate: 89 }
    ],
    documentTypes: [
      { type: "Résiliation Auto", count: 35, percentage: 39 },
      { type: "Résiliation Habitation", count: 28, percentage: 31 },
      { type: "Résiliation Santé", count: 26, percentage: 30 }
    ],
    monthlyTrend: [
      { month: "Lun", cases: 15, completed: 12 },
      { month: "Mar", cases: 18, completed: 16 },
      { month: "Mer", cases: 12, completed: 11 },
      { month: "Jeu", cases: 14, completed: 13 },
      { month: "Ven", cases: 16, completed: 14 },
      { month: "Sam", cases: 8, completed: 6 },
      { month: "Dim", cases: 6, completed: 4 }
    ]
  },
  "30days": {
    period: "30 derniers jours",
    totalAgents: 12,
    totalCases: 387,
    completedCases: 342,
    averageProcessingTime: 3.1,
    clientSatisfaction: 4.6,
    topPerformers: [
      { name: "Sophie Martin", cases: 78, rate: 94 },
      { name: "Wael Hamda", cases: 65, rate: 91 },
      { name: "Jean Dupont", cases: 52, rate: 87 }
    ],
    documentTypes: [
      { type: "Résiliation Auto", count: 156, percentage: 40 },
      { type: "Résiliation Habitation", count: 125, percentage: 32 },
      { type: "Résiliation Santé", count: 106, percentage: 28 }
    ],
    monthlyTrend: [
      { month: "Sem 1", cases: 98, completed: 89 },
      { month: "Sem 2", cases: 105, completed: 94 },
      { month: "Sem 3", cases: 92, completed: 82 },
      { month: "Sem 4", cases: 92, completed: 77 }
    ]
  }
}

export function AdminReports() {
  const [selectedPeriod, setSelectedPeriod] = useState("30days")
  const [selectedReport, setSelectedReport] = useState("overview")
  const data = mockReportData[selectedPeriod]

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600"
    if (rate >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const exportReport = (format: string) => {
    console.log(`Exporting report in ${format} format`)
    // Implementation for export functionality
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center">
              <BarChart3 className="mr-3 h-6 w-6" />
              Rapports & Analytics
            </CardTitle>
            <div className="flex space-x-2">
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
              <Button className="bg-white text-purple-600 hover:bg-purple-50">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Report Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={selectedReport === "overview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedReport("overview")}
              className={selectedReport === "overview" ? "bg-white shadow-sm" : ""}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Vue d'ensemble
            </Button>
            <Button
              variant={selectedReport === "agents" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedReport("agents")}
              className={selectedReport === "agents" ? "bg-white shadow-sm" : ""}
            >
              <Users className="mr-2 h-4 w-4" />
              Performance Agents
            </Button>
            <Button
              variant={selectedReport === "documents" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedReport("documents")}
              className={selectedReport === "documents" ? "bg-white shadow-sm" : ""}
            >
              <FileText className="mr-2 h-4 w-4" />
              Types de Documents
            </Button>
            <Button
              variant={selectedReport === "trends" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedReport("trends")}
              className={selectedReport === "trends" ? "bg-white shadow-sm" : ""}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Tendances
            </Button>
          </div>

          {/* Overview Report */}
          {selectedReport === "overview" && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Agents Actifs</p>
                        <p className="text-2xl font-bold text-blue-900">{data.totalAgents}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Dossiers Traités</p>
                        <p className="text-2xl font-bold text-green-900">{data.totalCases}</p>
                      </div>
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Taux de Réussite</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {Math.round((data.completedCases / data.totalCases) * 100)}%
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Temps Moyen</p>
                        <p className="text-2xl font-bold text-orange-900">{data.averageProcessingTime}j</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Résumé de Performance - {data.period}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Taux de Completion Global</span>
                      <div className="flex items-center space-x-3">
                        <Progress value={(data.completedCases / data.totalCases) * 100} className="w-32 h-2" />
                        <span className="text-sm font-bold w-12">
                          {Math.round((data.completedCases / data.totalCases) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Satisfaction Client</span>
                      <div className="flex items-center space-x-3">
                        <Progress value={(data.clientSatisfaction / 5) * 100} className="w-32 h-2" />
                        <span className="text-sm font-bold w-12">{data.clientSatisfaction}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Efficacité Temporelle</span>
                      <div className="flex items-center space-x-3">
                        <Progress value={85} className="w-32 h-2" />
                        <span className="text-sm font-bold w-12">85%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Agents Performance Report */}
          {selectedReport === "agents" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers - {data.period}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topPerformers.map((performer, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{performer.name}</p>
                            <p className="text-sm text-gray-600">{performer.cases} dossiers traités</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Progress value={performer.rate} className="w-24 h-2" />
                          <span className={`text-sm font-bold ${getPerformanceColor(performer.rate)}`}>
                            {performer.rate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Document Types Report */}
          {selectedReport === "documents" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par Type de Document - {data.period}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.documentTypes.map((docType, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{docType.type}</span>
                        <div className="flex items-center space-x-3">
                          <Progress value={docType.percentage} className="w-32 h-2" />
                          <span className="text-sm font-bold w-16">{docType.count}</span>
                          <span className="text-sm text-gray-600 w-12">{docType.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trends Report */}
          {selectedReport === "trends" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des Dossiers - {data.period}</CardTitle>
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
                            <Progress 
                              value={(item.cases / Math.max(...data.monthlyTrend.map(t => t.cases))) * 100} 
                              className="flex-1 h-2" 
                            />
                            <Progress 
                              value={(item.completed / Math.max(...data.monthlyTrend.map(t => t.completed))) * 100} 
                              className="flex-1 h-2 bg-green-200" 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
