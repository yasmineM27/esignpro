import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { Shield, FileText, Users, Clock, ArrowRight, Zap, Lock, Globe } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/images/esignpro-logo.png" alt="eSignPro" width={180} height={54} className="h-12 w-auto" />
              <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                Signature Électronique Sécurisée
              </Badge>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/agent" className="text-gray-600 hover:text-gray-900 font-medium">
                Espace Agent
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium">
                Administration
              </Link>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">
                  Connexion
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
              Signature Électronique <span className="text-red-600">Sécurisée</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-pretty">
              Plateforme professionnelle pour la gestion des résiliations d'assurance avec signature électronique
              conforme à la législation suisse (SCSE)
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
                <Link href="/agent">
                  <Users className="mr-2 h-5 w-5" />
                  Espace Agent
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/demo">
                  <FileText className="mr-2 h-5 w-5" />
                  Voir la Démo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fonctionnalités Principales</h2>
            <p className="text-lg text-gray-600">Une solution complète pour vos besoins de signature électronique</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Sécurité Maximale</CardTitle>
                <CardDescription>
                  Conforme SCSE avec chiffrement de bout en bout et authentification forte
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Automatisation Complète</CardTitle>
                <CardDescription>Remplissage automatique des formulaires et génération de documents</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Processus Rapide</CardTitle>
                <CardDescription>Signature en 4 étapes simples avec suivi en temps réel</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Templates Configurables</CardTitle>
                <CardDescription>Bibliothèque de modèles personnalisables pour tous types de documents</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>Traçabilité complète avec horodatage et certificats de signature</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Multi-plateforme</CardTitle>
                <CardDescription>Accessible sur tous appareils avec interface responsive</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-red-100">Disponibilité</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2min</div>
              <div className="text-red-100">Temps moyen</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-red-100">Conforme SCSE</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-red-100">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Prêt à digitaliser vos processus ?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Rejoignez les professionnels qui font confiance à eSignPro pour leurs signatures électroniques
          </p>
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
            <Link href="/agent">
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/images/esignpro-logo.png"
                alt="eSignPro"
                width={150}
                height={45}
                className="h-10 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-gray-400">Solution de signature électronique sécurisée pour professionnels</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white">
                    Sécurité
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Centre d'aide
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-white">
                    Statut
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="hover:text-white">
                    Conformité
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 eSignPro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
