import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'signed'; // signed, validated, rejected
    const caseId = searchParams.get('caseId'); // Pour rechercher par dossier spécifique
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('🔍 Récupération signatures agent:', { status, caseId, limit, offset });

    // Récupérer les signatures avec les données des dossiers
    let query = supabaseAdmin
      .from('signatures')
      .select(`
        id,
        signature_data,
        signature_metadata,
        signed_at,
        is_valid,
        ip_address,
        user_agent,
        insurance_cases!inner(
          id,
          case_number,
          status,
          secure_token,
          insurance_company,
          policy_type,
          policy_number,
          created_at,
          completed_at,
          clients!inner(
            id,
            users!inner(
              first_name,
              last_name,
              email,
              phone
            )
          )
        )
      `)
      .not('signed_at', 'is', null);

    // Filtrer par dossier spécifique si demandé
    if (caseId) {
      query = query.eq('case_id', caseId);
    }

    query = query
      .order('signed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: signatures, error } = await query;

    if (error) {
      console.error('❌ Erreur récupération signatures:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des signatures'
      }, { status: 500 });
    }

    // Formater les données pour l'interface agent
    const formattedSignatures = signatures?.map(sig => ({
      id: sig.id,
      signatureData: sig.signature_data,
      signedAt: sig.signed_at,
      isValid: sig.is_valid,
      ipAddress: sig.ip_address,
      userAgent: sig.user_agent,
      validatedAt: null,
      validatedBy: null,
      case: {
        id: sig.insurance_cases.id,
        caseNumber: sig.insurance_cases.case_number,
        status: sig.insurance_cases.status,
        secureToken: sig.insurance_cases.secure_token,
        insuranceCompany: sig.insurance_cases.insurance_company,
        insuranceType: sig.insurance_cases.policy_type,
        policyNumber: sig.insurance_cases.policy_number,
        createdAt: sig.insurance_cases.created_at,
        completedAt: sig.insurance_cases.completed_at,
        client: {
          id: sig.insurance_cases.clients.id,
          firstName: sig.insurance_cases.clients.users.first_name,
          lastName: sig.insurance_cases.clients.users.last_name,
          email: sig.insurance_cases.clients.users.email,
          phone: sig.insurance_cases.clients.users.phone
        }
      }
    })) || [];

    console.log(`✅ ${formattedSignatures.length} signatures récupérées`);

    return NextResponse.json({
      success: true,
      signatures: formattedSignatures,
      count: formattedSignatures.length,
      hasMore: formattedSignatures.length === limit
    });

  } catch (error) {
    console.error('❌ Erreur API signatures agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { signatureId, action, notes, agentId } = await request.json();

    console.log('🔄 Validation signature:', { signatureId, action, agentId });

    if (!signatureId || !action || !agentId) {
      return NextResponse.json({
        success: false,
        error: 'signatureId, action et agentId requis'
      }, { status: 400 });
    }

    if (!['validate', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Action doit être "validate" ou "reject"'
      }, { status: 400 });
    }

    const validationStatus = action === 'validate' ? 'validated' : 'rejected';
    const now = new Date().toISOString();

    // Mettre à jour la signature
    const { data: updatedSignature, error: updateError } = await supabaseAdmin
      .from('signatures')
      .update({
        validation_status: validationStatus,
        validated_at: now,
        validated_by: agentId,
        validation_notes: notes || null,
        updated_at: now
      })
      .eq('id', signatureId)
      .select(`
        id,
        validation_status,
        insurance_cases!inner(
          id,
          case_number,
          clients!inner(
            users!inner(
              first_name,
              last_name,
              email
            )
          )
        )
      `)
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour signature:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la validation de la signature'
      }, { status: 500 });
    }

    // Mettre à jour le statut du dossier si validé
    if (action === 'validate') {
      const { error: caseUpdateError } = await supabaseAdmin
        .from('insurance_cases')
        .update({
          status: 'validated',
          updated_at: now
        })
        .eq('id', updatedSignature.insurance_cases.id);

      if (caseUpdateError) {
        console.error('❌ Erreur mise à jour dossier:', caseUpdateError);
        // Continue quand même, la signature est validée
      }
    }

    // Créer un log d'audit
    await supabaseAdmin
      .from('audit_logs')
      .insert([{
        case_id: updatedSignature.insurance_cases.id,
        action: `signature_${action}d`,
        entity_type: 'signature',
        entity_id: signatureId,
        old_values: { validation_status: 'signed' },
        new_values: { 
          validation_status: validationStatus,
          validated_by: agentId,
          validation_notes: notes
        },
        user_id: agentId,
        created_at: now
      }]);

    console.log(`✅ Signature ${action === 'validate' ? 'validée' : 'rejetée'} avec succès`);

    return NextResponse.json({
      success: true,
      message: `Signature ${action === 'validate' ? 'validée' : 'rejetée'} avec succès`,
      signature: {
        id: updatedSignature.id,
        validationStatus: updatedSignature.validation_status,
        caseNumber: updatedSignature.insurance_cases.case_number,
        clientName: `${updatedSignature.insurance_cases.clients.users.first_name} ${updatedSignature.insurance_cases.clients.users.last_name}`
      }
    });

  } catch (error) {
    console.error('❌ Erreur validation signature:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur lors de la validation'
    }, { status: 500 });
  }
}
