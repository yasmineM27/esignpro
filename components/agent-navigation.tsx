"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Users,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  Archive,
  FileText,
  Download
} from "lucide-react"

interface AgentNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

interface NavigationStats {
  clients: number
  pending: number
  completed: number
  archive: number
}

export function AgentNavigation({ activeTab, onTabChange }: AgentNavigationProps) {
  const [stats, setStats] = useState<NavigationStats>({
    clients: 0,
    pending: 0,
    completed: 0,
    archive: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadNavigationStats = async () => {
    try {
      setIsLoading(true)

      // Charger les statistiques depuis l'API
      const [clientsRes, pendingRes, statsRes] = await Promise.all([
        fetch('/api/agent/clients?status=all&limit=1'),
        fetch('/api/agent/pending?limit=1'),
        fetch('/api/agent/stats?period=30')
      ])

      const [clientsData, pendingData, statsData] = await Promise.all([
        clientsRes.json(),
        pendingRes.json(),
        statsRes.json()
      ])

      setStats({
        clients: clientsData.success ? clientsData.stats?.total || 0 : 0,
        pending: pendingData.success ? pendingData.stats?.total || 0 : 0,
        completed: statsData.success ? statsData.stats?.casesByStatus?.completed || 0 : 0,
        archive: 0 // TODO: Implémenter les archives
      })
    } catch (error) {
      console.error('Erreur chargement stats navigation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les statistiques pour les badges
  useEffect(() => {
    loadNavigationStats()

    // Recharger toutes les 30 secondes
    const interval = setInterval(loadNavigationStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const navigationItems = [
    {
      id: "new-case",
      label: "Nouveau Dossier",
      icon: Plus,
      description: "Créer un nouveau dossier",
      count: null
    },
    {
      id: "clients",
      label: "Mes Clients",
      icon: Users,
      description: "Gérer vos clients",
      count: stats.clients > 0 ? stats.clients : null
    },
    {
      id: "pending",
      label: "En Attente",
      icon: Clock,
      description: "Dossiers en attente",
      count: stats.pending > 0 ? stats.pending : null,
      urgent: stats.pending > 0
    },
    {
      id: "completed",
      label: "Terminés",
      icon: CheckCircle,
      description: "Dossiers terminés",
      count: stats.completed > 0 ? stats.completed : null
    },
    {
      id: "archive",
      label: "Archive",
      icon: Archive,
      description: "Dossiers archivés",
      count: stats.archive > 0 ? stats.archive : null
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      description: "Historique des documents",
      count: null
    },
    {
      id: "analytics",
      label: "Statistiques",
      icon: BarChart3,
      description: "Analyses et rapports",
      count: null
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: Settings,
      description: "Configuration",
      count: null
    },
  ]

  return (
    <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Navigation</CardTitle>
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <nav className="space-y-1 px-4 pb-4">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start px-4 py-3 h-auto ${
                  isActive ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs ${isActive ? "text-blue-100" : "text-gray-500"}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {item.count && (
                    <Badge
                      variant={isActive ? "secondary" : "default"}
                      className={`${
                        isActive
                          ? "bg-white/20 text-white border-white/30"
                          : item.urgent
                            ? "bg-red-100 text-red-800 border-red-200 animate-pulse"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {item.count}
                    </Badge>
                  )}
                </div>
              </Button>
            )
          })}
        </nav>

        {/* Indicateur de mise à jour */}
        <div className="px-4 pb-4 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Dernière mise à jour</span>
            <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
