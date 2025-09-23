import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Shield, Lock, FileCheck, Eye, Server, Award, CheckCircle } from "lucide-react"

export default function SecurityPage() {
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
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                Sécurité Maximale
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Sécurité & Conformité</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            eSignPro respecte les plus hauts standards de sécurité et de conformité pour protéger vos données et
            garantir la valeur juridique de vos signatures électroniques.
          </p>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-lg px-6 py-2">
            🏆 Conforme SCSE (Signature Électronique Suisse)
          </Badge>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Chiffrement de Bout en Bout</CardTitle>
              <CardDescription>Toutes vos données sont chiffrées avec les standards les plus élevés</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Chiffrement AES-256
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  SSL/TLS 1.3
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Clés de chiffrement rotatives
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Conformité Légale</CardTitle>
              <CardDescription>Signatures électroniques avec valeur juridique complète</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Conforme SCSE
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Respect du RGPD
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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Authentification Forte</CardTitle>
              <CardDescription>Vérification d'identité multi-niveaux pour chaque signature</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Authentification 2FA
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Vérification email/SMS
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Contrôle d'accès granulaire
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Server className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Infrastructure Sécurisée</CardTitle>
              <CardDescription>Hébergement en Suisse avec redondance et sauvegarde</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Centres de données suisses
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Disponibilité 99.9%
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Sauvegarde automatique
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>Certifié par les organismes de sécurité reconnus</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  ISO 27001
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  SOC 2 Type II
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Audit annuel
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Protection des Données</CardTitle>
              <CardDescription>Respect strict de la confidentialité et de la vie privée</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Données en Suisse uniquement
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Anonymisation automatique
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Droit à l'oubli
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Details */}
        <Card className="shadow-xl border-0 mb-12">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Conformité Réglementaire</CardTitle>
            <CardDescription className="text-green-100 text-center">
              eSignPro respecte toutes les réglementations suisses et européennes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileCheck className="h-5 w-5 text-green-600 mr-2" />
                  SCSE - Signature Électronique Suisse
                </h3>
                <p className="text-gray-600 mb-4">
                  Nos signatures électroniques ont la même valeur juridique qu'une signature manuscrite selon la
                  législation suisse.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Horodatage qualifié</li>
                  <li>• Certificats numériques</li>
                  <li>• Traçabilité complète</li>
                  <li>• Non-répudiation garantie</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  RGPD - Protection des Données
                </h3>
                <p className="text-gray-600 mb-4">
                  Conformité totale avec le Règlement Général sur la Protection des Données.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Consentement explicite</li>
                  <li>• Droit d'accès et de rectification</li>
                  <li>• Portabilité des données</li>
                  <li>• Notification de violation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card className="shadow-xl border-0 mb-12">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Mesures de Sécurité Techniques</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Architecture sécurisée de bout en bout
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Chiffrement</h3>
                <p className="text-sm text-gray-600">
                  Chiffrement AES-256 pour les données au repos et en transit avec rotation automatique des clés
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Server className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Infrastructure</h3>
                <p className="text-sm text-gray-600">
                  Hébergement redondant en Suisse avec monitoring 24/7 et plan de continuité d'activité
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Surveillance</h3>
                <p className="text-sm text-gray-600">
                  Détection d'intrusion en temps réel avec logs d'audit complets et alertes automatiques
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Center */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Centre de Confiance</h2>
          <p className="text-lg text-gray-600 mb-8">
            Consultez nos rapports de sécurité et certifications en temps réel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/status">
                <Shield className="mr-2 h-5 w-5" />
                Statut Sécurité
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/compliance">
                <Award className="mr-2 h-5 w-5" />
                Rapports Conformité
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
