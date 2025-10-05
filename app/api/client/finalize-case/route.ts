import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token, clientId } = await request.json();

    console.log('🎯 Finalisation du dossier:', { token, clientId });

    if (!token || !clientId) {
      return NextResponse.json({
        success: false,
        error: 'Token et clientId requis'
      }, { status: 400 });
    }

    // Vérifier que le dossier existe
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        status,
        secure_token,
        clients!inner(
          users!inner(
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('secure_token', token)
      .single();

    if (caseError || !caseData) {
      console.error('❌ Dossier non trouvé:', caseError);
      return NextResponse.json({
        success: false,
        error: 'Dossier non trouvé'
      }, { status: 404 });
    }

    // Vérifier les documents requis
    const { data: documents, error: docsError } = await supabaseAdmin
      .from('client_documents')
      .select('documenttype, status')
      .eq('token', token);

    if (docsError) {
      console.error('❌ Erreur récupération documents:', docsError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la vérification des documents'
      }, { status: 500 });
    }

    // Vérifier que les documents requis sont présents (contrat d'assurance maintenant optionnel)
    const requiredDocs = ['identity_front', 'identity_back']; // ✅ Supprimé 'insurance_contract'
    const uploadedDocTypes = documents?.map(d => d.documenttype) || [];
    const missingDocs = requiredDocs.filter(type => !uploadedDocTypes.includes(type));

    console.log('📋 Vérification documents:', {
      requiredDocs,
      uploadedDocTypes,
      missingDocs
    });

    if (missingDocs.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Documents manquants: ${missingDocs.join(', ')}`,
        missingDocuments: missingDocs
      }, { status: 400 });
    }

    // Mettre à jour le statut du dossier
    const { data: updatedCase, error: updateError } = await supabaseAdmin
      .from('insurance_cases')
      .update({
        status: 'documents_uploaded',
        updated_at: new Date().toISOString()
      })
      .eq('secure_token', token)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour dossier:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la mise à jour du dossier'
      }, { status: 500 });
    }

    // Créer un log d'audit
    await supabaseAdmin
      .from('audit_logs')
      .insert([{
        case_id: caseData.id,
        action: 'case_documents_uploaded',
        entity_type: 'insurance_case',
        entity_id: caseData.id,
        new_values: { status: 'documents_uploaded' },
        created_at: new Date().toISOString()
      }]);

    console.log('✅ Dossier finalisé avec succès:', updatedCase.case_number);

    return NextResponse.json({
      success: true,
      message: 'Dossier finalisé avec succès',
      case: {
        id: updatedCase.id,
        case_number: updatedCase.case_number,
        status: updatedCase.status,
        client_name: `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`,
        client_email: caseData.clients.users.email
      },
      nextStep: 'signature',
      signatureUrl: `/secure-signature/${token}`
    });

  } catch (error) {
    console.error('❌ Erreur finalisation:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la finalisation'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token requis'
      }, { status: 400 });
    }

    // Récupérer le statut du dossier
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        status,
        secure_token,
        insurance_company,
        policy_number,
        clients!inner(
          users!inner(
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('secure_token', token)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({
        success: false,
        error: 'Dossier non trouvé'
      }, { status: 404 });
    }

    // Récupérer les documents
    const { data: documents, error: docsError } = await supabaseAdmin
      .from('client_documents')
      .select('documenttype, filename, status, uploaddate')
      .eq('token', token)
      .order('uploaddate', { ascending: false });

    if (docsError) {
      console.error('❌ Erreur récupération documents:', docsError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des documents'
      }, { status: 500 });
    }

    // Vérifier les documents requis (contrat d'assurance optionnel)
    const requiredDocs = ['identity_front', 'identity_back']; // ✅ Supprimé 'insurance_contract'
    const uploadedDocTypes = documents?.map(d => d.documenttype) || [];
    const missingDocs = requiredDocs.filter(type => !uploadedDocTypes.includes(type));

    const canFinalize = missingDocs.length === 0;
    const completionPercentage = Math.round(((requiredDocs.length - missingDocs.length) / requiredDocs.length) * 100);

    return NextResponse.json({
      success: true,
      case: {
        id: caseData.id,
        case_number: caseData.case_number,
        status: caseData.status,
        insurance_company: caseData.insurance_company,
        policy_number: caseData.policy_number,
        client_name: `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`,
        client_email: caseData.clients.users.email
      },
      documents: documents || [],
      requiredDocuments: requiredDocs,
      missingDocuments: missingDocs,
      canFinalize,
      completionPercentage,
      nextStep: canFinalize ? 'ready_to_finalize' : 'upload_missing_documents'
    });

  } catch (error) {
    console.error('❌ Erreur récupération statut:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}
