"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Shield, Mail, AlertCircle, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock email validation - accept any email for demo
    if (!email || !email.includes("@")) {
      setError("Veuillez entrer une adresse email valide")
      setIsLoading(false)
      return
    }

    // Success - show confirmation
    setIsSubmitted(true)
    toast({
      title: "Email envoyé",
      description: "Vérifiez votre boîte mail pour les instructions de réinitialisation",
    })

    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
            <Image
              src="/images/esignpro-logo.png"
              alt="eSignPro"
              width={180}
              height={54}
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Email envoyé</h1>
            <p className="text-gray-600">Vérifiez votre boîte mail</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Instructions envoyées</h2>
              <p className="text-gray-600 mb-6">
                Nous avons envoyé un email à <strong>{email}</strong> avec les instructions pour réinitialiser votre mot de passe.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Si vous ne recevez pas l'email dans les 5 minutes, vérifiez votre dossier spam.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  Renvoyer l'email
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Retour à la connexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la connexion
          </Link>
          <Image
            src="/images/esignpro-logo.png"
            alt="eSignPro"
            width={180}
            height={54}
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="text-gray-600">Entrez votre email pour recevoir les instructions</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Réinitialiser le mot de passe</CardTitle>
            <CardDescription className="text-center">
              Nous vous enverrons un lien sécurisé pour créer un nouveau mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                <Shield className="mr-2 h-4 w-4" />
                {isLoading ? "Envoi en cours..." : "Envoyer les instructions"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              <Link href="/login" className="text-red-600 hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Connexion sécurisée SSL • Conforme RGPD</p>
        </div>
      </div>
    </div>
  )
}