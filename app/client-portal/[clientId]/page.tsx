import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ClientPortalUpload from '@/components/client-portal-upload';

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
  policy_type?: string;
  termination_date?: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface DocumentData {
  id: string;
  documenttype: string;
  filename: string;
  status: string;
  uploaddate: string;
}

// Fonction pour récupérer les données du dossier avec informations client complètes
async function getCaseData(token: string): Promise<CaseData | null> {
  try {
    console.log('🔍 Récupération données dossier pour token:', token);
    const { supabaseAdmin } = require('@/lib/supabase');

    // Récupérer le dossier d'abord
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select('id, case_number, secure_token, status, insurance_company, policy_number, policy_type, termination_date, expires_at, created_at, updated_at, client_id')
      .eq('secure_token', token)
      .single();

    if (caseError || !caseData) {
      console.error('❌ Erreur récupération dossier:', caseError);
      console.error('❌ Token non trouvé:', token);
      return null;
    }

    console.log('✅ Dossier trouvé:', {
      id: caseData.id,
      case_number: caseData.case_number,
      status: caseData.status
    });

    // Récupérer le client
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('user_id')
      .eq('id', caseData.client_id)
      .single();

    if (clientError || !clientData) {
      console.error('❌ Erreur récupération client:', clientError);
      return null;
    }

    // Récupérer l'utilisateur
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, email, phone')
      .eq('id', clientData.user_id)
      .single();

    if (userError || !userData) {
      console.error('❌ Erreur récupération utilisateur:', userError);
      return null;
    }

    console.log('✅ Client trouvé:', `${userData.first_name} ${userData.last_name}`);

    return {
      id: caseData.id,
      case_number: caseData.case_number,
      secure_token: caseData.secure_token,
      status: caseData.status,
      insurance_company: caseData.insurance_company || '',
      policy_number: caseData.policy_number || '',
      policy_type: caseData.policy_type || '',
      termination_date: caseData.termination_date,
      client_name: `${userData.first_name} ${userData.last_name}`,
      client_email: userData.email,
      client_phone: userData.phone,
      expires_at: caseData.expires_at,
      created_at: caseData.created_at,
      updated_at: caseData.updated_at
    };
  } catch (error) {
    console.error('Erreur connexion base:', error);
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

// Fonctions utilitaires pour l'interface dynamique
function getStatusDisplay(status: string) {
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    'draft': { label: '📝 Brouillon', color: '#6b7280', bgColor: '#f3f4f6' },
    'email_sent': { label: '📧 En attente de documents', color: '#f59e0b', bgColor: '#fef3c7' },
    'documents_uploaded': { label: '📄 Documents reçus', color: '#3b82f6', bgColor: '#dbeafe' },
    'signed': { label: '✍️ Signé', color: '#10b981', bgColor: '#d1fae5' },
    'completed': { label: '✅ Terminé', color: '#059669', bgColor: '#a7f3d0' },
    'validated': { label: '🎯 Validé', color: '#059669', bgColor: '#a7f3d0' },
    'archived': { label: '📦 Archivé', color: '#6b7280', bgColor: '#f3f4f6' }
  };
  return statusMap[status] || { label: status, color: '#6b7280', bgColor: '#f3f4f6' };
}

function getProgressPercentage(status: string, documentsCount: number): number {
  if (status === 'completed' || status === 'validated') return 100;
  if (status === 'signed') return 90;
  if (status === 'documents_uploaded' && documentsCount > 0) return 70;
  if (status === 'email_sent') return 30;
  if (status === 'draft') return 10;
  return 10;
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

        {/* Informations du dossier - DYNAMIQUE */}
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

            {/* Barre de progression dynamique */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Progression du dossier</span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {getProgressPercentage(caseData.status, documents.length)}%
                </span>
              </div>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: '10px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#10b981',
                  height: '100%',
                  width: `${getProgressPercentage(caseData.status, documents.length)}%`,
                  borderRadius: '10px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div>
                <strong>Numéro de dossier:</strong><br />
                <span style={{ color: '#3b82f6' }}>{caseData.case_number}</span>
              </div>
              <div>
                <strong>Compagnie d'assurance:</strong><br />
                <span style={{ color: '#374151' }}>{caseData.insurance_company || 'Non spécifiée'}</span>
              </div>
              <div>
                <strong>Numéro de police:</strong><br />
                <span style={{ color: '#374151' }}>{caseData.policy_number || 'Non spécifié'}</span>
              </div>
              {caseData.policy_type && (
                <div>
                  <strong>Type de police:</strong><br />
                  <span style={{ color: '#374151' }}>{caseData.policy_type}</span>
                </div>
              )}
              {caseData.termination_date && (
                <div>
                  <strong>Date de résiliation:</strong><br />
                  <span style={{ color: '#dc2626' }}>
                    {new Date(caseData.termination_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              <div>
                <strong>Date de création:</strong><br />
                <span style={{ color: '#6b7280' }}>
                  {new Date(caseData.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div>
                <strong>Statut:</strong><br />
                <span style={{
                  color: getStatusDisplay(caseData.status).color,
                  backgroundColor: getStatusDisplay(caseData.status).bgColor,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  {getStatusDisplay(caseData.status).label}
                </span>
              </div>
              <div>
                <strong>Documents uploadés:</strong><br />
                <span style={{
                  color: documents.length > 0 ? '#10b981' : '#f59e0b',
                  fontWeight: 'bold'
                }}>
                  {documents.length} document(s)
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
  console.log('🔍 Récupération données portail pour token:', token);

  const caseData = await getCaseData(token);
  if (!caseData) {
    console.error('❌ Dossier non trouvé pour le token:', token);
    notFound();
  }

  console.log('✅ Données dossier récupérées:', {
    case_number: caseData.case_number,
    client_name: caseData.client_name,
    status: caseData.status
  });

  const documents = await getDocuments(token);
  console.log(`✅ ${documents.length} document(s) récupéré(s)`);

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
