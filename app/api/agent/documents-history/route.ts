import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * API pour récupérer l'historique des documents générés
 * GET: Liste tous les documents avec filtres
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const clientId = searchParams.get('clientId');
    const templateId = searchParams.get('templateId');
    const isSigned = searchParams.get('isSigned');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('📚 Récupération historique documents:', {
      caseId,
      clientId,
      templateId,
      isSigned,
      startDate,
      endDate,
      limit,
      offset
    });

    // 1. Récupérer les documents générés
    let generatedQuery = supabaseAdmin
      .from('generated_documents')
      .select(`
        *,
        insurance_cases (
          id,
          case_number,
          insurance_company,
          secure_token,
          clients (
            id,
            users (
              first_name,
              last_name,
              email
            )
          )
        )
      `);

    if (caseId) {
      generatedQuery = generatedQuery.eq('case_id', caseId);
    }

    const { data: generatedDocs, error: genError } = await generatedQuery;

    if (genError) {
      console.error('❌ Erreur récupération documents générés:', genError);
    }

    // 2. Récupérer les documents uploadés par les clients
    const { data: clientDocs, error: clientError } = await supabaseAdmin
      .from('client_documents')
      .select('*');

    if (clientError) {
      console.error('❌ Erreur récupération documents clients:', clientError);
    }

    // 3. Récupérer tous les dossiers pour mapper les tokens
    const { data: allCases, error: casesError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        insurance_company,
        secure_token,
        clients (
          id,
          users (
            first_name,
            last_name,
            email
          )
        )
      `);

    // Créer un map token -> case
    const tokenToCaseMap = new Map();
    allCases?.forEach(c => {
      if (c.secure_token) {
        tokenToCaseMap.set(c.secure_token, c);
      }
    });

    // 4. Enrichir les documents générés
    const enrichedGenerated = generatedDocs?.map(doc => ({
      id: doc.id,
      documentName: doc.document_name,
      documentType: 'generated',
      templateId: doc.template_id,
      caseId: doc.case_id,
      caseNumber: doc.insurance_cases?.case_number,
      insuranceCompany: doc.insurance_cases?.insurance_company,
      clientName: doc.insurance_cases?.clients?.users
        ? `${doc.insurance_cases.clients.users.first_name} ${doc.insurance_cases.clients.users.last_name}`
        : 'N/A',
      clientEmail: doc.insurance_cases?.clients?.users?.email,
      isSigned: doc.is_signed,
      signedAt: doc.signed_at,
      hasPdf: !!doc.signed_pdf_data,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at
    })) || [];

    // 5. Enrichir les documents clients
    const enrichedClient = clientDocs?.map(doc => {
      const caseData = tokenToCaseMap.get(doc.token);
      return {
        id: doc.id,
        documentName: doc.filename,
        documentType: 'uploaded',
        templateId: doc.documenttype,
        caseId: caseData?.id || 'N/A',
        caseNumber: caseData?.case_number || 'N/A',
        insuranceCompany: caseData?.insurance_company || 'N/A',
        clientName: caseData?.clients?.users
          ? `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`
          : 'N/A',
        clientEmail: caseData?.clients?.users?.email || 'N/A',
        isSigned: false,
        signedAt: null,
        hasPdf: doc.filepath?.endsWith('.pdf'),
        createdAt: doc.uploaddate,
        updatedAt: doc.uploaddate
      };
    }) || [];

    // 6. Combiner et trier tous les documents
    const allDocuments = [...enrichedGenerated, ...enrichedClient]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 7. Appliquer les filtres
    let filtered = allDocuments;

    if (isSigned !== null && isSigned !== undefined) {
      filtered = filtered.filter(doc => doc.isSigned === (isSigned === 'true'));
    }

    if (startDate) {
      filtered = filtered.filter(doc => new Date(doc.createdAt) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(doc => new Date(doc.createdAt) <= new Date(endDate));
    }

    // 8. Pagination
    const paginatedDocs = filtered.slice(offset, offset + limit);

    console.log(`✅ ${paginatedDocs.length} document(s) récupéré(s) (${enrichedGenerated.length} générés + ${enrichedClient.length} uploadés)`);

    return NextResponse.json({
      success: true,
      documents: paginatedDocs,
      total: filtered.length,
      stats: {
        generated: enrichedGenerated.length,
        uploaded: enrichedClient.length,
        total: allDocuments.length
      },
      limit,
      offset
    });

  } catch (error) {
    console.error('❌ Erreur historique documents:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

