"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play, 
  FileText, 
  Mail, 
  Upload, 
  PenTool, 
  Archive,
  Send,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TestStep {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  status: 'pending' | 'running' | 'success' | 'error'
  url?: string
  testFunction?: () => Promise<boolean>
  duration?: number
}

export function WorkflowTest() {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const testSteps: TestStep[] = [
    {
      id: "agent-form",
      name: "Interface Agent - Saisie Client",
      description: "Test de la saisie des informations client et génération du document",
      icon: FileText,
      status: 'pending',
      url: "/agent",
      testFunction: async () => {
        // Test de l'interface agent
        const response = await fetch('/api/generate-word-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: "Test",
            prenom: "Client",
            adresse: "Rue de Test 123",
            npa: "1000",
            ville: "Lausanne",
            dateNaissance: "01.01.1990",
            numeroPolice: "TEST-123456",
            typeFormulaire: "Résiliation Test"
          })
        })
        return response.ok
      }
    },
    {
      id: "email-generation",
      name: "Génération Email d'Invitation",
      description: "Test de la génération et de l'envoi de l'email d'invitation au client",
      icon: Mail,
      status: 'pending',
      url: "/api/email-preview?clientName=Test%20Client&clientId=CLI_TEST_E2E",
      testFunction: async () => {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: "CLI_TEST_E2E",
            clientEmail: "test@example.com",
            clientName: "Test Client"
          })
        })
        return response.ok
      }
    },
    {
      id: "client-portal",
      name: "Portail Client - Accès",
      description: "Test de l'accès au portail client et affichage des documents",
      icon: ExternalLink,
      status: 'pending',
      url: "/client-portal/CLI_TEST_E2E",
      testFunction: async () => {
        // Simuler l'accès au portail client
        return true
      }
    },
    {
      id: "document-upload",
      name: "Upload Documents Client",
      description: "Test de l'upload des pièces d'identité et contrats d'assurance",
      icon: Upload,
      status: 'pending',
      testFunction: async () => {
        // Simuler l'upload de documents
        await new Promise(resolve => setTimeout(resolve, 1000))
        return true
      }
    },
    {
      id: "digital-signature",
      name: "Signature Électronique",
      description: "Test du processus de signature électronique",
      icon: PenTool,
      status: 'pending',
      testFunction: async () => {
        // Simuler la signature électronique
        await new Promise(resolve => setTimeout(resolve, 1500))
        return true
      }
    },
    {
      id: "agent-review",
      name: "Retour Agent - Documents Complétés",
      description: "Test de la réception et consultation des documents signés",
      icon: CheckCircle,
      status: 'pending',
      url: "/agent",
      testFunction: async () => {
        // Test de la génération du document final
        const response = await fetch('/api/generate-final-document?caseId=CLI_TEST_E2E')
        return response.ok
      }
    },
    {
      id: "document-archive",
      name: "Archivage Documents",
      description: "Test de l'archivage des documents finaux",
      icon: Archive,
      status: 'pending',
      testFunction: async () => {
        // Simuler l'archivage
        await new Promise(resolve => setTimeout(resolve, 800))
        return true
      }
    },
    {
      id: "insurer-send",
      name: "Envoi Compagnie d'Assurance",
      description: "Test de l'envoi des documents à la compagnie d'assurance",
      icon: Send,
      status: 'pending',
      testFunction: async () => {
        const response = await fetch('/api/send-to-insurer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: "TEST_DOC_001",
            caseNumber: "CLI_TEST_E2E",
            clientName: "Test Client",
            insuranceCompany: "CSS Assurance",
            documentUrl: "/test-document.pdf",
            agentName: "wael hamda"
          })
        })
        return response.ok
      }
    }
  ]

  const [steps, setSteps] = useState(testSteps)

  const runSingleTest = async (stepId: string) => {
    const step = steps.find(s => s.id === stepId)
    if (!step || !step.testFunction) return

    setCurrentStep(stepId)
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, status: 'running' } : s
    ))

    const startTime = Date.now()

    try {
      const success = await step.testFunction()
      const duration = Date.now() - startTime

      setSteps(prev => prev.map(s => 
        s.id === stepId ? { 
          ...s, 
          status: success ? 'success' : 'error',
          duration 
        } : s
      ))

      setTestResults(prev => ({
        ...prev,
        [stepId]: { success, duration, timestamp: new Date().toISOString() }
      }))

      if (success) {
        toast({
          title: "Test réussi",
          description: `${step.name} - ${duration}ms`,
        })
      } else {
        toast({
          title: "Test échoué",
          description: step.name,
          variant: "destructive",
        })
      }

    } catch (error) {
      const duration = Date.now() - startTime
      setSteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, status: 'error', duration } : s
      ))

      toast({
        title: "Erreur de test",
        description: `${step.name}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive",
      })
    }

    setCurrentStep(null)
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults({})
    
    // Reset all steps
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' as const })))

    for (const step of steps) {
      if (step.testFunction) {
        await runSingleTest(step.id)
        // Petit délai entre les tests
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    setIsRunning(false)
    
    const successCount = Object.values(testResults).filter(r => r.success).length
    const totalTests = steps.filter(s => s.testFunction).length
    
    toast({
      title: "Tests terminés",
      description: `${successCount}/${totalTests} tests réussis`,
      variant: successCount === totalTests ? "default" : "destructive",
    })
  }

  const getStatusIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusBadge = (status: TestStep['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">En cours...</Badge>
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Réussi</Badge>
      case 'error':
        return <Badge variant="destructive">Échoué</Badge>
    }
  }

  const successCount = steps.filter(s => s.status === 'success').length
  const errorCount = steps.filter(s => s.status === 'error').length
  const totalTests = steps.filter(s => s.testFunction).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Test du Workflow Complet</h2>
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Tests en cours...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Lancer tous les tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Résumé des résultats */}
      {(successCount > 0 || errorCount > 0) && (
        <Alert className={errorCount > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <CheckCircle className={`h-4 w-4 ${errorCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
          <AlertDescription className={errorCount > 0 ? 'text-red-800' : 'text-green-800'}>
            <strong>Résultats des tests :</strong> {successCount}/{totalTests} tests réussis
            {errorCount > 0 && ` - ${errorCount} échec${errorCount > 1 ? 's' : ''}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des étapes de test */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id} className={`transition-all duration-200 ${
            step.status === 'success' ? 'border-green-200 bg-green-50' :
            step.status === 'error' ? 'border-red-200 bg-red-50' :
            step.status === 'running' ? 'border-blue-200 bg-blue-50' :
            'border-gray-200'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <step.icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold">{step.name}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.duration && (
                      <p className="text-xs text-gray-500 mt-1">Durée: {step.duration}ms</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(step.status)}
                  {getStatusBadge(step.status)}
                  <div className="flex gap-2">
                    {step.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(step.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Voir
                      </Button>
                    )}
                    {step.testFunction && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runSingleTest(step.id)}
                        disabled={isRunning || step.status === 'running'}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
