import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PDFGenerator } from '@/lib/pdf-generator';
import { DocumentTemplates } from '@/lib/document-templates';

export async function POST(request: NextRequest) {
  try {
    const { documentId, caseId, applySignature } = await request.json();

    console.log('📄 Génération PDF signé:', { documentId, caseId, applySignature });

    if (!documentId || !caseId) {
      return NextResponse.json({
        success: false,
        error: 'documentId et caseId requis'
      }, { status: 400 });
    }

    // Récupérer le document généré
    const { data: document, error: docError } = await supabaseAdmin
      .from('generated_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      console.error('❌ Document non trouvé:', docError);
      return NextResponse.json({
        success: false,
        error: 'Document non trouvé'
      }, { status: 404 });
    }

    // Récupérer les informations du dossier
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        insurance_company,
        policy_number,
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

    const clientName = `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`;

    // Récupérer la signature si demandé
    let signatureDataUrl: string | undefined;
    let signatureDate: string | undefined;

    if (applySignature) {
      const { data: signature, error: sigError } = await supabaseAdmin
        .from('signatures')
        .select('signature_data, created_at')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!sigError && signature) {
        signatureDataUrl = signature.signature_data;
        signatureDate = new Date(signature.created_at).toLocaleString('fr-CH');
      }
    }

    // Générer le PDF
    const pdfBytes = await PDFGenerator.generatePDF({
      title: document.document_name,
      content: document.content,
      clientName,
      caseNumber: caseData.case_number,
      signatureDataUrl,
      signatureDate
    });

    // Sauvegarder le PDF dans la base de données
    const { error: updateError } = await supabaseAdmin
      .from('generated_documents')
      .update({
        pdf_url: `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`,
        is_signed: applySignature,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('❌ Erreur mise à jour document:', updateError);
    }

    // Retourner le PDF
    const fileName = `${document.document_name.replace(/[^a-zA-Z0-9]/g, '_')}_${caseData.case_number}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBytes.length.toString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération du PDF'
    }, { status: 500 });
  }
}

// Générer plusieurs PDFs en un seul fichier
export async function PUT(request: NextRequest) {
  try {
    const { documentIds, caseId, applySignature } = await request.json();

    console.log('📄 Génération PDF multiple:', { documentIds, caseId, applySignature });

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'documentIds requis (array)'
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
      return NextResponse.json({
        success: false,
        error: 'Dossier non trouvé'
      }, { status: 404 });
    }

    const clientName = `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`;

    // Récupérer la signature si demandé
    let signatureDataUrl: string | undefined;
    let signatureDate: string | undefined;

    if (applySignature) {
      const { data: signature } = await supabaseAdmin
        .from('signatures')
        .select('signature_data, created_at')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (signature) {
        signatureDataUrl = signature.signature_data;
        signatureDate = new Date(signature.created_at).toLocaleString('fr-CH');
      }
    }

    // Récupérer tous les documents
    const { data: documents, error: docsError } = await supabaseAdmin
      .from('generated_documents')
      .select('*')
      .in('id', documentIds);

    if (docsError || !documents || documents.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Documents non trouvés'
      }, { status: 404 });
    }

    // Générer un PDF pour chaque document
    const pdfOptions = documents.map(doc => ({
      title: doc.document_name,
      content: doc.content,
      clientName,
      caseNumber: caseData.case_number,
      signatureDataUrl,
      signatureDate
    }));

    const pdfBytes = await PDFGenerator.generateMultiDocumentPDF(pdfOptions);

    // Retourner le PDF combiné
    const fileName = `Documents_${caseData.case_number}_${clientName.replace(/\s/g, '_')}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBytes.length.toString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur génération PDF multiple:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération du PDF'
    }, { status: 500 });
  }
}

