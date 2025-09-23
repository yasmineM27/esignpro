import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Search, BookOpen, Video, MessageCircle, FileText, Users, Shield, HelpCircle } from "lucide-react"

export default function HelpPage() {
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
                Centre d'Aide
              </Badge>
            </div>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/contact">Nous Contacter</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Centre d'Aide eSignPro</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Trouvez rapidement les réponses à vos questions et apprenez à utiliser eSignPro efficacement
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Rechercher dans l'aide..."
              className="pl-12 py-3 text-lg border-2 border-gray-200 focus:border-red-500"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Guide de Démarrage</h3>
              <p className="text-sm text-gray-600">Premiers pas avec eSignPro</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tutoriels Vidéo</h3>
              <p className="text-sm text-gray-600">Apprenez en regardant</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">FAQ</h3>
              <p className="text-sm text-gray-600">Questions fréquentes</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-sm text-gray-600">Contactez notre équipe</p>
            </CardContent>
          </Card>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Getting Started */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <BookOpen className="h-6 w-6 mr-3" />
                Premiers Pas
              </CardTitle>
              <CardDescription className="text-blue-100">Tout ce qu'il faut savoir pour commencer</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Configuration initiale</h4>
                    <p className="text-sm text-gray-600">Comment configurer votre compte eSignPro</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Créer votre premier document</h4>
                    <p className="text-sm text-gray-600">Guide étape par étape</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Inviter des clients</h4>
                    <p className="text-sm text-gray-600">Comment envoyer des documents à signer</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Gérer les templates</h4>
                    <p className="text-sm text-gray-600">Créer et personnaliser vos modèles</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Features */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-3" />
                Espace Agent
              </CardTitle>
              <CardDescription className="text-green-100">Fonctionnalités pour les agents</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Saisie des données client</h4>
                    <p className="text-sm text-gray-600">Comment remplir le formulaire client</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Génération automatique</h4>
                    <p className="text-sm text-gray-600">Comprendre le remplissage automatique</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Suivi des dossiers</h4>
                    <p className="text-sm text-gray-600">Suivre l'état des signatures</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Rapports d'activité</h4>
                    <p className="text-sm text-gray-600">Consulter vos statistiques</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Portal */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <FileText className="h-6 w-6 mr-3" />
                Portail Client
              </CardTitle>
              <CardDescription className="text-red-100">Guide pour vos clients</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Accéder au portail</h4>
                    <p className="text-sm text-gray-600">Comment utiliser le lien reçu par email</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Upload des documents</h4>
                    <p className="text-sm text-gray-600">Télécharger pièce d'identité recto/verso</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Signature électronique</h4>
                    <p className="text-sm text-gray-600">Comment signer électroniquement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Problèmes courants</h4>
                    <p className="text-sm text-gray-600">Solutions aux difficultés fréquentes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Compliance */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 mr-3" />
                Sécurité & Conformité
              </CardTitle>
              <CardDescription className="text-purple-100">Informations sur la sécurité</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Conformité SCSE</h4>
                    <p className="text-sm text-gray-600">Valeur juridique des signatures</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Protection des données</h4>
                    <p className="text-sm text-gray-600">Comment nous protégeons vos données</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Audit trail</h4>
                    <p className="text-sm text-gray-600">Traçabilité des signatures</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Certificats</h4>
                    <p className="text-sm text-gray-600">Nos certifications de sécurité</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <Card className="shadow-xl border-0 mt-12 bg-gradient-to-r from-gray-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vous ne trouvez pas ce que vous cherchez ?</h2>
            <p className="text-gray-600 mb-6">Notre équipe support est disponible pour vous aider personnellement</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
                <Link href="/contact">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Contacter le Support
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/demo">
                  <Video className="mr-2 h-5 w-5" />
                  Planifier une Démo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
