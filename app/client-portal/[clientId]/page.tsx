import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ClientPortalUpload from '@/components/client-portal-upload';

// Désactiver le cache pour toujours avoir les données fraîches
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Types
interface ClientPortalPageProps {
  params: Promise<{ clientId: string }>;
}

interface CaseData {
  id: string;
  case_number: string;
  secure_token: string;
  status: string;
  insurance_company: string;
  policy_number: string;
  client_name: string;
  client_email: string;
  expires_at: string;
}

interface DocumentData {
  id: string;
  documenttype: string;
  filename: string;
  status: string;
  uploaddate: string;
}

// Fonction pour récupérer les données du dossier (avec cache désactivé)
async function getCaseData(token: string): Promise<CaseData | null> {
  try {
    console.log('🔍 Récupération données FRAÎCHES pour token:', token);
    const { supabaseAdmin } = require('@/lib/supabase');

    // Récupérer le dossier avec les données du client en une seule requête
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        secure_token,
        status,
        insurance_company,
        policy_number,
        expires_at,
        clients!inner(
          id,
          users!inner(
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('secure_token', token)
      .single();

    if (caseError || !caseData) {
      console.error('❌ Erreur récupération dossier:', caseError);
      return null;
    }

    const user = caseData.clients.users;
    const clientName = `${user.first_name} ${user.last_name}`;

    console.log('✅ Données récupérées:', {
      caseNumber: caseData.case_number,
      clientName: clientName,
      firstName: user.first_name,
      lastName: user.last_name
    });

    return {
      id: caseData.id,
      case_number: caseData.case_number,
      secure_token: caseData.secure_token,
      status: caseData.status,
      insurance_company: caseData.insurance_company || '',
      policy_number: caseData.policy_number || '',
      client_name: clientName,
      client_email: user.email,
      expires_at: caseData.expires_at
    };
  } catch (error) {
    console.error('❌ Erreur connexion base:', error);
    return null;
  }
}

// Fonction pour récupérer les documents
async function getDocuments(token: string): Promise<DocumentData[]> {
  try {
    const { supabaseAdmin } = require('@/lib/supabase');

    const { data, error } = await supabaseAdmin
      .from('client_documents')
      .select('id, documenttype, filename, status, uploaddate')
      .eq('token', token)
      .order('uploaddate', { ascending: false });

    if (error) {
      console.error('Erreur récupération documents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erreur récupération documents:', error);
    return [];
  }
}

// Composant client pour l'interface
function ClientPortalInterface({ caseData, documents, token }: {
  caseData: CaseData;
  documents: DocumentData[];
  token: string;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold' }}>
            Bonjour {caseData.client_name}
          </h1>
          <p style={{ margin: '0', fontSize: '16px', opacity: 0.9 }}>
            Finalisation de votre dossier
          </p>
        </div>

        {/* Informations du dossier */}
        <div style={{ padding: '30px' }}>
          <div style={{
            backgroundColor: '#f1f5f9',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#334155' }}>
              📋 Informations du dossier
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div>
                <strong>Numéro de dossier:</strong><br />
                <span style={{ color: '#3b82f6' }}>{caseData.case_number}</span>
              </div>
              <div>
                <strong>Compagnie d'assurance:</strong><br />
                {caseData.insurance_company}
              </div>
              <div>
                <strong>Numéro de police:</strong><br />
                {caseData.policy_number}
              </div>
              <div>
                <strong>Statut:</strong><br />
                <span style={{
                  color: caseData.status === 'email_sent' ? '#f59e0b' : '#10b981',
                  fontWeight: 'bold'
                }}>
                  {caseData.status === 'email_sent' ? 'En attente de documents' : caseData.status}
                </span>
              </div>
            </div>
          </div>

          {/* Section upload de documents */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#334155' }}>
              📁 Upload de documents
            </h2>

            <ClientPortalUpload token={token} initialDocuments={documents} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal de la page
export default async function ClientPortalPage({ params }: ClientPortalPageProps) {
  const { clientId: token } = await params;

  // Validation du token
  if (!token || typeof token !== 'string') {
    console.error('Token invalide:', token);
    notFound();
  }

  // Récupération des données
  const caseData = await getCaseData(token);
  if (!caseData) {
    console.error('Dossier non trouvé pour le token:', token);
    notFound();
  }

  const documents = await getDocuments(token);

  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        🔄 Chargement de votre dossier...
      </div>
    }>
      <ClientPortalInterface 
        caseData={caseData} 
        documents={documents} 
        token={token} 
      />
    </Suspense>
  );
}
