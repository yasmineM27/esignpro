import { SimpleClientPortal } from './simple-page'

interface ClientPortalPageProps {
  params: Promise<{
    clientId: string
  }>
}

export default async function ClientPortalPage({ params }: ClientPortalPageProps) {
  const { clientId: token } = await params
  
  // Validation du token
  if (!token || typeof token !== 'string') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fef2f2 0%, #fce7e7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          margin: '0 16px'
        }}>
          <div style={{ color: '#dc2626', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Token Invalide</h2>
            <p style={{ marginBottom: '16px' }}>Le lien utilisé n'est pas valide. Veuillez vérifier votre URL.</p>
            <p style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>Token: {token}</p>
          </div>
        </div>
      </div>
    )
  }
  
  return <SimpleClientPortal token={token} />
}
