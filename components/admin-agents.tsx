"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Users, Plus, Edit, Trash2, Shield, Mail, Phone, Calendar, BarChart3 } from "lucide-react"
import { useState } from "react"

interface Agent {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  role: "agent" | "supervisor" | "admin"
  status: "active" | "inactive" | "suspended"
  joinDate: string
  lastLogin: string
  casesHandled: number
  completionRate: number
}

const mockAgents: Agent[] = [
  {
    id: "WH001",
    firstName: "Wael",
    lastName: "Hamda",
    email: "wael.hamda@esignpro.ch",
    phone: "+41 79 123 45 67",
    department: "Résiliations",
    role: "agent",
    status: "active",
    joinDate: "2023-06-15",
    lastLogin: "2024-01-15",
    casesHandled: 156,
    completionRate: 91
  },
  {
    id: "SM002",
    firstName: "Sophie",
    lastName: "Martin",
    email: "sophie.martin@esignpro.ch",
    phone: "+41 79 234 56 78",
    department: "Résiliations",
    role: "supervisor",
    status: "active",
    joinDate: "2023-03-10",
    lastLogin: "2024-01-14",
    casesHandled: 203,
    completionRate: 94
  },
  {
    id: "JD003",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@esignpro.ch",
    phone: "+41 79 345 67 89",
    department: "Support",
    role: "agent",
    status: "inactive",
    joinDate: "2023-08-20",
    lastLogin: "2024-01-10",
    casesHandled: 89,
    completionRate: 87
  }
]

export function AdminAgents() {
  const [agents, setAgents] = useState(mockAgents)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const getStatusBadge = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const getRoleBadge = (role: Agent["role"]) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
      case "supervisor":
        return <Badge className="bg-blue-100 text-blue-800"><Users className="h-3 w-3 mr-1" />Superviseur</Badge>
      case "agent":
        return <Badge className="bg-gray-100 text-gray-800">Agent</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const toggleAgentStatus = (agentId: string) => {
    setAgents(agents.map(agent =>
      agent.id === agentId
        ? { ...agent, status: agent.status === "active" ? "inactive" : "active" as Agent["status"] }
        : agent
    ))
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center">
              <Users className="mr-3 h-6 w-6" />
              Gestion des Agents ({agents.length})
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvel Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter un Nouvel Agent</DialogTitle>
                  <DialogDescription>
                    Créer un nouveau compte agent avec les permissions appropriées
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" placeholder="Prénom" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" placeholder="Nom" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@esignpro.ch" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="+41 79 xxx xx xx" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Département</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resiliations">Résiliations</SelectItem>
                        <SelectItem value="souscriptions">Souscriptions</SelectItem>
                        <SelectItem value="sinistres">Sinistres</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="supervisor">Superviseur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Créer Agent
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Agents Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{agent.firstName} {agent.lastName}</div>
                        <div className="text-sm text-gray-500">ID: {agent.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {agent.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {agent.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{agent.department}</TableCell>
                    <TableCell>{getRoleBadge(agent.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(agent.status)}
                        <Switch
                          checked={agent.status === "active"}
                          onCheckedChange={() => toggleAgentStatus(agent.id)}
                          size="sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <BarChart3 className="h-3 w-3 mr-1 text-gray-400" />
                          {agent.casesHandled} dossiers
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          {agent.completionRate}% réussite
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {new Date(agent.lastLogin).toLocaleDateString('fr-CH')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {agents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun agent trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
