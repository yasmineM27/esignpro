import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

    // Créer un log d'email pour notifier la signature
    await supabaseAdmin
      .from('email_logs')
      .insert([{
        case_id: realCaseId,
        recipient_email: 'admin@esignpro.ch', // Email de l'admin
        sender_email: 'noreply@esignpro.ch',
        subject: `Document signé - Dossier ${caseData.case_number}`,
        body_html: `
          <html>
            <body>
              <h2>Document signé avec succès</h2>
              <p><strong>Dossier:</strong> ${caseData.case_number}</p>
              <p><strong>Client:</strong> ${caseData.clients.users.first_name} ${caseData.clients.users.last_name}</p>
              <p><strong>Email:</strong> ${caseData.clients.users.email}</p>
              <p><strong>Date de signature:</strong> ${new Date().toLocaleString('fr-FR')}</p>
              <p><strong>Statut:</strong> Signé et finalisé</p>
              <p>Le dossier peut maintenant être transmis à l'assureur.</p>
            </body>
          </html>
        `,
        email_type: 'signature_notification',
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

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
