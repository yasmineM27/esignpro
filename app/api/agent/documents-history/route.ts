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

    // Construire la requête
    let query = supabaseAdmin
      .from('generated_documents')
      .select(`
        *,
        insurance_cases (
          id,
          case_number,
          insurance_company,
          clients (
            id,
            users (
              first_name,
              last_name,
              email
            )
          )
        )
      `, { count: 'exact' });

    // Appliquer les filtres
    if (caseId) {
      query = query.eq('case_id', caseId);
    }

    if (templateId) {
      query = query.eq('template_id', templateId);
    }

    if (isSigned !== null && isSigned !== undefined) {
      query = query.eq('is_signed', isSigned === 'true');
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Tri et pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: documents, error, count } = await query;

    if (error) {
      console.error('❌ Erreur récupération documents:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des documents'
      }, { status: 500 });
    }

    // Enrichir les données
    const enrichedDocuments = documents?.map(doc => ({
      id: doc.id,
      documentName: doc.document_name,
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
      hasPdf: !!doc.pdf_url,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at
    })) || [];

    console.log(`✅ ${enrichedDocuments.length} document(s) récupéré(s)`);

    return NextResponse.json({
      success: true,
      documents: enrichedDocuments,
      total: count || 0,
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

