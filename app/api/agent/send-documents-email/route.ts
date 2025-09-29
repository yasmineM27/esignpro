import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { EmailService } from '@/lib/email-service';

/**
 * API pour envoyer les documents générés par email
 * POST: Envoyer les documents au client et notifier l'agent
 */
export async function POST(request: NextRequest) {
  try {
    const { documentIds, caseId, message } = await request.json();

    console.log('📧 Envoi documents par email:', { documentIds, caseId });

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

    // Récupérer les documents
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

    const clientName = `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`;
    const clientEmail = caseData.clients.users.email;
    const agentEmail = process.env.TEST_AGENT_EMAIL || 'yasminemassaoudi27@gmail.com';

    // Préparer la liste des documents
    const documentsList = documents.map(doc => `
      <li>
        <strong>${doc.document_name}</strong>
        ${doc.is_signed ? '<span style="color: #10b981;">✓ Signé</span>' : '<span style="color: #f59e0b;">⚠ Non signé</span>'}
      </li>
    `).join('');

    // Email au client
    const clientEmailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Vos documents eSignPro</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">📄 Vos Documents - eSignPro</h1>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #dc2626; margin-top: 0;">Bonjour ${clientName.split(' ')[0]},</h2>
            <p>Vos documents ont été générés et sont maintenant disponibles.</p>
            
            <div style="background: white; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">📋 Documents générés :</h3>
                <ul style="color: #374151;">
                    ${documentsList}
                </ul>
            </div>

            ${message ? `
            <div style="background: #dbeafe; border: 1px solid #93c5fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">💬 Message de votre conseiller :</h3>
                <p style="color: #1e40af; margin: 0;">${message}</p>
            </div>
            ` : ''}

            <div style="background: #dcfce7; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #166534; margin-top: 0;">📌 Informations du dossier :</h3>
                <p style="color: #166534; margin: 5px 0;"><strong>Dossier N° :</strong> ${caseData.case_number}</p>
                <p style="color: #166534; margin: 5px 0;"><strong>Compagnie :</strong> ${caseData.insurance_company}</p>
                <p style="color: #166534; margin: 5px 0;"><strong>Nombre de documents :</strong> ${documents.length}</p>
            </div>

            <p style="margin-top: 30px;">Cordialement,</p>
            <p style="font-weight: 600; margin-bottom: 5px;">Votre conseiller eSignPro</p>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280;">
                📅 Envoyé le : ${new Date().toLocaleString('fr-CH')}<br>
                🏢 Application : eSignPro
            </p>
        </div>
    </div>
</body>
</html>
    `;

    const clientEmailText = `
eSignPro - Vos Documents

Bonjour ${clientName.split(' ')[0]},

Vos documents ont été générés et sont maintenant disponibles.

Documents générés :
${documents.map(doc => `- ${doc.document_name} ${doc.is_signed ? '(Signé)' : '(Non signé)'}`).join('\n')}

${message ? `Message de votre conseiller :\n${message}\n` : ''}

Informations du dossier :
- Dossier N° : ${caseData.case_number}
- Compagnie : ${caseData.insurance_company}
- Nombre de documents : ${documents.length}

Cordialement,
Votre conseiller eSignPro

Envoyé le : ${new Date().toLocaleString('fr-CH')}
    `;

    // Envoyer l'email au client
    const emailService = EmailService.getInstance();
    const clientEmailResult = await emailService.sendEmail({
      to: clientEmail,
      subject: `eSignPro - Vos documents sont prêts (${caseData.case_number})`,
      html: clientEmailHTML,
      text: clientEmailText
    });

    if (!clientEmailResult.success) {
      console.error('❌ Erreur envoi email client:', clientEmailResult.error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email au client'
      }, { status: 500 });
    }

    console.log('✅ Email envoyé au client:', clientEmail);

    // Email de notification à l'agent
    const agentEmailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Documents envoyés - eSignPro</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✅ Documents Envoyés - eSignPro</h1>
        </div>
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #2563eb; margin-top: 0;">Notification Agent</h2>
            <p>Les documents ont été envoyés avec succès au client.</p>
            
            <div style="background: white; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">📋 Détails :</h3>
                <p style="margin: 5px 0;"><strong>Client :</strong> ${clientName}</p>
                <p style="margin: 5px 0;"><strong>Email :</strong> ${clientEmail}</p>
                <p style="margin: 5px 0;"><strong>Dossier :</strong> ${caseData.case_number}</p>
                <p style="margin: 5px 0;"><strong>Documents envoyés :</strong> ${documents.length}</p>
            </div>

            <div style="background: white; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">📄 Liste des documents :</h3>
                <ul style="color: #374151;">
                    ${documentsList}
                </ul>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                📅 Envoyé le : ${new Date().toLocaleString('fr-CH')}
            </p>
        </div>
    </div>
</body>
</html>
    `;

    // Envoyer la notification à l'agent
    const agentEmailResult = await emailService.sendEmail({
      to: agentEmail,
      subject: `✅ Documents envoyés - ${clientName} (${caseData.case_number})`,
      html: agentEmailHTML,
      text: `Documents envoyés avec succès à ${clientName} (${clientEmail})\nDossier: ${caseData.case_number}\nDocuments: ${documents.length}`
    });

    if (agentEmailResult.success) {
      console.log('✅ Notification envoyée à l\'agent:', agentEmail);
    }

    return NextResponse.json({
      success: true,
      message: 'Documents envoyés avec succès',
      clientEmail,
      documentsCount: documents.length
    });

  } catch (error) {
    console.error('❌ Erreur envoi documents:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'envoi des documents'
    }, { status: 500 });
  }
}

