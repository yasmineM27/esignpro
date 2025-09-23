"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, Eye, Download, RefreshCw, Lock, Key, Activity } from "lucide-react"
import { useState } from "react"

interface SecurityLog {
  id: string
  timestamp: string
  event: string
  user: string
  ipAddress: string
  status: "success" | "warning" | "error"
  details: string
}

interface SecuritySettings {
  twoFactorRequired: boolean
  sessionTimeout: string
  passwordPolicy: {
    minLength: number
    requireSpecialChars: boolean
    requireNumbers: boolean
    requireUppercase: boolean
  }
  loginAttempts: number
  ipWhitelist: boolean
  auditLogging: boolean
}

const mockSecurityLogs: SecurityLog[] = [
  {
    id: "LOG001",
    timestamp: "2024-01-15 14:30:25",
    event: "Connexion réussie",
    user: "wael.hamda@esignpro.ch",
    ipAddress: "192.168.1.100",
    status: "success",
    details: "Connexion agent depuis l'interface web"
  },
  {
    id: "LOG002",
    timestamp: "2024-01-15 14:25:12",
    event: "Tentative de connexion échouée",
    user: "unknown@test.com",
    ipAddress: "203.0.113.45",
    status: "warning",
    details: "Mot de passe incorrect - 3ème tentative"
  },
  {
    id: "LOG003",
    timestamp: "2024-01-15 14:20:08",
    event: "Signature électronique",
    user: "client@email.com",
    ipAddress: "198.51.100.23",
    status: "success",
    details: "Document signé - ID: DOC123"
  },
  {
    id: "LOG004",
    timestamp: "2024-01-15 14:15:45",
    event: "Accès administrateur",
    user: "admin@esignpro.ch",
    ipAddress: "192.168.1.10",
    status: "success",
    details: "Accès à la configuration système"
  },
  {
    id: "LOG005",
    timestamp: "2024-01-15 14:10:33",
    event: "Tentative d'accès non autorisé",
    user: "hacker@malicious.com",
    ipAddress: "198.51.100.99",
    status: "error",
    details: "Tentative d'accès à l'API sans token valide"
  }
]

export function AdminSecurity() {
  const [securityLogs, setSecurityLogs] = useState(mockSecurityLogs)
  const [activeTab, setActiveTab] = useState("logs")
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorRequired: true,
    sessionTimeout: "8h",
    passwordPolicy: {
      minLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true
    },
    loginAttempts: 3,
    ipWhitelist: false,
    auditLogging: true
  })

  const getStatusBadge = (status: SecurityLog["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Succès</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  const refreshLogs = () => {
    // Simulate refreshing logs
    console.log("Refreshing security logs...")
  }

  const exportLogs = () => {
    // Simulate exporting logs
    console.log("Exporting security logs...")
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center">
              <Shield className="mr-3 h-6 w-6" />
              Sécurité & Audit
            </CardTitle>
            <div className="flex space-x-2">
              <Button className="bg-white text-red-600 hover:bg-red-50" onClick={refreshLogs}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
              <Button className="bg-white text-red-600 hover:bg-red-50" onClick={exportLogs}>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Security Status Alert */}
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Système sécurisé</strong> - Tous les contrôles de sécurité sont opérationnels. 
              Dernière vérification: {new Date().toLocaleString('fr-CH')}
            </AlertDescription>
          </Alert>

          {/* Security Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === "logs" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("logs")}
              className={activeTab === "logs" ? "bg-white shadow-sm" : ""}
            >
              <Activity className="mr-2 h-4 w-4" />
              Logs d'Audit
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("settings")}
              className={activeTab === "settings" ? "bg-white shadow-sm" : ""}
            >
              <Lock className="mr-2 h-4 w-4" />
              Paramètres Sécurité
            </Button>
            <Button
              variant={activeTab === "certificates" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("certificates")}
              className={activeTab === "certificates" ? "bg-white shadow-sm" : ""}
            >
              <Key className="mr-2 h-4 w-4" />
              Certificats SSL
            </Button>
          </div>

          {/* Security Logs */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Journal d'Audit</h3>
                <div className="flex space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrer par type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les événements</SelectItem>
                      <SelectItem value="success">Succès uniquement</SelectItem>
                      <SelectItem value="warning">Avertissements</SelectItem>
                      <SelectItem value="error">Erreurs uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horodatage</TableHead>
                      <TableHead>Événement</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Adresse IP</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {log.timestamp}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.event}</div>
                            <div className="text-sm text-gray-500">{log.details}</div>
                          </div>
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell className="font-mono">{log.ipAddress}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Politique de Sécurité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Authentification à deux facteurs obligatoire</Label>
                      <p className="text-sm text-gray-600">Exiger 2FA pour tous les utilisateurs</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorRequired}
                      onCheckedChange={(checked) => setSettings({ ...settings, twoFactorRequired: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Journalisation d'audit</Label>
                      <p className="text-sm text-gray-600">Enregistrer toutes les actions système</p>
                    </div>
                    <Switch
                      checked={settings.auditLogging}
                      onCheckedChange={(checked) => setSettings({ ...settings, auditLogging: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Liste blanche IP</Label>
                      <p className="text-sm text-gray-600">Restreindre l'accès à certaines adresses IP</p>
                    </div>
                    <Switch
                      checked={settings.ipWhitelist}
                      onCheckedChange={(checked) => setSettings({ ...settings, ipWhitelist: checked })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Délai d'expiration de session</Label>
                      <Select value={settings.sessionTimeout} onValueChange={(value) => setSettings({ ...settings, sessionTimeout: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 heure</SelectItem>
                          <SelectItem value="4h">4 heures</SelectItem>
                          <SelectItem value="8h">8 heures</SelectItem>
                          <SelectItem value="24h">24 heures</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loginAttempts">Tentatives de connexion max</Label>
                      <Input
                        id="loginAttempts"
                        type="number"
                        value={settings.loginAttempts}
                        onChange={(e) => setSettings({ ...settings, loginAttempts: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Politique de mot de passe</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minLength">Longueur minimale</Label>
                        <Input
                          id="minLength"
                          type="number"
                          value={settings.passwordPolicy.minLength}
                          onChange={(e) => setSettings({
                            ...settings,
                            passwordPolicy: { ...settings.passwordPolicy, minLength: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={settings.passwordPolicy.requireSpecialChars}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              passwordPolicy: { ...settings.passwordPolicy, requireSpecialChars: checked }
                            })}
                          />
                          <Label>Caractères spéciaux requis</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={settings.passwordPolicy.requireNumbers}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              passwordPolicy: { ...settings.passwordPolicy, requireNumbers: checked }
                            })}
                          />
                          <Label>Chiffres requis</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={settings.passwordPolicy.requireUppercase}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              passwordPolicy: { ...settings.passwordPolicy, requireUppercase: checked }
                            })}
                          />
                          <Label>Majuscules requises</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="bg-red-600 hover:bg-red-700">
                    <Shield className="mr-2 h-4 w-4" />
                    Sauvegarder la Configuration
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SSL Certificates */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Certificats SSL/TLS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <Key className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Certificat SSL actif</strong> - Valide jusqu'au 15 décembre 2024
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Certificat Principal</h4>
                        <p className="text-sm text-gray-600">esignpro.ch</p>
                        <p className="text-xs text-gray-500">Émis par: Let's Encrypt</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800">Valide</Badge>
                        <p className="text-xs text-gray-500 mt-1">Expire: 15/12/2024</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Renouveler
                      </Button>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>
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
