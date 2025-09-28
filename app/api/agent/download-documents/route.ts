import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import JSZip from 'jszip';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const clientId = searchParams.get('clientId');

    if (!caseId) {
      return NextResponse.json({
        success: false,
        error: 'caseId requis'
      }, { status: 400 });
    }

    console.log('📦 Téléchargement documents:', { caseId, clientId });

    // Récupérer les informations du dossier
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        status,
        secure_token,
        insurance_company,
        policy_type,
        policy_number,
        created_at,
        updated_at,
        clients (
          id,
          users (
            first_name,
            last_name,
            email,
            phone
          )
        )
      `)
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      console.error('❌ Erreur récupération dossier:', caseError);
      return NextResponse.json({
        success: false,
        error: 'Dossier non trouvé'
      }, { status: 404 });
    }

    // Récupérer les signatures du dossier
    const { data: signatures, error: sigError } = await supabaseAdmin
      .from('signatures')
      .select('*')
      .eq('case_id', caseId);

    // Récupérer les documents uploadés (si table existe)
    const { data: documents, error: docError } = await supabaseAdmin
      .from('case_documents')
      .select('*')
      .eq('case_id', caseId);

    // Créer un ZIP avec tous les documents
    const zip = new JSZip();

    // Ajouter les informations du dossier
    const caseInfo = {
      dossier: {
        numero: caseData.case_number,
        statut: caseData.status,
        token: caseData.secure_token,
        compagnie_assurance: caseData.insurance_company,
        type_police: caseData.policy_type,
        numero_police: caseData.policy_number,
        date_creation: caseData.created_at,
        derniere_modification: caseData.updated_at
      },
      client: {
        nom: `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`,
        email: caseData.clients.users.email,
        telephone: caseData.clients.users.phone
      },
      signatures: signatures?.map(sig => ({
        id: sig.id,
        date_signature: sig.signed_at,
        valide: sig.is_valid,
        adresse_ip: sig.ip_address,
        navigateur: sig.user_agent
      })) || [],
      documents: documents?.map(doc => ({
        nom: doc.file_name,
        type: doc.file_type,
        taille: doc.file_size,
        date_upload: doc.uploaded_at
      })) || []
    };

    // Ajouter le fichier d'informations JSON
    zip.file('informations-dossier.json', JSON.stringify(caseInfo, null, 2));

    // Ajouter les signatures comme images
    if (signatures && signatures.length > 0) {
      const signaturesFolder = zip.folder('signatures');
      signatures.forEach((sig, index) => {
        if (sig.signature_data && sig.signature_data.startsWith('data:image/')) {
          // Extraire les données base64
          const base64Data = sig.signature_data.split(',')[1];
          const extension = sig.signature_data.includes('png') ? 'png' : 'jpg';
          signaturesFolder?.file(`signature-${index + 1}-${sig.signed_at?.split('T')[0]}.${extension}`, base64Data, { base64: true });
        }
      });
    }

    // Ajouter les documents uploadés (simulé pour l'instant)
    if (documents && documents.length > 0) {
      const documentsFolder = zip.folder('documents');
      documents.forEach((doc, index) => {
        // En production, récupérer le vrai fichier depuis le stockage
        documentsFolder?.file(`document-${index + 1}-${doc.file_name}`, `Contenu du document ${doc.file_name}`);
      });
    } else {
      // Ajouter un fichier d'exemple si pas de documents
      const documentsFolder = zip.folder('documents');
      documentsFolder?.file('aucun-document.txt', 'Aucun document n\'a été uploadé pour ce dossier.');
    }

    // Ajouter un rapport de synthèse
    const rapport = `RAPPORT DE SYNTHÈSE - DOSSIER ${caseData.case_number}
=====================================

Client: ${caseData.clients.users.first_name} ${caseData.clients.users.last_name}
Email: ${caseData.clients.users.email}
Téléphone: ${caseData.clients.users.phone}

Assurance:
- Compagnie: ${caseData.insurance_company}
- Type: ${caseData.policy_type}
- Numéro de police: ${caseData.policy_number}

Dossier:
- Numéro: ${caseData.case_number}
- Statut: ${caseData.status}
- Créé le: ${new Date(caseData.created_at).toLocaleString('fr-FR')}
- Modifié le: ${new Date(caseData.updated_at).toLocaleString('fr-FR')}

Signatures: ${signatures?.length || 0}
${signatures?.map((sig, i) => `  ${i + 1}. Signée le ${new Date(sig.signed_at).toLocaleString('fr-FR')} - ${sig.is_valid ? 'Valide' : 'En attente'}`).join('\n') || '  Aucune signature'}

Documents: ${documents?.length || 0}
${documents?.map((doc, i) => `  ${i + 1}. ${doc.file_name} (${doc.file_type}) - ${doc.file_size} bytes`).join('\n') || '  Aucun document'}

Lien portail client: https://esignpro.ch/client-portal/${caseData.secure_token}

Généré le: ${new Date().toLocaleString('fr-FR')}
Par: Agent eSignPro
`;

    zip.file('rapport-synthese.txt', rapport);

    // Générer le ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Retourner le ZIP
    const fileName = `dossier-${caseData.case_number}-${caseData.clients.users.first_name}-${caseData.clients.users.last_name}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': zipBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur téléchargement documents:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération du ZIP'
    }, { status: 500 });
  }
}
