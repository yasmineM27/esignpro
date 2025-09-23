"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Settings, BarChart3, Clock, CheckCircle, Archive } from "lucide-react"

interface AgentNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AgentNavigation({ activeTab, onTabChange }: AgentNavigationProps) {

  const navigationItems = [
    { id: "new-case", label: "Nouveau Dossier", icon: FileText, active: true },
    { id: "clients", label: "Mes Clients", icon: Users, count: 24 },
    { id: "pending", label: "En Attente", icon: Clock, count: 8 },
    { id: "completed", label: "Terminés", icon: CheckCircle, count: 156 },
    { id: "archive", label: "Archive", icon: Archive, count: 89 },
    { id: "analytics", label: "Statistiques", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ]

  return (
    <Card className="mb-6 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Navigation</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start px-4 py-3 h-auto ${
                activeTab === item.id ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="mr-3 h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count && (
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    activeTab === item.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </Button>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}
