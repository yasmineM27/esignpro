import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import JSZip from 'jszip';
import { PDFGenerator } from '@/lib/pdf-generator';

/**
 * API pour exporter tous les documents d'un client en ZIP
 * GET: Télécharge tous les documents d'un client (générés + uploadés)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const caseId = searchParams.get('caseId');

    console.log('📦 Export documents client:', { clientId, caseId });

    if (!clientId && !caseId) {
      return NextResponse.json({
        success: false,
        error: 'clientId ou caseId requis'
      }, { status: 400 });
    }

    // Récupérer les informations du client/dossier
    let query = supabaseAdmin
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
      `);

    if (caseId) {
      query = query.eq('id', caseId);
    } else if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data: cases, error: casesError } = await query;

    if (casesError || !cases || cases.length === 0) {
      console.error('❌ Dossier(s) non trouvé(s):', casesError);
      return NextResponse.json({
        success: false,
        error: 'Aucun dossier trouvé'
      }, { status: 404 });
    }

    const caseIds = cases.map(c => c.id);
    const clientName = cases[0].clients.users 
      ? `${cases[0].clients.users.first_name} ${cases[0].clients.users.last_name}`
      : 'Client';

    // Récupérer tous les documents générés
    const { data: generatedDocs, error: docsError } = await supabaseAdmin
      .from('generated_documents')
      .select('*')
      .in('case_id', caseIds);

    if (docsError) {
      console.error('❌ Erreur récupération documents:', docsError);
    }

    // Récupérer tous les documents uploadés
    const { data: uploadedDocs, error: uploadError } = await supabaseAdmin
      .from('client_documents')
      .select('*')
      .in('case_id', caseIds);

    if (uploadError) {
      console.error('❌ Erreur récupération documents uploadés:', uploadError);
    }

    // Récupérer les signatures
    const { data: signatures, error: sigError } = await supabaseAdmin
      .from('signatures')
      .select('*')
      .in('case_id', caseIds);

    if (sigError) {
      console.error('❌ Erreur récupération signatures:', sigError);
    }

    // Créer le ZIP
    const zip = new JSZip();

    // Ajouter un fichier d'information
    const infoContent = `EXPORT COMPLET CLIENT - eSignPro
=====================================

Client: ${clientName}
Email: ${cases[0].clients.users?.email || 'N/A'}
Date d'export: ${new Date().toLocaleString('fr-CH')}

DOSSIERS (${cases.length}):
${cases.map(c => `- ${c.case_number} (${c.insurance_company})`).join('\n')}

DOCUMENTS GÉNÉRÉS: ${generatedDocs?.length || 0}
DOCUMENTS UPLOADÉS: ${uploadedDocs?.length || 0}
SIGNATURES: ${signatures?.length || 0}

=====================================
Généré par eSignPro - Signature Électronique Sécurisée
`;

    zip.file('README.txt', infoContent);

    // Ajouter les documents générés
    if (generatedDocs && generatedDocs.length > 0) {
      const generatedFolder = zip.folder('Documents_Generes');
      
      for (const doc of generatedDocs) {
        try {
          // Si le document a un PDF, l'utiliser
          if (doc.pdf_url) {
            const base64Data = doc.pdf_url.split(',')[1];
            if (base64Data) {
              const pdfBuffer = Buffer.from(base64Data, 'base64');
              generatedFolder?.file(
                `${doc.document_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                pdfBuffer
              );
            }
          } else {
            // Sinon, créer un PDF à partir du contenu
            const caseData = cases.find(c => c.id === doc.case_id);
            const signature = signatures?.find(s => s.case_id === doc.case_id);

            const pdfBytes = await PDFGenerator.generatePDF({
              title: doc.document_name,
              content: doc.content,
              clientName,
              caseNumber: caseData?.case_number,
              signatureDataUrl: doc.is_signed && signature ? signature.signature_data : undefined,
              signatureDate: doc.signed_at ? new Date(doc.signed_at).toLocaleString('fr-CH') : undefined
            });

            generatedFolder?.file(
              `${doc.document_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
              pdfBytes
            );
          }
        } catch (error) {
          console.error(`❌ Erreur ajout document ${doc.document_name}:`, error);
          // Ajouter au moins le contenu texte
          generatedFolder?.file(
            `${doc.document_name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
            doc.content
          );
        }
      }
    }

    // Ajouter les documents uploadés (simulé pour l'instant)
    if (uploadedDocs && uploadedDocs.length > 0) {
      const uploadedFolder = zip.folder('Documents_Uploades');
      uploadedDocs.forEach((doc, index) => {
        uploadedFolder?.file(
          `${doc.document_type}_${index + 1}.txt`,
          `Document uploadé: ${doc.file_name}\nType: ${doc.document_type}\nDate: ${new Date(doc.created_at).toLocaleString('fr-CH')}`
        );
      });
    }

    // Ajouter les signatures
    if (signatures && signatures.length > 0) {
      const signaturesFolder = zip.folder('Signatures');
      signatures.forEach((sig, index) => {
        try {
          const base64Data = sig.signature_data.split(',')[1];
          if (base64Data) {
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const ext = sig.signature_data.startsWith('data:image/png') ? 'png' : 'jpg';
            signaturesFolder?.file(`signature_${index + 1}.${ext}`, imageBuffer);
          }
        } catch (error) {
          console.error('❌ Erreur ajout signature:', error);
        }
      });
    }

    // Ajouter un rapport détaillé
    const reportContent = `RAPPORT DÉTAILLÉ - ${clientName}
=====================================

INFORMATIONS CLIENT
-------------------
Nom: ${clientName}
Email: ${cases[0].clients.users?.email || 'N/A'}

DOSSIERS (${cases.length})
-------------------
${cases.map(c => `
Dossier: ${c.case_number}
Compagnie: ${c.insurance_company}
Police: ${c.policy_number || 'N/A'}
`).join('\n')}

DOCUMENTS GÉNÉRÉS (${generatedDocs?.length || 0})
-------------------
${generatedDocs?.map(d => `
- ${d.document_name}
  Template: ${d.template_id}
  Signé: ${d.is_signed ? 'Oui' : 'Non'}
  Date: ${new Date(d.created_at).toLocaleString('fr-CH')}
`).join('\n') || 'Aucun document généré'}

DOCUMENTS UPLOADÉS (${uploadedDocs?.length || 0})
-------------------
${uploadedDocs?.map(d => `
- ${d.file_name}
  Type: ${d.document_type}
  Date: ${new Date(d.created_at).toLocaleString('fr-CH')}
`).join('\n') || 'Aucun document uploadé'}

SIGNATURES (${signatures?.length || 0})
-------------------
${signatures?.map((s, i) => `
Signature ${i + 1}:
  Validée: ${s.is_validated ? 'Oui' : 'Non'}
  Date: ${new Date(s.created_at).toLocaleString('fr-CH')}
`).join('\n') || 'Aucune signature'}

=====================================
Rapport généré le: ${new Date().toLocaleString('fr-CH')}
Par: eSignPro - Signature Électronique Sécurisée
`;

    zip.file('Rapport_Complet.txt', reportContent);

    // Générer le ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Retourner le ZIP
    const fileName = `Export_${clientName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': zipBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur export documents client:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'export des documents'
    }, { status: 500 });
  }
}

