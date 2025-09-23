"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, FileText, Clock, CheckCircle, AlertCircle, Mail, Phone, Users } from "lucide-react"
import { useState } from "react"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  status: "pending" | "documents_uploaded" | "signed" | "completed" | "cancelled"
  createdAt: string
  lastActivity: string
  documentType: string
}

const mockClients: Client[] = [
  {
    id: "CL001",
    name: "Marie Dubois",
    email: "marie.dubois@email.com",
    phone: "+41 79 123 45 67",
    status: "completed",
    createdAt: "2024-01-15",
    lastActivity: "2024-01-16",
    documentType: "Résiliation Auto"
  },
  {
    id: "CL002",
    name: "Jean Martin",
    email: "jean.martin@email.com",
    phone: "+41 79 234 56 78",
    status: "signed",
    createdAt: "2024-01-14",
    lastActivity: "2024-01-15",
    documentType: "Résiliation Habitation"
  },
  {
    id: "CL003",
    name: "Sophie Laurent",
    email: "sophie.laurent@email.com",
    phone: "+41 79 345 67 89",
    status: "documents_uploaded",
    createdAt: "2024-01-13",
    lastActivity: "2024-01-14",
    documentType: "Résiliation Santé"
  },
  {
    id: "CL004",
    name: "Pierre Moreau",
    email: "pierre.moreau@email.com",
    phone: "+41 79 456 78 90",
    status: "pending",
    createdAt: "2024-01-12",
    lastActivity: "2024-01-13",
    documentType: "Résiliation Auto"
  }
]

export function AgentClients() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredClients, setFilteredClients] = useState(mockClients)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = mockClients.filter(client =>
      client.name.toLowerCase().includes(term.toLowerCase()) ||
      client.email.toLowerCase().includes(term.toLowerCase()) ||
      client.id.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredClients(filtered)
  }

  const getStatusBadge = (status: Client["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Terminé</Badge>
      case "signed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><FileText className="h-3 w-3 mr-1" />Signé</Badge>
      case "documents_uploaded":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Documents reçus</Badge>
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100"><AlertCircle className="h-3 w-3 mr-1" />En attente</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Annulé</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center">
            <Users className="mr-3 h-6 w-6" />
            Mes Clients
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email ou ID client..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Clients Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type de Document</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Dernière activité</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-500">ID: {client.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {client.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {client.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{client.documentType}</TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>{new Date(client.createdAt).toLocaleDateString('fr-CH')}</TableCell>
                    <TableCell>{new Date(client.lastActivity).toLocaleDateString('fr-CH')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Documents
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun client trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
