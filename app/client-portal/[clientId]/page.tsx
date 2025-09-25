import { redirect } from 'next/navigation'

interface ClientPortalPageProps {
  params: {
    clientId: string
  }
}

export default function ClientPortalPage({ params }: ClientPortalPageProps) {
  // Rediriger vers la route unifiée /client/[token]
  // Le clientId peut être utilisé comme token
  redirect(`/client/${params.clientId}`)
  // Cette fonction ne sera jamais atteinte car redirect() interrompt l'exécution
  return null
}
