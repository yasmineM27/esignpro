"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { FileText, Plus, Edit, Trash2, Eye, Download, Upload, Settings } from "lucide-react"
import { useState } from "react"

interface DocumentTemplate {
  id: string
  name: string
  type: "resiliation_auto" | "resiliation_habitation" | "resiliation_sante" | "custom"
  description: string
  status: "active" | "draft" | "archived"
  version: string
  createdAt: string
  lastModified: string
  usageCount: number
  fields: TemplateField[]
}

interface TemplateField {
  id: string
  name: string
  type: "text" | "email" | "phone" | "date" | "select" | "checkbox"
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

const mockTemplates: DocumentTemplate[] = [
  {
    id: "TPL001",
    name: "Résiliation Assurance Auto",
    type: "resiliation_auto",
    description: "Template standard pour les résiliations d'assurance automobile",
    status: "active",
    version: "2.1",
    createdAt: "2023-06-01",
    lastModified: "2024-01-10",
    usageCount: 156,
    fields: [
      { id: "f1", name: "clientName", type: "text", label: "Nom du client", required: true },
      { id: "f2", name: "policyNumber", type: "text", label: "Numéro de police", required: true },
      { id: "f3", name: "vehicleInfo", type: "text", label: "Informations véhicule", required: true }
    ]
  },
  {
    id: "TPL002",
    name: "Résiliation Assurance Habitation",
    type: "resiliation_habitation",
    description: "Template pour les résiliations d'assurance habitation",
    status: "active",
    version: "1.8",
    createdAt: "2023-06-01",
    lastModified: "2024-01-08",
    usageCount: 89,
    fields: [
      { id: "f1", name: "clientName", type: "text", label: "Nom du client", required: true },
      { id: "f2", name: "propertyAddress", type: "text", label: "Adresse du bien", required: true },
      { id: "f3", name: "policyNumber", type: "text", label: "Numéro de police", required: true }
    ]
  },
  {
    id: "TPL003",
    name: "Résiliation Assurance Santé",
    type: "resiliation_sante",
    description: "Template pour les résiliations d'assurance santé",
    status: "draft",
    version: "1.0",
    createdAt: "2024-01-05",
    lastModified: "2024-01-12",
    usageCount: 0,
    fields: [
      { id: "f1", name: "clientName", type: "text", label: "Nom du client", required: true },
      { id: "f2", name: "memberNumber", type: "text", label: "Numéro d'assuré", required: true },
      { id: "f3", name: "birthDate", type: "date", label: "Date de naissance", required: true }
    ]
  }
]

export function AdminTemplates() {
  const [templates, setTemplates] = useState(mockTemplates)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const getStatusBadge = (status: DocumentTemplate["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Brouillon</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800">Archivé</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const getTypeBadge = (type: DocumentTemplate["type"]) => {
    switch (type) {
      case "resiliation_auto":
        return <Badge className="bg-blue-100 text-blue-800">Auto</Badge>
      case "resiliation_habitation":
        return <Badge className="bg-purple-100 text-purple-800">Habitation</Badge>
      case "resiliation_sante":
        return <Badge className="bg-red-100 text-red-800">Santé</Badge>
      case "custom":
        return <Badge className="bg-orange-100 text-orange-800">Personnalisé</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(templates.map(template =>
      template.id === templateId
        ? { ...template, status: template.status === "active" ? "draft" : "active" as DocumentTemplate["status"] }
        : template
    ))
  }

  const duplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      const newTemplate = {
        ...template,
        id: `TPL${String(templates.length + 1).padStart(3, '0')}`,
        name: `${template.name} (Copie)`,
        status: "draft" as DocumentTemplate["status"],
        version: "1.0",
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        usageCount: 0
      }
      setTemplates([...templates, newTemplate])
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center">
              <FileText className="mr-3 h-6 w-6" />
              Templates de Documents ({templates.length})
            </CardTitle>
            <div className="flex space-x-2">
              <Button className="bg-white text-green-600 hover:bg-green-50">
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-green-600 hover:bg-green-50">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer un Nouveau Template</DialogTitle>
                    <DialogDescription>
                      Définir un nouveau template de document avec ses champs personnalisés
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="templateName">Nom du Template</Label>
                        <Input id="templateName" placeholder="Ex: Résiliation Auto Premium" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="templateType">Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="resiliation_auto">Résiliation Auto</SelectItem>
                            <SelectItem value="resiliation_habitation">Résiliation Habitation</SelectItem>
                            <SelectItem value="resiliation_sante">Résiliation Santé</SelectItem>
                            <SelectItem value="custom">Personnalisé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="templateDescription">Description</Label>
                      <Textarea id="templateDescription" placeholder="Description du template..." rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Champs du Formulaire</Label>
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Input placeholder="Nom du champ" className="flex-1" />
                          <Select>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texte</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Téléphone</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="select">Liste</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">Ajoutez les champs nécessaires pour ce template</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Créer Template
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Templates Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead>Dernière modification</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                        <div className="text-xs text-gray-400">ID: {template.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(template.type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(template.status)}
                        <Switch
                          checked={template.status === "active"}
                          onCheckedChange={() => toggleTemplateStatus(template.id)}
                          size="sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">v{template.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{template.usageCount}</span> utilisations
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(template.lastModified).toLocaleDateString('fr-CH')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => duplicateTemplate(template.id)}>
                          <Settings className="h-3 w-3 mr-1" />
                          Dupliquer
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {templates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun template trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
