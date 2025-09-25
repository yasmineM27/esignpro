"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

export default function ClientTokenRedirect() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  // Redirection automatique vers le portail unifié
  useEffect(() => {
    if (token) {
      console.log('🔄 Redirection automatique vers le portail unifié...')
      console.log(`Redirection: /client/${token} → /client-portal/${token}`)
      
      // Rediriger vers le portail unifié après un court délai
      const timer = setTimeout(() => {
        router.replace(`/client-portal/${token}`)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [token, router])

  // Page de redirection temporaire
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Redirection en cours...</h2>
          <p className="text-gray-600 mb-4">
            Vous allez être redirigé vers votre portail client sécurisé.
          </p>
          <div className="text-sm text-gray-500">
            <p>🔒 Connexion sécurisée</p>
            <p>Token: {token.substring(0, 8)}...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
