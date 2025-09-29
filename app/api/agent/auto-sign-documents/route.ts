import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PDFGenerator } from '@/lib/pdf-generator';

/**
 * API pour signer automatiquement les documents générés
 * POST: Signer un ou plusieurs documents avec la signature du client
 */
export async function POST(request: NextRequest) {
  try {
    const { documentIds, caseId } = await request.json();

    console.log('✍️ Signature automatique:', { documentIds, caseId });

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'documentIds requis (array)'
      }, { status: 400 });
    }

    if (!caseId) {
      return NextResponse.json({
        success: false,
        error: 'caseId requis'
      }, { status: 400 });
    }

    // Récupérer les informations du dossier
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
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
      `)
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      console.error('❌ Dossier non trouvé:', caseError);
      return NextResponse.json({
        success: false,
        error: 'Dossier non trouvé'
      }, { status: 404 });
    }

    // Récupérer la signature du client
    const { data: signature, error: sigError } = await supabaseAdmin
      .from('signatures')
      .select('signature_data, created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sigError || !signature) {
      console.error('❌ Signature non trouvée:', sigError);
      return NextResponse.json({
        success: false,
        error: 'Aucune signature trouvée pour ce dossier'
      }, { status: 404 });
    }

    const clientName = `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`;
    const signatureDataUrl = signature.signature_data;
    const signatureDate = new Date(signature.created_at).toLocaleString('fr-CH');

    // Récupérer tous les documents à signer
    const { data: documents, error: docsError } = await supabaseAdmin
      .from('generated_documents')
      .select('*')
      .in('id', documentIds);

    if (docsError || !documents || documents.length === 0) {
      console.error('❌ Documents non trouvés:', docsError);
      return NextResponse.json({
        success: false,
        error: 'Documents non trouvés'
      }, { status: 404 });
    }

    const signedDocuments = [];

    // Signer chaque document
    for (const doc of documents) {
      try {
        // Générer le PDF signé
        const pdfBytes = await PDFGenerator.generatePDF({
          title: doc.document_name,
          content: doc.content,
          clientName,
          caseNumber: caseData.case_number,
          signatureDataUrl,
          signatureDate
        });

        // Convertir en base64 pour stockage
        const pdfBase64 = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`;

        // Mettre à jour le document dans la base de données
        const { error: updateError } = await supabaseAdmin
          .from('generated_documents')
          .update({
            pdf_url: pdfBase64,
            is_signed: true,
            signed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', doc.id);

        if (updateError) {
          console.error(`❌ Erreur mise à jour document ${doc.id}:`, updateError);
        } else {
          signedDocuments.push({
            id: doc.id,
            name: doc.document_name,
            signed: true
          });
          console.log(`✅ Document ${doc.document_name} signé avec succès`);
        }
      } catch (error) {
        console.error(`❌ Erreur signature document ${doc.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${signedDocuments.length} document(s) signé(s) automatiquement`,
      signedDocuments
    });

  } catch (error) {
    console.error('❌ Erreur signature automatique:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la signature automatique'
    }, { status: 500 });
  }
}

