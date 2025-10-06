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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header - Responsive */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 sm:p-8 text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
            Bonjour {caseData.client_name}
          </h1>
          <p className="text-sm sm:text-base opacity-90 mb-0">
            Finalisation de votre dossier
          </p>
        </div>

        {/* Informations du dossier - DYNAMIQUE - Responsive */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-slate-100 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-700 mb-4">
              📋 Informations du dossier
            </h2>

            {/* Barre de progression dynamique - Responsive */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Progression du dossier</span>
                <span className="text-sm text-gray-500">
                  {getProgressPercentage(caseData.status, documents.length)}%
                </span>
              </div>
              <div className="bg-white/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgressPercentage(caseData.status, documents.length)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-700 text-sm mb-1">Numéro de dossier:</div>
                <div className="text-blue-600 font-medium">{caseData.case_number}</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-700 text-sm mb-1">Compagnie d'assurance:</div>
                <div className="text-gray-800">{caseData.insurance_company || 'Non spécifiée'}</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-700 text-sm mb-1">Numéro de police:</div>
                <div className="text-gray-800">{caseData.policy_number || 'Non spécifié'}</div>
              </div>
              {caseData.policy_type && (
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-700 text-sm mb-1">Type de police:</div>
                  <div className="text-gray-800">{caseData.policy_type}</div>
                </div>
              )}
              {caseData.termination_date && (
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-700 text-sm mb-1">Date de résiliation:</div>
                  <div className="text-red-600 font-medium">
                    {new Date(caseData.termination_date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )}
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-700 text-sm mb-1">Date de création:</div>
                <div className="text-gray-500">
                  {new Date(caseData.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-semibold text-gray-700 text-sm mb-1">Statut:</div>
                <span
                  className="inline-block px-2 py-1 rounded text-sm font-semibold"
                  style={{
                    color: getStatusDisplay(caseData.status).color,
                    backgroundColor: getStatusDisplay(caseData.status).bgColor
                  }}
                >
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
