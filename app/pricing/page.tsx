import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Star, Users, Building, Crown } from "lucide-react"

export default function PricingPage() {
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
                Tarifs Transparents
              </Badge>
            </div>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/demo">Essai Gratuit</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Tarifs eSignPro</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choisissez la formule qui correspond à vos besoins. Tous les plans incluent un essai gratuit de 30 jours.
          </p>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-lg px-4 py-2">
            🎉 Offre de lancement : -50% sur tous les plans pendant 3 mois
          </Badge>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Starter Plan */}
          <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Starter</CardTitle>
              <CardDescription>Parfait pour les agents individuels</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">29€</span>
                <span className="text-gray-600">/mois</span>
              </div>
              <div className="text-sm text-gray-500">
                <span className="line-through">58€</span> pendant 3 mois
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Jusqu'à 50 signatures/mois</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Templates de base</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Support email</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Stockage 1GB</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Audit trail basique</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">Commencer l'essai gratuit</Button>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="border-2 border-red-500 shadow-xl hover:shadow-2xl transition-shadow relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-red-600 text-white px-4 py-1">
                <Star className="h-4 w-4 mr-1" />
                Populaire
              </Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Professional</CardTitle>
              <CardDescription>Idéal pour les équipes et agences</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">89€</span>
                <span className="text-gray-600">/mois</span>
              </div>
              <div className="text-sm text-gray-500">
                <span className="line-through">178€</span> pendant 3 mois
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Signatures illimitées</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Templates personnalisables</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Support prioritaire</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Stockage 10GB</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Analytics avancées</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">API intégration</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Branding personnalisé</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-red-600 hover:bg-red-700">Commencer l'essai gratuit</Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <CardDescription>Pour les grandes organisations</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">Sur mesure</span>
              </div>
              <div className="text-sm text-gray-500">Contactez-nous pour un devis</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Volume illimité</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Déploiement on-premise</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Support dédié 24/7</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Stockage illimité</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">SLA garantie</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Formation équipe</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm">Développements sur mesure</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full mt-6 border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
              >
                Nous contacter
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="shadow-xl border-0 mb-12">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Questions Fréquentes</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Puis-je changer de plan à tout moment ?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet
                  immédiatement.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Y a-t-il des frais d'installation ?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Non, aucun frais d'installation. Vous payez uniquement votre abonnement mensuel.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Que se passe-t-il après l'essai gratuit ?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Après 30 jours, vous pouvez choisir un plan payant ou votre compte sera suspendu (données conservées
                  90 jours).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Acceptez-vous les paiements par virement ?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Oui, nous acceptons les virements bancaires pour les plans Professional et Enterprise.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prêt à commencer ?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Rejoignez des centaines de professionnels qui font confiance à eSignPro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link href="/demo">Essai Gratuit 30 Jours</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Parler à un Expert</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
