import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Shield,
  Zap,
  FileText,
  Users,
  Clock,
  Globe,
  Lock,
  BarChart3,
  Mail,
  Settings,
  CheckCircle,
} from "lucide-react"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Accueil
                </Link>
              </Button>
              <Image src="/images/esignpro-logo.png" alt="eSignPro" width={150} height={45} className="h-10 w-auto" />
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                Fonctionnalités Complètes
              </Badge>
            </div>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/demo">Voir la Démo</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Fonctionnalités eSignPro</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Une plateforme complète de signature électronique conçue spécifiquement pour les professionnels de
            l'assurance
          </p>
        </div>

        {/* Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Sécurité Maximale</CardTitle>
              <CardDescription>
                Conforme à la législation suisse (SCSE) avec chiffrement de bout en bout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Chiffrement SSL/TLS
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Authentification forte
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Audit trail complet
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Automatisation Complète</CardTitle>
              <CardDescription>Remplissage automatique des formulaires et génération de documents</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Templates configurables
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Génération PDF/Word
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Workflow automatisé
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Processus Rapide</CardTitle>
              <CardDescription>Signature en 4 étapes simples avec suivi en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Interface intuitive
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Notifications temps réel
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Suivi de progression
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Gestion Documentaire</CardTitle>
              <CardDescription>Bibliothèque complète de templates et archivage sécurisé</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Templates personnalisables
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Archivage automatique
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Recherche avancée
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Analytics & Reporting</CardTitle>
              <CardDescription>Tableaux de bord et rapports détaillés pour le suivi d'activité</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Statistiques en temps réel
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Rapports personnalisés
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Export Excel/PDF
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Multi-plateforme</CardTitle>
              <CardDescription>Accessible sur tous appareils avec interface responsive</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Web responsive
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Compatible mobile
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  API intégration
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Features */}
        <Card className="shadow-xl border-0 mb-12">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Fonctionnalités Avancées</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Pour les utilisateurs professionnels exigeants
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  Gestion Multi-Utilisateurs
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Rôles et permissions granulaires</li>
                  <li>• Espaces de travail séparés</li>
                  <li>• Collaboration en équipe</li>
                  <li>• Délégation de tâches</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="h-5 w-5 text-green-600 mr-2" />
                  Notifications Intelligentes
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Emails automatiques personnalisés</li>
                  <li>• Rappels programmés</li>
                  <li>• Notifications push</li>
                  <li>• Intégration SMS</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-5 w-5 text-red-600 mr-2" />
                  Sécurité Renforcée
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Authentification à deux facteurs</li>
                  <li>• Certificats numériques</li>
                  <li>• Horodatage qualifié</li>
                  <li>• Conformité RGPD</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 text-purple-600 mr-2" />
                  Personnalisation Avancée
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Branding personnalisé</li>
                  <li>• Workflows sur mesure</li>
                  <li>• Intégrations API</li>
                  <li>• Champs dynamiques</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Découvrez eSignPro en Action</h2>
          <p className="text-lg text-gray-600 mb-8">Testez toutes ces fonctionnalités gratuitement pendant 30 jours</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link href="/demo">Essai Gratuit</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Demander une Démo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
