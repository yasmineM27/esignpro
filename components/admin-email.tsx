"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Send, Settings, Eye, TestTube, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  type: "client_invitation" | "reminder" | "completion" | "welcome"
  status: "active" | "draft"
  lastModified: string
  usageCount: number
}

interface EmailSettings {
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPassword: string
  fromEmail: string
  fromName: string
  replyToEmail: string
  enableTLS: boolean
  enableAuth: boolean
}

const mockEmailTemplates: EmailTemplate[] = [
  {
    id: "TPL_EMAIL_001",
    name: "Invitation Client - Signature",
    subject: "Finalisation de votre dossier de résiliation",
    type: "client_invitation",
    status: "active",
    lastModified: "2024-01-10",
    usageCount: 156
  },
  {
    id: "TPL_EMAIL_002",
    name: "Rappel - Documents manquants",
    subject: "Rappel: Documents requis pour votre dossier",
    type: "reminder",
    status: "active",
    lastModified: "2024-01-08",
    usageCount: 89
  },
  {
    id: "TPL_EMAIL_003",
    name: "Confirmation - Dossier terminé",
    subject: "Votre dossier de résiliation a été traité",
    type: "completion",
    status: "active",
    lastModified: "2024-01-05",
    usageCount: 203
  },
  {
    id: "TPL_EMAIL_004",
    name: "Bienvenue - Nouveau client",
    subject: "Bienvenue chez eSignPro",
    type: "welcome",
    status: "draft",
    lastModified: "2024-01-12",
    usageCount: 0
  }
]

export function AdminEmail() {
  const [activeTab, setActiveTab] = useState("templates")
  const [emailTemplates, setEmailTemplates] = useState(mockEmailTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: "smtp.resend.com",
    smtpPort: "587",
    smtpUser: "resend",
    smtpPassword: "re_Tx7YrXqY_3qJRkmWvFDi2B8zZpgrwMiCb",
    fromEmail: "noreply@esignpro.ch",
    fromName: "eSignPro",
    replyToEmail: "support@esignpro.ch",
    enableTLS: true,
    enableAuth: true
  })

  const getStatusBadge = (status: EmailTemplate["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Brouillon</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const getTypeBadge = (type: EmailTemplate["type"]) => {
    switch (type) {
      case "client_invitation":
        return <Badge className="bg-blue-100 text-blue-800">Invitation</Badge>
      case "reminder":
        return <Badge className="bg-orange-100 text-orange-800">Rappel</Badge>
      case "completion":
        return <Badge className="bg-green-100 text-green-800">Confirmation</Badge>
      case "welcome":
        return <Badge className="bg-purple-100 text-purple-800">Bienvenue</Badge>
      default:
        return <Badge variant="secondary">Autre</Badge>
    }
  }

  const testEmailConnection = () => {
    // Simulate testing email connection
    console.log("Testing email connection...")
  }

  const sendTestEmail = () => {
    // Simulate sending test email
    console.log("Sending test email...")
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center">
            <Mail className="mr-3 h-6 w-6" />
            Configuration Email
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Email Status Alert */}
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Service email opérationnel</strong> - Dernière vérification: {new Date().toLocaleString('fr-CH')}
            </AlertDescription>
          </Alert>

          {/* Email Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === "templates" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("templates")}
              className={activeTab === "templates" ? "bg-white shadow-sm" : ""}
            >
              <Mail className="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("settings")}
              className={activeTab === "settings" ? "bg-white shadow-sm" : ""}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configuration SMTP
            </Button>
            <Button
              variant={activeTab === "test" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("test")}
              className={activeTab === "test" ? "bg-white shadow-sm" : ""}
            >
              <TestTube className="mr-2 h-4 w-4" />
              Tests
            </Button>
          </div>

          {/* Email Templates */}
          {activeTab === "templates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Templates d'Email ({emailTemplates.length})</h3>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Mail className="mr-2 h-4 w-4" />
                  Nouveau Template
                </Button>
              </div>

              <div className="grid gap-4">
                {emailTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{template.name}</h4>
                            {getTypeBadge(template.type)}
                            {getStatusBadge(template.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Sujet:</strong> {template.subject}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Modifié: {new Date(template.lastModified).toLocaleDateString('fr-CH')}</span>
                            <span>Utilisé: {template.usageCount} fois</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Aperçu
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3 mr-1" />
                            Modifier
                          </Button>
                          <Button size="sm" variant="outline">
                            <Send className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SMTP Settings */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration SMTP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">Serveur SMTP</Label>
                      <Input
                        id="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">Port</Label>
                      <Input
                        id="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">Nom d'utilisateur</Label>
                      <Input
                        id="smtpUser"
                        value={emailSettings.smtpUser}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                        placeholder="username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">Mot de passe / Clé API</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">Email expéditeur</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                        placeholder="noreply@esignpro.ch"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName">Nom expéditeur</Label>
                      <Input
                        id="fromName"
                        value={emailSettings.fromName}
                        onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                        placeholder="eSignPro"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="replyToEmail">Email de réponse</Label>
                    <Input
                      id="replyToEmail"
                      type="email"
                      value={emailSettings.replyToEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, replyToEmail: e.target.value })}
                      placeholder="support@esignpro.ch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Activer TLS/SSL</Label>
                      <p className="text-sm text-gray-600">Chiffrement des communications</p>
                    </div>
                    <Switch
                      checked={emailSettings.enableTLS}
                      onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enableTLS: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Authentification SMTP</Label>
                      <p className="text-sm text-gray-600">Utiliser nom d'utilisateur et mot de passe</p>
                    </div>
                    <Switch
                      checked={emailSettings.enableAuth}
                      onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enableAuth: checked })}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={testEmailConnection} variant="outline">
                      <TestTube className="mr-2 h-4 w-4" />
                      Tester la Connexion
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <Settings className="mr-2 h-4 w-4" />
                      Sauvegarder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Email Tests */}
          {activeTab === "test" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tests d'Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="testEmail">Adresse email de test</Label>
                    <Input
                      id="testEmail"
                      type="email"
                      placeholder="test@example.com"
                      defaultValue="yasminemassaoudi27@gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testTemplate">Template à tester</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un template" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testSubject">Sujet du test</Label>
                    <Input
                      id="testSubject"
                      placeholder="Test de configuration email"
                      defaultValue="Test de configuration email - eSignPro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testMessage">Message de test</Label>
                    <Textarea
                      id="testMessage"
                      rows={4}
                      placeholder="Message de test..."
                      defaultValue="Ceci est un email de test pour vérifier la configuration SMTP d'eSignPro."
                    />
                  </div>

                  <Button onClick={sendTestEmail} className="bg-orange-600 hover:bg-orange-700">
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer Email de Test
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
