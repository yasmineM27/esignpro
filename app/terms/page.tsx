import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, FileText, Scale, Shield, AlertTriangle } from "lucide-react"

export default function TermsPage() {
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
            <Scale className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-lg text-gray-600">Dernière mise à jour : 21 septembre 2024</p>
        </div>

        {/* Content */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8 prose prose-gray max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-6 w-6 text-blue-600 mr-3" />
                  1. Objet et Champ d'Application
                </h2>
                <p className="text-gray-600 mb-4">
                  Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme
                  eSignPro, service de signature électronique fourni par eSignPro SA, société de droit suisse.
                </p>
                <p className="text-gray-600">
                  L'utilisation de nos services implique l'acceptation pleine et entière des présentes CGU.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Définitions</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <ul className="space-y-3 text-gray-700">
                    <li>
                      <strong>Plateforme :</strong> Le service eSignPro accessible via le site web et les applications
                    </li>
                    <li>
                      <strong>Utilisateur :</strong> Toute personne physique ou morale utilisant la Plateforme
                    </li>
                    <li>
                      <strong>Agent :</strong> Professionnel autorisé à créer et envoyer des documents à signer
                    </li>
                    <li>
                      <strong>Client :</strong> Personne invitée à signer un document via la Plateforme
                    </li>
                    <li>
                      <strong>Signature Électronique :</strong> Signature conforme à la législation suisse (SCSE)
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-green-600 mr-3" />
                  3. Services Fournis
                </h2>
                <p className="text-gray-600 mb-4">eSignPro fournit les services suivants :</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Création et gestion de documents électroniques</li>
                  <li>Signature électronique sécurisée et conforme SCSE</li>
                  <li>Authentification des signataires</li>
                  <li>Horodatage qualifié des signatures</li>
                  <li>Archivage sécurisé des documents signés</li>
                  <li>Audit trail complet et traçabilité</li>
                  <li>Notifications automatiques par email</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Inscription et Compte Utilisateur</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Conditions d'inscription</h3>
                    <p className="text-gray-600">
                      L'inscription est réservée aux professionnels majeurs disposant de la capacité juridique. Les
                      informations fournies doivent être exactes et à jour.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Responsabilité du compte</h3>
                    <p className="text-gray-600">
                      L'Utilisateur est responsable de la confidentialité de ses identifiants et de toutes les actions
                      effectuées sous son compte.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Utilisation de la Plateforme</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Utilisations Autorisées</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Signature de documents légaux</li>
                      <li>• Authentification d'identité</li>
                      <li>• Archivage sécurisé</li>
                      <li>• Usage professionnel</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-900 mb-2">❌ Utilisations Interdites</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Documents illégaux ou frauduleux</li>
                      <li>• Usurpation d'identité</li>
                      <li>• Spam ou harcèlement</li>
                      <li>• Violation de droits tiers</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Valeur Juridique des Signatures</h2>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <p className="text-blue-900 font-medium mb-3">
                    Les signatures électroniques créées via eSignPro ont la même valeur juridique qu'une signature
                    manuscrite.
                  </p>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Conformité à la loi suisse sur la signature électronique (SCSE)</li>
                    <li>• Certificats qualifiés délivrés par des autorités reconnues</li>
                    <li>• Horodatage sécurisé et audit trail complet</li>
                    <li>• Non-répudiation garantie</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Tarification et Paiement</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">7.1 Tarifs</h3>
                    <p className="text-gray-600">
                      Les tarifs sont indiqués sur notre site web et peuvent être modifiés avec un préavis de 30 jours.
                      Les prix s'entendent hors taxes applicables.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">7.2 Facturation</h3>
                    <p className="text-gray-600">
                      La facturation s'effectue mensuellement ou annuellement selon l'abonnement choisi. Le paiement est
                      exigible à réception de la facture.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">7.3 Défaut de paiement</h3>
                    <p className="text-gray-600">
                      En cas de défaut de paiement, l'accès aux services peut être suspendu après mise en demeure restée
                      sans effet.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
                  8. Responsabilités et Garanties
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">8.1 Responsabilité d'eSignPro</h3>
                    <p className="text-gray-600 mb-2">
                      eSignPro s'engage à fournir un service conforme aux standards de l'industrie avec une
                      disponibilité de 99.9%.
                    </p>
                    <p className="text-gray-600">
                      Notre responsabilité est limitée au montant des sommes versées au cours des 12 derniers mois.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">8.2 Responsabilité de l'Utilisateur</h3>
                    <p className="text-gray-600">
                      L'Utilisateur est responsable de l'exactitude des informations fournies et de l'usage qu'il fait
                      de la Plateforme.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Protection des Données</h2>
                <p className="text-gray-600 mb-4">
                  Le traitement des données personnelles est régi par notre Politique de Confidentialité, conforme au
                  RGPD et à la loi suisse sur la protection des données.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Hébergement :</strong> Toutes les données sont hébergées exclusivement en Suisse dans des
                    centres de données certifiés ISO 27001.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Durée et Résiliation</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">10.1 Durée</h3>
                    <p className="text-gray-600">
                      Le contrat est conclu pour la durée de l'abonnement choisi et se renouvelle automatiquement.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">10.2 Résiliation</h3>
                    <p className="text-gray-600">
                      Chaque partie peut résilier le contrat avec un préavis de 30 jours avant l'échéance. Les documents
                      signés restent accessibles pendant 90 jours après résiliation.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Propriété Intellectuelle</h2>
                <p className="text-gray-600 mb-4">
                  La Plateforme eSignPro, ses fonctionnalités, son design et son contenu sont protégés par les droits de
                  propriété intellectuelle.
                </p>
                <p className="text-gray-600">
                  L'Utilisateur conserve tous les droits sur ses documents et données. eSignPro ne revendique aucun
                  droit sur le contenu des documents traités.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Droit Applicable et Juridiction</h2>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <p className="text-blue-900 mb-3">
                    <strong>Droit applicable :</strong> Droit suisse
                  </p>
                  <p className="text-blue-900 mb-3">
                    <strong>Juridiction :</strong> Tribunaux de Genève, Suisse
                  </p>
                  <p className="text-blue-800">
                    En cas de litige, les parties s'efforceront de trouver une solution amiable avant tout recours
                    judiciaire.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications des CGU</h2>
                <p className="text-gray-600">
                  eSignPro se réserve le droit de modifier les présentes CGU. Toute modification sera notifiée par email
                  au moins 30 jours avant son entrée en vigueur. L'utilisation continue de la Plateforme vaut
                  acceptation des nouvelles conditions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-4">Pour toute question concernant ces conditions d'utilisation :</p>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>eSignPro SA</strong>
                    </p>
                    <p>Rue du Commerce 15</p>
                    <p>1204 Genève, Suisse</p>
                    <p>
                      <strong>Email :</strong> legal@esignpro.ch
                    </p>
                    <p>
                      <strong>Téléphone :</strong> +41 22 555 12 34
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions Juridiques ?</h2>
          <p className="text-gray-600 mb-6">Notre équipe juridique est disponible pour clarifier ces conditions</p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/contact">Nous Contacter</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
