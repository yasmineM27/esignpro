import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { token, signature, caseId } = await request.json();

    console.log('💾 Sauvegarde signature:', { token, caseId, signatureLength: signature?.length });

    if (!token || !signature || !caseId) {
      return NextResponse.json({
        success: false,
        error: 'Token, signature et caseId requis'
      }, { status: 400 });
    }

    // Vérifier que le dossier existe (utiliser seulement le token)
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

    // Sauvegarder la signature (utiliser l'ID réel du dossier)
    const realCaseId = caseData.id;
    const { data: signatureData, error: signatureError } = await supabaseAdmin
      .from('signatures')
      .insert([{
        case_id: realCaseId,
        signature_data: signature,
        signature_metadata: {
          timestamp: new Date().toISOString(),
          client_name: `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`,
          case_number: caseData.case_number,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        },
        ip_address: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        signed_at: new Date().toISOString(),
        is_valid: true
      }])
      .select()
      .single();

    if (signatureError) {
      console.error('❌ Erreur sauvegarde signature:', signatureError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la sauvegarde de la signature'
      }, { status: 500 });
    }

    // Mettre à jour le statut du dossier
    const { data: updatedCase, error: updateError } = await supabaseAdmin
      .from('insurance_cases')
      .update({
        status: 'signed',
        signature_data: {
          signature_id: signatureData.id,
          signed_at: new Date().toISOString(),
          signed_by: `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`
        },
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', realCaseId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour dossier:', updateError);
      // La signature est sauvegardée, mais on continue quand même
    }

    // Créer un log d'audit
    await supabaseAdmin
      .from('audit_logs')
      .insert([{
        case_id: realCaseId,
        action: 'document_signed',
        entity_type: 'signature',
        entity_id: signatureData.id,
        new_values: {
          signature_id: signatureData.id,
          signed_at: new Date().toISOString(),
          status: 'signed'
        },
        ip_address: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        created_at: new Date().toISOString()
      }]);

    // Envoyer un email de notification à l'agent
    const agentEmail = 'yasminemassaoudi27@gmail.com';
    const clientName = `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`;

    try {
      const emailResult = await sendEmail({
        to: agentEmail,
        subject: `🎉 Nouvelle signature reçue - Dossier ${caseData.case_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0;">📋 eSignPro</h1>
                <h2 style="color: #16a34a; margin: 10px 0;">Document signé avec succès !</h2>
              </div>

              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0;">📄 Détails du dossier</h3>
                <p style="margin: 5px 0;"><strong>Numéro de dossier:</strong> ${caseData.case_number}</p>
                <p style="margin: 5px 0;"><strong>Client:</strong> ${clientName}</p>
                <p style="margin: 5px 0;"><strong>Email client:</strong> ${caseData.clients.users.email}</p>
                <p style="margin: 5px 0;"><strong>Date de signature:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <p style="margin: 5px 0;"><strong>Statut:</strong> <span style="color: #16a34a; font-weight: bold;">✅ Signé et finalisé</span></p>
              </div>

              <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                <h3 style="color: #92400e; margin: 0 0 15px 0;">⚡ Actions disponibles</h3>
                <p style="margin: 5px 0;">• Valider la signature dans l'espace agent</p>
                <p style="margin: 5px 0;">• Générer les documents automatiquement</p>
                <p style="margin: 5px 0;">• Sélectionner les templates appropriés</p>
                <p style="margin: 5px 0;">• Finaliser et envoyer au client</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://esignpro.ch/agent"
                   style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  🚀 Accéder à l'espace agent
                </a>
              </div>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>Cette notification a été générée automatiquement par eSignPro.</p>
                <p>Dossier ID: ${realCaseId}</p>
              </div>
            </div>
          </div>
        `,
        text: `
Nouvelle signature reçue - eSignPro

Dossier: ${caseData.case_number}
Client: ${clientName}
Email: ${caseData.clients.users.email}
Date: ${new Date().toLocaleString('fr-FR')}
Statut: Signé et finalisé

Accédez à votre espace agent: https://esignpro.ch/agent

Le dossier peut maintenant être traité et les documents générés automatiquement.
        `
      });

      console.log('📧 Email de notification envoyé à l\'agent:', emailResult.success ? '✅' : '❌');

      // Créer un log d'email
      await supabaseAdmin
        .from('email_logs')
        .insert([{
          case_id: realCaseId,
          recipient_email: agentEmail,
          sender_email: 'noreply@esignpro.ch',
          subject: `🎉 Nouvelle signature reçue - Dossier ${caseData.case_number}`,
          body_html: 'Email de notification agent (voir logs)',
          email_type: 'agent_signature_notification',
          status: emailResult.success ? 'sent' : 'failed',
          sent_at: emailResult.success ? new Date().toISOString() : null,
          error_message: emailResult.success ? null : emailResult.error,
          created_at: new Date().toISOString()
        }]);

    } catch (emailError) {
      console.error('❌ Erreur envoi email agent:', emailError);
      // Continue quand même, la signature est sauvegardée
    }

    console.log('✅ Signature sauvegardée avec succès:', signatureData.id);

    return NextResponse.json({
      success: true,
      message: 'Signature enregistrée avec succès',
      signature: {
        id: signatureData.id,
        signed_at: signatureData.signed_at,
        case_number: caseData.case_number,
        client_name: `${caseData.clients.users.first_name} ${caseData.clients.users.last_name}`
      },
      case: {
        id: updatedCase?.id || realCaseId,
        status: 'signed',
        completed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur sauvegarde signature:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la sauvegarde'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const caseId = searchParams.get('caseId');

    if (!token && !caseId) {
      return NextResponse.json({
        success: false,
        error: 'Token ou caseId requis'
      }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('signatures')
      .select(`
        id,
        signature_data,
        signature_metadata,
        signed_at,
        is_valid,
        insurance_cases!inner(
          id,
          case_number,
          secure_token,
          status,
          clients!inner(
            users!inner(
              first_name,
              last_name,
              email
            )
          )
        )
      `);

    if (token) {
      query = query.eq('insurance_cases.secure_token', token);
    } else if (caseId) {
      query = query.eq('case_id', caseId);
    }

    const { data: signatures, error } = await query.order('signed_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération signatures:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des signatures'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      signatures: signatures || [],
      count: signatures?.length || 0
    });

  } catch (error) {
    console.error('❌ Erreur récupération signatures:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}
