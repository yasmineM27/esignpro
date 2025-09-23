import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

export function AgentStats() {
  const stats = [
    {
      title: "Aujourd'hui",
      value: "12",
      subtitle: "Nouveaux dossiers",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "En cours",
      value: "8",
      subtitle: "Signatures en attente",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Terminés",
      value: "156",
      subtitle: "Ce mois-ci",
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Urgents",
      value: "3",
      subtitle: "À traiter",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Tableau de Bord</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className={`p-3 rounded-lg ${stat.bgColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
