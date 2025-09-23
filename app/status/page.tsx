import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CheckCircle, AlertTriangle, Clock, Server, Database, Mail, Shield } from "lucide-react"

export default function StatusPage() {
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
                Statut Système
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Tous les systèmes opérationnels</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-6">
        {/* Overall Status */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Statut des Services</h1>
          <p className="text-xl text-gray-600 mb-6">Surveillance en temps réel de tous nos services eSignPro</p>
          <Badge className="bg-green-600 text-white text-lg px-6 py-2">✅ Tous les systèmes opérationnels</Badge>
        </div>

        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Server className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">API eSignPro</CardTitle>
                    <CardDescription>Services de signature électronique</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Temps de réponse</span>
                  <span className="font-medium">127ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Disponibilité (30j)</span>
                  <span className="font-medium text-green-600">99.98%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dernière vérification</span>
                  <span className="font-medium">Il y a 30 secondes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Base de Données</CardTitle>
                    <CardDescription>Stockage des documents et signatures</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Temps de réponse</span>
                  <span className="font-medium">45ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Disponibilité (30j)</span>
                  <span className="font-medium text-green-600">99.99%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dernière sauvegarde</span>
                  <span className="font-medium">Il y a 15 minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Service Email</CardTitle>
                    <CardDescription>Notifications et invitations</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taux de livraison</span>
                  <span className="font-medium text-green-600">99.7%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Emails envoyés (24h)</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">File d'attente</span>
                  <span className="font-medium">0 emails</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Sécurité</CardTitle>
                    <CardDescription>Authentification et chiffrement</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Certificats SSL</span>
                  <span className="font-medium text-green-600">Valides</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tentatives d'intrusion</span>
                  <span className="font-medium">0 (24h)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dernière analyse</span>
                  <span className="font-medium">Il y a 2 heures</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="shadow-xl border-0 mb-12">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Métriques de Performance</CardTitle>
            <CardDescription className="text-blue-100 text-center">Statistiques des 30 derniers jours</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">99.98%</div>
                <div className="text-sm text-gray-600">Disponibilité</div>
                <div className="text-xs text-gray-500 mt-1">SLA: 99.9%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">127ms</div>
                <div className="text-sm text-gray-600">Temps de réponse moyen</div>
                <div className="text-xs text-gray-500 mt-1">Objectif: &lt;200ms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">15,247</div>
                <div className="text-sm text-gray-600">Signatures traitées</div>
                <div className="text-xs text-gray-500 mt-1">+12% vs mois dernier</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
                <div className="text-sm text-gray-600">Incidents majeurs</div>
                <div className="text-xs text-gray-500 mt-1">Objectif: 0</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card className="shadow-xl border-0 mb-12">
          <CardHeader>
            <CardTitle className="text-xl">Historique des Incidents</CardTitle>
            <CardDescription>Transparence complète sur les incidents passés et leur résolution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Maintenance programmée</h3>
                    <span className="text-sm text-gray-500">15 Jan 2024</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Mise à jour de sécurité appliquée avec succès. Durée: 15 minutes.
                  </p>
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                    Résolu
                  </Badge>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Ralentissement temporaire</h3>
                    <span className="text-sm text-gray-500">08 Jan 2024</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Temps de réponse augmenté de 200ms pendant 45 minutes. Cause: pic de trafic.
                  </p>
                  <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-800">
                    Résolu
                  </Badge>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Aucun incident</h3>
                    <span className="text-sm text-gray-500">Décembre 2023</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Mois complet sans incident. Disponibilité: 100%</p>
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                    Parfait
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscribe to Updates */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-gray-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Restez Informé</h2>
            <p className="text-gray-600 mb-6">Recevez des notifications en temps réel sur le statut de nos services</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Mail className="mr-2 h-5 w-5" />
                S'abonner aux Alertes
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/help">
                  <Shield className="mr-2 h-5 w-5" />
                  Centre d'Aide
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
