"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertCircle, Mail, Phone, Calendar, FileText, Send } from "lucide-react"
import { useState } from "react"

interface PendingCase {
  id: string
  clientName: string
  email: string
  phone: string
  documentType: string
  createdAt: string
  daysWaiting: number
  status: "email_sent" | "awaiting_documents" | "documents_received" | "awaiting_signature"
  lastEmailSent: string
  reminderCount: number
}

const mockPendingCases: PendingCase[] = [
  {
    id: "PD001",
    clientName: "Anna Müller",
    email: "anna.mueller@email.com",
    phone: "+41 79 567 89 01",
    documentType: "Résiliation Auto",
    createdAt: "2024-01-10",
    daysWaiting: 5,
    status: "awaiting_documents",
    lastEmailSent: "2024-01-12",
    reminderCount: 1
  },
  {
    id: "PD002",
    clientName: "Thomas Weber",
    email: "thomas.weber@email.com",
    phone: "+41 79 678 90 12",
    documentType: "Résiliation Habitation",
    createdAt: "2024-01-08",
    daysWaiting: 7,
    status: "awaiting_signature",
    lastEmailSent: "2024-01-14",
    reminderCount: 2
  },
  {
    id: "PD003",
    clientName: "Lisa Schmidt",
    email: "lisa.schmidt@email.com",
    phone: "+41 79 789 01 23",
    documentType: "Résiliation Santé",
    createdAt: "2024-01-11",
    daysWaiting: 4,
    status: "email_sent",
    lastEmailSent: "2024-01-11",
    reminderCount: 0
  }
]

export function AgentPending() {
  const [pendingCases, setPendingCases] = useState(mockPendingCases)

  const getStatusBadge = (status: PendingCase["status"]) => {
    switch (status) {
      case "email_sent":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Mail className="h-3 w-3 mr-1" />Email envoyé</Badge>
      case "awaiting_documents":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><FileText className="h-3 w-3 mr-1" />Attente documents</Badge>
      case "documents_received":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><Clock className="h-3 w-3 mr-1" />Documents reçus</Badge>
      case "awaiting_signature":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100"><AlertCircle className="h-3 w-3 mr-1" />Attente signature</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const getPriorityColor = (daysWaiting: number) => {
    if (daysWaiting >= 7) return "border-red-200 bg-red-50"
    if (daysWaiting >= 5) return "border-yellow-200 bg-yellow-50"
    return "border-gray-200 bg-white"
  }

  const sendReminder = (caseId: string) => {
    setPendingCases(cases =>
      cases.map(c =>
        c.id === caseId
          ? { ...c, reminderCount: c.reminderCount + 1, lastEmailSent: new Date().toISOString().split('T')[0] }
          : c
      )
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center">
            <Clock className="mr-3 h-6 w-6" />
            Dossiers en Attente ({pendingCases.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Summary Alert */}
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>{pendingCases.filter(c => c.daysWaiting >= 7).length}</strong> dossiers nécessitent une attention urgente (7+ jours d'attente)
            </AlertDescription>
          </Alert>

          {/* Pending Cases */}
          <div className="space-y-4">
            {pendingCases.map((pendingCase) => (
              <Card key={pendingCase.id} className={`${getPriorityColor(pendingCase.daysWaiting)} transition-all hover:shadow-md`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{pendingCase.clientName}</h3>
                        {getStatusBadge(pendingCase.status)}
                        {pendingCase.daysWaiting >= 7 && (
                          <Badge variant="destructive" className="animate-pulse">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <div className="flex items-center mb-1">
                            <Mail className="h-3 w-3 mr-1" />
                            {pendingCase.email}
                          </div>
                          <div className="flex items-center mb-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {pendingCase.phone}
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {pendingCase.documentType}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center mb-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Créé le {new Date(pendingCase.createdAt).toLocaleDateString('fr-CH')}
                          </div>
                          <div className="flex items-center mb-1">
                            <Clock className="h-3 w-3 mr-1" />
                            En attente depuis {pendingCase.daysWaiting} jour{pendingCase.daysWaiting > 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center">
                            <Send className="h-3 w-3 mr-1" />
                            {pendingCase.reminderCount} rappel{pendingCase.reminderCount > 1 ? 's' : ''} envoyé{pendingCase.reminderCount > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendReminder(pendingCase.id)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Rappel
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pendingCases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun dossier en attente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
