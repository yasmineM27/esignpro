import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Award, FileCheck, Shield, CheckCircle, Download, ExternalLink } from "lucide-react"

export default function CompliancePage() {
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
                Conformité Certifiée
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Conformité & Certifications</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            eSignPro respecte les plus hauts standards de conformité réglementaire et de sécurité pour garantir la
            validité juridique de vos signatures électroniques.
          </p>
        </div>

        {/* Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">SCSE Conforme</CardTitle>
              <CardDescription>Signature Électronique Suisse - Valeur juridique complète</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge className="bg-blue-100 text-blue-800 mb-4">Certifié 2024</Badge>
              <p className="text-sm text-gray-600 mb-4">
                Nos signatures ont la même valeur juridique qu'une signature manuscrite selon la loi suisse.
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Télécharger le Certificat
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">ISO 27001</CardTitle>
              <CardDescription>Management de la sécurité de l'information</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge className="bg-green-100 text-green-800 mb-4">Certifié 2024</Badge>
              <p className="text-sm text-gray-600 mb-4">
                Système de management de la sécurité de l'information certifié par un organisme accrédité.
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Voir le Certificat
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">SOC 2 Type II</CardTitle>
              <CardDescription>Contrôles de sécurité et disponibilité</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge className="bg-purple-100 text-purple-800 mb-4">Audité 2024</Badge>
              <p className="text-sm text-gray-600 mb-4">
                Audit indépendant de nos contrôles de sécurité, disponibilité et confidentialité.
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <ExternalLink className="h-4 w-4 mr-2" />
                Rapport d'Audit
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-xl">Conformité Réglementaire</CardTitle>
              <CardDescription className="text-blue-100">
                Respect des réglementations suisses et européennes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">SCSE - Loi Suisse sur la Signature Électronique</h3>
                    <p className="text-sm text-gray-600">Conformité totale avec la législation suisse</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      RGPD - Règlement Général sur la Protection des Données
                    </h3>
                    <p className="text-sm text-gray-600">Protection complète des données personnelles</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">LPD - Loi suisse sur la Protection des Données</h3>
                    <p className="text-sm text-gray-600">Conformité avec la nouvelle LPD 2023</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">eIDAS - Règlement européen</h3>
                    <p className="text-sm text-gray-600">Reconnaissance mutuelle des signatures électroniques</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="text-xl">Standards de Sécurité</CardTitle>
              <CardDescription className="text-green-100">Certifications et audits de sécurité</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Chiffrement AES-256</h3>
                    <p className="text-sm text-gray-600">Standard militaire pour la protection des données</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Horodatage Qualifié</h3>
                    <p className="text-sm text-gray-600">Certificats d'horodatage conformes RFC 3161</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Audit Trail Complet</h3>
                    <p className="text-sm text-gray-600">
                      Traçabilité de toutes les actions avec preuves cryptographiques
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Hébergement Suisse</h3>
                    <p className="text-sm text-gray-600">Centres de données certifiés ISO 27001 en Suisse</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Reports */}
        <Card className="shadow-xl border-0 mb-12">
          <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Rapports d'Audit et Certifications</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Transparence complète sur nos certifications et audits
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Certificat ISO 27001</h3>
                  <Badge className="bg-green-100 text-green-800">Valide</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Certification du système de management de la sécurité de l'information
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Émis: Jan 2024</span>
                  <span>Expire: Jan 2027</span>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Rapport SOC 2</h3>
                  <Badge className="bg-blue-100 text-blue-800">2024</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Audit indépendant des contrôles de sécurité et de disponibilité
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Période: 2023-2024</span>
                  <span>Auditeur: PWC</span>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Voir le Rapport
                </Button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Conformité SCSE</h3>
                  <Badge className="bg-purple-100 text-purple-800">Certifié</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Attestation de conformité à la loi suisse sur la signature électronique
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Validé: 2024</span>
                  <span>Autorité: OFCOM</span>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Attestation PDF
                </Button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Test de Pénétration</h3>
                  <Badge className="bg-orange-100 text-orange-800">Q4 2024</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">Audit de sécurité par des experts en cybersécurité</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Réalisé: Déc 2024</span>
                  <span>Résultat: Aucune faille</span>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Résumé Exécutif
                </Button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Audit RGPD</h3>
                  <Badge className="bg-green-100 text-green-800">Conforme</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">Vérification de la conformité au règlement européen</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Audit: 2024</span>
                  <span>Score: 100%</span>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Shield className="h-4 w-4 mr-2" />
                  Rapport Conformité
                </Button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Certificats SSL</h3>
                  <Badge className="bg-green-100 text-green-800">Actifs</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Certificats de sécurité pour le chiffrement des communications
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Type: EV SSL</span>
                  <span>Expire: 2025</span>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Vérifier SSL
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions sur la Conformité ?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Notre équipe de conformité est disponible pour répondre à vos questions techniques et réglementaires
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/contact">
                <Shield className="mr-2 h-5 w-5" />
                Contacter l'Équipe Conformité
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/security">
                <FileCheck className="mr-2 h-5 w-5" />
                En Savoir Plus sur la Sécurité
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
