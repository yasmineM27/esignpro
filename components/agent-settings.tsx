"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, User, Bell, Mail, Shield, Save, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface AgentProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  agentId: string
  department: string
  signature: string
  avatar: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  newClientNotifications: boolean
  documentSignedNotifications: boolean
  reminderNotifications: boolean
  weeklyReports: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: string
  passwordLastChanged: string
}

export function AgentSettings() {
  const [activeSection, setActiveSection] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [profile, setProfile] = useState<AgentProfile>({
    firstName: "Wael",
    lastName: "Hamda",
    email: "wael.hamda@esignpro.ch",
    phone: "+41 79 123 45 67",
    agentId: "WH001",
    department: "Résiliations",
    signature: "Cordialement,\nWael Hamda\nConseiller en Assurances\neSignPro",
    avatar: ""
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    newClientNotifications: true,
    documentSignedNotifications: true,
    reminderNotifications: true,
    weeklyReports: true
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: "8h",
    passwordLastChanged: "2024-01-01"
  })

  const handleSaveProfile = () => {
    // Save profile logic here
    console.log("Profile saved:", profile)
  }

  const handleSaveNotifications = () => {
    // Save notifications logic here
    console.log("Notifications saved:", notifications)
  }

  const handleSaveSecurity = () => {
    // Save security logic here
    console.log("Security saved:", security)
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Informations Personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agentId">ID Agent</Label>
              <Input id="agentId" value={profile.agentId} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <Select value={profile.department} onValueChange={(value) => setProfile({ ...profile, department: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Résiliations">Résiliations</SelectItem>
                  <SelectItem value="Souscriptions">Souscriptions</SelectItem>
                  <SelectItem value="Sinistres">Sinistres</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Signature Email</Label>
            <Textarea
              id="signature"
              value={profile.signature}
              onChange={(e) => setProfile({ ...profile, signature: e.target.value })}
              rows={4}
              placeholder="Votre signature automatique pour les emails..."
            />
          </div>

          <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder le Profil
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Préférences de Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications Email</Label>
                <p className="text-sm text-gray-600">Recevoir les notifications par email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications SMS</Label>
                <p className="text-sm text-gray-600">Recevoir les notifications par SMS</p>
              </div>
              <Switch
                checked={notifications.smsNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nouveaux Clients</Label>
                <p className="text-sm text-gray-600">Notification lors de l'ajout d'un nouveau client</p>
              </div>
              <Switch
                checked={notifications.newClientNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, newClientNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Documents Signés</Label>
                <p className="text-sm text-gray-600">Notification quand un document est signé</p>
              </div>
              <Switch
                checked={notifications.documentSignedNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, documentSignedNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rappels Automatiques</Label>
                <p className="text-sm text-gray-600">Rappels pour les dossiers en attente</p>
              </div>
              <Switch
                checked={notifications.reminderNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, reminderNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rapports Hebdomadaires</Label>
                <p className="text-sm text-gray-600">Recevoir un résumé hebdomadaire de vos performances</p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
              />
            </div>
          </div>

          <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder les Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Sécurité du Compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-yellow-200 bg-yellow-50">
            <Shield className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Votre mot de passe a été modifié pour la dernière fois le {new Date(security.passwordLastChanged).toLocaleDateString('fr-CH')}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe actuel"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input id="newPassword" type="password" placeholder="Entrez un nouveau mot de passe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirmez le nouveau mot de passe" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Authentification à deux facteurs</Label>
                <p className="text-sm text-gray-600">Ajouter une couche de sécurité supplémentaire</p>
              </div>
              <Switch
                checked={security.twoFactorAuth}
                onCheckedChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Délai d'expiration de session</Label>
              <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity({ ...security, sessionTimeout: value })}>
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
          </div>

          <Button onClick={handleSaveSecurity} className="bg-red-600 hover:bg-red-700">
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder la Sécurité
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center">
            <Settings className="mr-3 h-6 w-6" />
            Paramètres Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Settings Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeSection === "profile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("profile")}
              className={activeSection === "profile" ? "bg-white shadow-sm" : ""}
            >
              <User className="mr-2 h-4 w-4" />
              Profil
            </Button>
            <Button
              variant={activeSection === "notifications" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("notifications")}
              className={activeSection === "notifications" ? "bg-white shadow-sm" : ""}
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
            <Button
              variant={activeSection === "security" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("security")}
              className={activeSection === "security" ? "bg-white shadow-sm" : ""}
            >
              <Shield className="mr-2 h-4 w-4" />
              Sécurité
            </Button>
          </div>

          {/* Settings Content */}
          {activeSection === "profile" && renderProfileSection()}
          {activeSection === "notifications" && renderNotificationsSection()}
          {activeSection === "security" && renderSecuritySection()}
        </CardContent>
      </Card>
    </div>
  )
}
