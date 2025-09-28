"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Settings, 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Save,
  RefreshCw,
  Check,
  AlertCircle
} from "lucide-react"

interface AgentSettings {
  profile: {
    name: string
    email: string
    phone: string
    signature: string
  }
  notifications: {
    emailOnSignature: boolean
    emailOnNewCase: boolean
    emailOnExpiry: boolean
    smsNotifications: boolean
  }
  preferences: {
    theme: string
    language: string
    timezone: string
    autoRefresh: boolean
    refreshInterval: number
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    ipWhitelist: string
  }
}

export function AgentSettingsDynamic() {
  const [settings, setSettings] = useState<AgentSettings>({
    profile: {
      name: "Agent eSignPro",
      email: "yasminemassaoudi27@gmail.com",
      phone: "",
      signature: ""
    },
    notifications: {
      emailOnSignature: true,
      emailOnNewCase: true,
      emailOnExpiry: true,
      smsNotifications: false
    },
    preferences: {
      theme: "light",
      language: "fr",
      timezone: "Europe/Paris",
      autoRefresh: true,
      refreshInterval: 30
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 60,
      ipWhitelist: ""
    }
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = (section: keyof AgentSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Préférences", icon: Palette },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "database", label: "Base de données", icon: Database }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={settings.profile.name}
                  onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                  placeholder="Votre nom complet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={settings.profile.phone}
                onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signature">Signature électronique</Label>
              <Textarea
                id="signature"
                value={settings.profile.signature}
                onChange={(e) => updateSetting('profile', 'signature', e.target.value)}
                placeholder="Votre signature électronique..."
                rows={4}
              />
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notification par email - Nouvelle signature</Label>
                  <p className="text-sm text-gray-500">Recevoir un email quand un client signe un document</p>
                </div>
                <Switch
                  checked={settings.notifications.emailOnSignature}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailOnSignature', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notification par email - Nouveau dossier</Label>
                  <p className="text-sm text-gray-500">Recevoir un email pour chaque nouveau dossier créé</p>
                </div>
                <Switch
                  checked={settings.notifications.emailOnNewCase}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailOnNewCase', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notification par email - Expiration</Label>
                  <p className="text-sm text-gray-500">Recevoir un email quand un dossier va expirer</p>
                </div>
                <Switch
                  checked={settings.notifications.emailOnExpiry}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailOnExpiry', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications SMS</Label>
                  <p className="text-sm text-gray-500">Recevoir des SMS pour les événements importants</p>
                </div>
                <Switch
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                />
              </div>
            </div>
          </div>
        )

      case "preferences":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Thème</Label>
                <Select value={settings.preferences.theme} onValueChange={(value) => updateSetting('preferences', 'theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="auto">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Langue</Label>
                <Select value={settings.preferences.language} onValueChange={(value) => updateSetting('preferences', 'language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Fuseau horaire</Label>
              <Select value={settings.preferences.timezone} onValueChange={(value) => updateSetting('preferences', 'timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Actualisation automatique</Label>
                  <p className="text-sm text-gray-500">Actualiser automatiquement les données</p>
                </div>
                <Switch
                  checked={settings.preferences.autoRefresh}
                  onCheckedChange={(checked) => updateSetting('preferences', 'autoRefresh', checked)}
                />
              </div>
              
              {settings.preferences.autoRefresh && (
                <div className="space-y-2">
                  <Label>Intervalle d'actualisation (secondes)</Label>
                  <Select 
                    value={settings.preferences.refreshInterval.toString()} 
                    onValueChange={(value) => updateSetting('preferences', 'refreshInterval', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 secondes</SelectItem>
                      <SelectItem value="30">30 secondes</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )

      case "security":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Authentification à deux facteurs</Label>
                  <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Timeout de session (minutes)</Label>
              <Select 
                value={settings.security.sessionTimeout.toString()} 
                onValueChange={(value) => updateSetting('security', 'sessionTimeout', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                  <SelectItem value="120">2 heures</SelectItem>
                  <SelectItem value="480">8 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Liste blanche IP</Label>
              <Textarea
                value={settings.security.ipWhitelist}
                onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value)}
                placeholder="192.168.1.1&#10;10.0.0.1&#10;..."
                rows={4}
              />
              <p className="text-sm text-gray-500">Une adresse IP par ligne. Laissez vide pour autoriser toutes les IPs.</p>
            </div>
          </div>
        )

      case "database":
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">Informations de la base de données</h3>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Ces informations sont en lecture seule et gérées automatiquement par le système.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Statistiques générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total dossiers:</span>
                      <span className="font-medium">30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total clients:</span>
                      <span className="font-medium">10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total signatures:</span>
                      <span className="font-medium">17</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total emails:</span>
                      <span className="font-medium">18</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">État du système</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base de données:</span>
                      <span className="text-green-600 font-medium">✓ Connectée</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service email:</span>
                      <span className="text-green-600 font-medium">✓ Opérationnel</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stockage fichiers:</span>
                      <span className="text-green-600 font-medium">✓ Disponible</span>
                    </div>
                    <div className="flex justify-between">
                      <span>APIs externes:</span>
                      <span className="text-green-600 font-medium">✓ Actives</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>Paramètres Agent</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation des onglets */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      activeTab === tab.id 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {tab.label}
                  </Button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Contenu de l'onglet */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            {renderTabContent()}
            
            {/* Bouton de sauvegarde */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
              {isSaved && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Paramètres sauvegardés</span>
                </div>
              )}
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
