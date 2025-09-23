import { ClientPortalContent } from "@/components/client-portal-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Shield, Clock } from "lucide-react"
import Image from "next/image"

interface ClientPortalPageProps {
  params: {
    clientId: string
  }
}

export default function ClientPortalPage({ params }: ClientPortalPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      {/* Client Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/images/esignpro-logo.png" alt="eSignPro" width={150} height={45} className="h-10 w-auto" />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-light text-gray-800">Signature Électronique Sécurisée</h1>
                <p className="text-sm text-gray-600">Espace Client - Finalisation de votre dossier</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Connexion sécurisée</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-6">
        {/* Welcome Message */}
        <Card className="mb-6 bg-gradient-to-r from-red-600 to-gray-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">Bonjour,</h2>
                <p className="text-red-100">
                  Votre conseiller vous invite à finaliser la signature électronique de vos documents via notre
                  plateforme sécurisée.
                </p>
                <div className="flex items-center mt-2 text-sm text-red-100">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Lien personnel et sécurisé - Expire le 25.08.2025</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Info */}
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">📋 Documents préparés pour signature</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  Vos documents ont été soigneusement préparés par votre conseiller et sont maintenant prêts pour la
                  signature électronique. Une seule signature validera l'ensemble de vos documents.
                </p>
                <p className="text-xs text-yellow-600">
                  ID Dossier: <span className="font-mono font-medium">{params.clientId}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Guarantee */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">🛡️ Sécurité garantie</h3>
                <p className="text-sm text-green-700">
                  Votre signature électronique a la même valeur juridique qu'une signature manuscrite selon la
                  législation suisse (SCSE).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Process Steps */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-red-600 text-white rounded-t-lg">
            <CardTitle>Processus de signature simplifié :</CardTitle>
            <CardDescription className="text-gray-100">
              Suivez ces 4 étapes pour finaliser votre dossier
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center mb-3">
                  <span className="font-bold">1</span>
                </div>
                <h3 className="font-semibold text-blue-900 mb-1">Cliquez sur le bouton</h3>
                <p className="text-sm text-blue-700">de signature sécurisée</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <div className="h-12 w-12 bg-orange-600 text-white rounded-full flex items-center justify-center mb-3">
                  <span className="font-bold">2</span>
                </div>
                <h3 className="font-semibold text-orange-900 mb-1">Vérifiez et consultez</h3>
                <p className="text-sm text-orange-700">vos documents</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <div className="h-12 w-12 bg-purple-600 text-white rounded-full flex items-center justify-center mb-3">
                  <span className="font-bold">3</span>
                </div>
                <h3 className="font-semibold text-purple-900 mb-1">Procédez à votre</h3>
                <p className="text-sm text-purple-700">signature électronique</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="h-12 w-12 bg-green-600 text-white rounded-full flex items-center justify-center mb-3">
                  <span className="font-bold">4</span>
                </div>
                <h3 className="font-semibold text-green-900 mb-1">Recevez la confirmation</h3>
                <p className="text-sm text-green-700">de signature</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <ClientPortalContent clientId={params.clientId} />

        {/* Footer */}
        <Card className="mt-8 bg-gray-50 border-gray-200">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              En utilisant cette plateforme et en procédant à la signature électronique, vous acceptez nos conditions
              d'utilisation et notre politique de confidentialité.
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-500 mb-4">
              <a href="#" className="hover:text-red-600 underline">
                Conditions d'utilisation
              </a>
              <a href="#" className="hover:text-red-600 underline">
                Politique de confidentialité
              </a>
              <a href="#" className="hover:text-red-600 underline">
                Support technique
              </a>
            </div>
            <div className="text-xs text-gray-400 border-t pt-4">
              <p>Cordialement,</p>
              <p className="font-semibold">wael hamda</p>
              <p>Votre conseiller - eSignPro</p>
              <p>Envoyé le 18.08.2025</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
