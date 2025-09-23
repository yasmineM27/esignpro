import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Play, FileText, Users, Clock, Shield } from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
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
                Démonstration Interactive
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Découvrez eSignPro en Action</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Explorez notre plateforme de signature électronique à travers des démonstrations interactives
          </p>
        </div>

        {/* Demo Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Agent Demo */}
          <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8" />
                <div>
                  <CardTitle className="text-xl">Espace Agent</CardTitle>
                  <CardDescription className="text-blue-100">
                    Découvrez l'interface de saisie des données clients
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Vidéo de démonstration</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
                    Saisie rapide des informations client
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
                    Génération automatique des documents
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
                    Envoi d'email sécurisé au client
                  </li>
                </ul>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/agent">Tester l'Espace Agent</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Client Demo */}
          <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-red-600 to-gray-700 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8" />
                <div>
                  <CardTitle className="text-xl">Connexion Client</CardTitle>
                  <CardDescription className="text-red-100">Accès sécurisé à l'espace client</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Démonstration connexion</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="h-2 w-2 bg-red-600 rounded-full mr-3"></div>
                    Connexion sécurisée avec email/mot de passe
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 bg-red-600 rounded-full mr-3"></div>
                    Accès aux documents en attente
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 bg-red-600 rounded-full mr-3"></div>
                    Signature électronique en quelques clics
                  </li>
                </ul>
                <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                  <Link href="/client-login">Tester la Connexion Client</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Showcase */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Fonctionnalités Clés</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Découvrez ce qui rend eSignPro unique
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Rapidité</h3>
                <p className="text-sm text-gray-600">Processus complet en moins de 3 minutes</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Sécurité</h3>
                <p className="text-sm text-gray-600">Conforme SCSE avec chiffrement SSL</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Automatisation</h3>
                <p className="text-sm text-gray-600">Remplissage automatique des formulaires</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Prêt à commencer ?</h2>
          <p className="text-gray-600 mb-6">Contactez-nous pour une démonstration personnalisée</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link href="/contact">Demander une Démo</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">Voir les Tarifs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
