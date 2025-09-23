import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Shield, Eye, Lock, FileText } from "lucide-react"

export default function PrivacyPage() {
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
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Politique de Confidentialité</h1>
          <p className="text-lg text-gray-600">Dernière mise à jour : 21 septembre 2024</p>
        </div>

        {/* Content */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8 prose prose-gray max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-6 w-6 text-blue-600 mr-3" />
                  1. Collecte des Données
                </h2>
                <p className="text-gray-600 mb-4">
                  eSignPro collecte uniquement les données nécessaires au fonctionnement de notre service de signature
                  électronique :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>
                    <strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone
                  </li>
                  <li>
                    <strong>Données professionnelles :</strong> entreprise, fonction, secteur d'activité
                  </li>
                  <li>
                    <strong>Documents :</strong> fichiers uploadés pour signature, pièces d'identité
                  </li>
                  <li>
                    <strong>Données techniques :</strong> adresse IP, navigateur, horodatage des actions
                  </li>
                  <li>
                    <strong>Signatures électroniques :</strong> données biométriques de signature, certificats
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-6 w-6 text-green-600 mr-3" />
                  2. Utilisation des Données
                </h2>
                <p className="text-gray-600 mb-4">Vos données sont utilisées exclusivement pour :</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Fournir le service de signature électronique</li>
                  <li>Authentifier l'identité des signataires</li>
                  <li>Générer les certificats de signature</li>
                  <li>Assurer la traçabilité et l'audit trail</li>
                  <li>Respecter nos obligations légales et réglementaires</li>
                  <li>Améliorer la qualité de nos services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-purple-600 mr-3" />
                  3. Protection des Données
                </h2>
                <p className="text-gray-600 mb-4">Nous mettons en œuvre des mesures de sécurité strictes :</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>
                    <strong>Chiffrement :</strong> AES-256 pour toutes les données sensibles
                  </li>
                  <li>
                    <strong>Hébergement :</strong> serveurs sécurisés en Suisse uniquement
                  </li>
                  <li>
                    <strong>Accès :</strong> contrôle d'accès strict avec authentification forte
                  </li>
                  <li>
                    <strong>Surveillance :</strong> monitoring 24/7 et détection d'intrusion
                  </li>
                  <li>
                    <strong>Sauvegarde :</strong> copies de sécurité chiffrées et redondantes
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-6 w-6 text-red-600 mr-3" />
                  4. Vos Droits
                </h2>
                <p className="text-gray-600 mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Droit d'accès</h3>
                    <p className="text-sm text-gray-600">Consulter vos données personnelles</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Droit de rectification</h3>
                    <p className="text-sm text-gray-600">Corriger vos informations</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Droit à l'effacement</h3>
                    <p className="text-sm text-gray-600">Supprimer vos données</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Droit à la portabilité</h3>
                    <p className="text-sm text-gray-600">Récupérer vos données</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Partage des Données</h2>
                <p className="text-gray-600 mb-4">
                  eSignPro ne partage jamais vos données personnelles avec des tiers, sauf :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Avec votre consentement explicite</li>
                  <li>Pour respecter une obligation légale</li>
                  <li>Avec nos sous-traitants techniques (hébergement, maintenance) sous contrat strict</li>
                  <li>En cas de fusion ou acquisition (avec notification préalable)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Durée de Conservation</h2>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      <strong>Documents signés :</strong> 10 ans (obligation légale)
                    </li>
                    <li>
                      <strong>Audit trail :</strong> 10 ans (traçabilité)
                    </li>
                    <li>
                      <strong>Données personnelles :</strong> 3 ans après dernière activité
                    </li>
                    <li>
                      <strong>Logs techniques :</strong> 1 an maximum
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies et Traceurs</h2>
                <p className="text-gray-600 mb-4">
                  Notre site utilise uniquement des cookies essentiels au fonctionnement :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Cookies de session (authentification)</li>
                  <li>Cookies de sécurité (protection CSRF)</li>
                  <li>Cookies de préférences (langue, thème)</li>
                </ul>
                <p className="text-gray-600 mt-4">Aucun cookie publicitaire ou de tracking n'est utilisé.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :
                  </p>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>Responsable du traitement :</strong> eSignPro SA
                    </p>
                    <p>
                      <strong>Adresse :</strong> Rue du Commerce 15, 1204 Genève, Suisse
                    </p>
                    <p>
                      <strong>Email :</strong> privacy@esignpro.ch
                    </p>
                    <p>
                      <strong>Téléphone :</strong> +41 22 555 12 34
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications</h2>
                <p className="text-gray-600">
                  Cette politique peut être modifiée pour refléter les évolutions de nos services ou de la
                  réglementation. Toute modification importante vous sera notifiée par email au moins 30 jours avant son
                  entrée en vigueur.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Des Questions ?</h2>
          <p className="text-gray-600 mb-6">
            Notre équipe est disponible pour répondre à toutes vos questions sur la confidentialité
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/contact">Nous Contacter</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
