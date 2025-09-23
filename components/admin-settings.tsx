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
import { Settings, Database, Globe, Palette, Bell, Save, RefreshCw, Download, Upload } from "lucide-react"
import { useState } from "react"

interface SystemSettings {
  siteName: string
  siteDescription: string
  supportEmail: string
  maxFileSize: number
  allowedFileTypes: string[]
  sessionTimeout: number
  maintenanceMode: boolean
  debugMode: boolean
  autoBackup: boolean
  backupFrequency: string
  timezone: string
  language: string
  dateFormat: string
  currency: string
}

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "eSignPro",
    siteDescription: "Plateforme de signature électronique sécurisée pour les résiliations d'assurance",
    supportEmail: "support@esignpro.ch",
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "jpg", "jpeg", "png"],
    sessionTimeout: 480, // 8 hours in minutes
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupFrequency: "daily",
    timezone: "Europe/Zurich",
    language: "fr-CH",
    dateFormat: "DD/MM/YYYY",
    currency: "CHF"
  })

  const saveSettings = () => {
    console.log("Saving system settings:", settings)
    // Implementation for saving settings
  }

  const exportSettings = () => {
    console.log("Exporting system settings")
    // Implementation for exporting settings
  }

  const importSettings = () => {
    console.log("Importing system settings")
    // Implementation for importing settings
  }

  const createBackup = () => {
    console.log("Creating system backup")
    // Implementation for creating backup
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center">
              <Settings className="mr-3 h-6 w-6" />
              Paramètres Système
            </CardTitle>
            <div className="flex space-x-2">
              <Button className="bg-white text-gray-600 hover:bg-gray-50" onClick={exportSettings}>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <Button className="bg-white text-gray-600 hover:bg-gray-50" onClick={importSettings}>
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* System Status Alert */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Settings className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Système opérationnel</strong> - Version 2.1.0 • Dernière mise à jour: {new Date().toLocaleDateString('fr-CH')}
            </AlertDescription>
          </Alert>

          {/* Settings Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === "general" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("general")}
              className={activeTab === "general" ? "bg-white shadow-sm" : ""}
            >
              <Globe className="mr-2 h-4 w-4" />
              Général
            </Button>
            <Button
              variant={activeTab === "files" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("files")}
              className={activeTab === "files" ? "bg-white shadow-sm" : ""}
            >
              <Database className="mr-2 h-4 w-4" />
              Fichiers
            </Button>
            <Button
              variant={activeTab === "system" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("system")}
              className={activeTab === "system" ? "bg-white shadow-sm" : ""}
            >
              <Settings className="mr-2 h-4 w-4" />
              Système
            </Button>
            <Button
              variant={activeTab === "backup" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("backup")}
              className={activeTab === "backup" ? "bg-white shadow-sm" : ""}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sauvegarde
            </Button>
          </div>

          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations Générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nom du site</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Email de support</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fuseau horaire</Label>
                      <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Zurich">Europe/Zurich (CET)</SelectItem>
                          <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Langue</Label>
                      <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr-CH">Français (Suisse)</SelectItem>
                          <SelectItem value="de-CH">Deutsch (Schweiz)</SelectItem>
                          <SelectItem value="it-CH">Italiano (Svizzera)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Format de date</Label>
                      <Select value={settings.dateFormat} onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Devise</Label>
                      <Select value={settings.currency} onValueChange={(value) => setSettings({ ...settings, currency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CHF">CHF (Franc Suisse)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          <SelectItem value="USD">USD (Dollar US)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* File Settings */}
          {activeTab === "files" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des Fichiers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Taille maximale des fichiers (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={settings.maxFileSize}
                      onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Types de fichiers autorisés</Label>
                    <div className="flex flex-wrap gap-2">
                      {["pdf", "jpg", "jpeg", "png", "doc", "docx"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={type}
                            checked={settings.allowedFileTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSettings({
                                  ...settings,
                                  allowedFileTypes: [...settings.allowedFileTypes, type]
                                })
                              } else {
                                setSettings({
                                  ...settings,
                                  allowedFileTypes: settings.allowedFileTypes.filter(t => t !== type)
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={type} className="text-sm">.{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Délai d'expiration de session (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                    />
                    <p className="text-sm text-gray-600">
                      Actuellement: {Math.floor(settings.sessionTimeout / 60)}h {settings.sessionTimeout % 60}min
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Settings */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration Système</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mode maintenance</Label>
                      <p className="text-sm text-gray-600">Désactiver l'accès public au site</p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mode debug</Label>
                      <p className="text-sm text-gray-600">Afficher les erreurs détaillées (développement uniquement)</p>
                    </div>
                    <Switch
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => setSettings({ ...settings, debugMode: checked })}
                    />
                  </div>

                  {settings.maintenanceMode && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <Bell className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <strong>Mode maintenance activé</strong> - Le site n'est accessible qu'aux administrateurs
                      </AlertDescription>
                    </Alert>
                  )}

                  {settings.debugMode && (
                    <Alert className="border-red-200 bg-red-50">
                      <Bell className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Mode debug activé</strong> - Ne pas utiliser en production
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sauvegarde et Restauration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sauvegarde automatique</Label>
                      <p className="text-sm text-gray-600">Créer des sauvegardes automatiques du système</p>
                    </div>
                    <Switch
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                    />
                  </div>

                  {settings.autoBackup && (
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
                      <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Toutes les heures</SelectItem>
                          <SelectItem value="daily">Quotidienne</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuelle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="font-medium">Actions de Sauvegarde</h4>
                    <div className="flex space-x-2">
                      <Button onClick={createBackup} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Créer Sauvegarde
                      </Button>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger Sauvegarde
                      </Button>
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Restaurer Sauvegarde
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Dernières Sauvegardes</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Sauvegarde automatique</p>
                          <p className="text-sm text-gray-600">15 janvier 2024, 02:00</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Réussie</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Sauvegarde manuelle</p>
                          <p className="text-sm text-gray-600">14 janvier 2024, 16:30</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Réussie</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} className="bg-gray-600 hover:bg-gray-700">
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder les Paramètres
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
