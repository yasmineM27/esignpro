"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Mail, 
  Upload, 
  PenTool, 
  CheckCircle, 
  Archive, 
  Send,
  User,
  Building,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

export default function DocumentationPage() {
  const processSteps = [
    {
      id: 1,
      title: "Saisie Agent",
      description: "L'agent saisit les informations du client dans l'interface sécurisée",
      icon: User,
      details: [
        "Nom, prénom du client",
        "Adresse complète (rue, NPA, ville)",
        "Date de naissance",
        "Numéro de police d'assurance",
        "Type de formulaire (résiliation, souscription, etc.)"
      ],
      status: "Implémenté",
      url: "/agent"
    },
    {
      id: 2,
      title: "Génération Document",
      description: "Le système génère automatiquement le document Word correspondant",
      icon: FileText,
      details: [
        "Document Word (.docx) généré avec les données client",
        "Template de résiliation personnalisé",
        "Champs automatiquement remplis",
        "Format professionnel avec mise en page"
      ],
      status: "Implémenté",
      url: "/api/generate-word-document"
    },
    {
      id: 3,
      title: "Email d'Invitation",
      description: "Envoi automatique d'un email sécurisé au client",
      icon: Mail,
      details: [
        "Lien personnel et sécurisé avec expiration",
        "Format eSignPro conforme aux spécifications",
        "Instructions claires pour le client",
        "Valeur juridique de la signature électronique"
      ],
      status: "Implémenté",
      url: "/api/email-preview"
    },
    {
      id: 4,
      title: "Portail Client",
      description: "Le client accède au portail sécurisé pour consulter et signer",
      icon: ExternalLink,
      details: [
        "Accès sécurisé via lien personnalisé",
        "Consultation du document généré",
        "Interface intuitive et responsive",
        "Processus guidé étape par étape"
      ],
      status: "Implémenté",
      url: "/client-portal/CLI_DEMO"
    },
    {
      id: 5,
      title: "Upload Documents",
      description: "Upload des pièces d'identité et contrats d'assurance",
      icon: Upload,
      details: [
        "Pièce d'identité (RECTO/VERSO séparés)",
        "Contrats d'assurance maladie et complémentaire",
        "Validation des formats (PDF, JPG, PNG)",
        "Interface drag & drop intuitive"
      ],
      status: "Implémenté"
    },
    {
      id: 6,
      title: "Signature Électronique",
      description: "Signature sécurisée avec valeur juridique",
      icon: PenTool,
      details: [
        "Signature tactile (souris/doigt)",
        "Horodatage automatique",
        "Conformité SCSE (législation suisse)",
        "Même valeur qu'une signature manuscrite"
      ],
      status: "Implémenté"
    },
    {
      id: 7,
      title: "Retour Agent",
      description: "L'agent reçoit et consulte les documents complétés",
      icon: CheckCircle,
      details: [
        "Interface de consultation des dossiers signés",
        "Visualisation des documents uploadés",
        "Génération du document final avec signature",
        "Validation et contrôle qualité"
      ],
      status: "Implémenté",
      url: "/agent"
    },
    {
      id: 8,
      title: "Archivage",
      description: "Archivage sécurisé des documents finaux",
      icon: Archive,
      details: [
        "Stockage sécurisé des documents signés",
        "Système de recherche et filtrage",
        "Historique complet des actions",
        "Consultation et téléchargement"
      ],
      status: "Implémenté"
    },
    {
      id: 9,
      title: "Envoi Assureur",
      description: "Transmission automatique aux compagnies d'assurance",
      icon: Send,
      details: [
        "Envoi automatisé par email",
        "Contacts pré-configurés des assureurs",
        "Suivi des envois et confirmations",
        "Audit trail complet"
      ],
      status: "Implémenté",
      url: "/api/send-to-insurer"
    }
  ]

  const technicalFeatures = [
    {
      category: "Frontend",
      items: [
        "Next.js 14 avec App Router",
        "TypeScript pour la sécurité des types",
        "Tailwind CSS pour le styling",
        "Composants UI réutilisables",
        "Interface responsive"
      ]
    },
    {
      category: "Backend",
      items: [
        "API Routes Next.js",
        "Génération de documents Word (.docx)",
        "Système d'email avec templates",
        "Upload et gestion de fichiers",
        "Signature électronique"
      ]
    },
    {
      category: "Sécurité",
      items: [
        "Liens sécurisés avec expiration",
        "Tokens d'authentification",
        "Validation des données",
        "Audit trail des actions",
        "Conformité SCSE"
      ]
    },
    {
      category: "Intégrations",
      items: [
        "Bibliothèque 'docx' pour Word",
        "Service d'email (Resend)",
        "Stockage de fichiers",
        "APIs RESTful",
        "Système de notifications"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Documentation eSignPro
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Processus fonctionnel complet de signature électronique pour les résiliations d'assurance
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/test-workflow">
                <CheckCircle className="h-4 w-4 mr-2" />
                Tester le Workflow
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/agent">
                <User className="h-4 w-4 mr-2" />
                Interface Agent
              </Link>
            </Button>
          </div>
        </div>

        {/* Processus étape par étape */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Processus Fonctionnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processSteps.map((step) => (
                <Card key={step.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                        {step.id}
                      </div>
                      <step.icon className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {step.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{step.description}</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {step.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-blue-500 mt-1">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                    {step.url && (
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href={step.url} target="_blank">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Tester
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Caractéristiques techniques */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Caractéristiques Techniques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technicalFeatures.map((feature) => (
                <Card key={feature.category} className="bg-gray-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-600">
                      {feature.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.items.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* URLs de test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">URLs de Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Interfaces Utilisateur</h4>
                <div className="space-y-1 text-sm">
                  <p><Link href="/agent" className="text-blue-600 hover:underline">/agent</Link> - Interface Agent</p>
                  <p><Link href="/client-portal/CLI_DEMO" className="text-blue-600 hover:underline">/client-portal/CLI_DEMO</Link> - Portail Client</p>
                  <p><Link href="/test-workflow" className="text-blue-600 hover:underline">/test-workflow</Link> - Tests E2E</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">APIs de Test</h4>
                <div className="space-y-1 text-sm">
                  <p><Link href="/api/email-preview" className="text-blue-600 hover:underline">/api/email-preview</Link> - Aperçu Email</p>
                  <p><Link href="/api/generate-word-document" className="text-blue-600 hover:underline">/api/generate-word-document</Link> - Document Word</p>
                  <p><Link href="/api/generate-final-document" className="text-blue-600 hover:underline">/api/generate-final-document</Link> - Document Final</p>
                  <p><Link href="/api/send-to-insurer" className="text-blue-600 hover:underline">/api/send-to-insurer</Link> - Contacts Assureurs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p>eSignPro - Solution complète de signature électronique</p>
          <p className="text-sm">Développé avec Next.js, TypeScript et Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}
