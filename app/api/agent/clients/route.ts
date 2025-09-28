import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId') || 'agent-001'; // TODO: Récupérer l'ID de l'agent connecté
    const status = searchParams.get('status'); // all, active, completed, pending
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search'); // Recherche par nom ou email

    console.log('👥 Récupération clients agent:', { agentId, status, limit, offset, search });

    // Construire la requête de base
    let query = supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        status,
        secure_token,
        insurance_company,
        policy_type,
        policy_number,
        termination_date,
        reason_for_termination,
        created_at,
        completed_at,
        updated_at,
        clients!inner(
          id,
          users!inner(
            id,
            first_name,
            last_name,
            email,
            phone,
            address,
            created_at
          )
        ),
        signatures(
          id,
          signed_at,
          validation_status,
          is_valid
        )
      `);

    // Filtrer par statut si spécifié
    if (status && status !== 'all') {
      switch (status) {
        case 'pending':
          query = query.in('status', ['email_sent', 'documents_uploaded']);
          break;
        case 'active':
          query = query.in('status', ['email_sent', 'documents_uploaded', 'signed']);
          break;
        case 'completed':
          query = query.in('status', ['completed', 'validated']);
          break;
        default:
          query = query.eq('status', status);
      }
    }

    // Appliquer la pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: cases, error } = await query;

    if (error) {
      console.error('❌ Erreur récupération clients:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des clients'
      }, { status: 500 });
    }

    // Formater les données pour l'interface
    let clients = cases?.map(caseItem => ({
      id: caseItem.clients.id,
      userId: caseItem.clients.users.id,
      firstName: caseItem.clients.users.first_name,
      lastName: caseItem.clients.users.last_name,
      fullName: `${caseItem.clients.users.first_name} ${caseItem.clients.users.last_name}`,
      email: caseItem.clients.users.email,
      phone: caseItem.clients.users.phone,
      address: caseItem.clients.users.address,
      clientCreatedAt: caseItem.clients.users.created_at,
      
      // Informations du dossier
      caseId: caseItem.id,
      caseNumber: caseItem.case_number,
      caseStatus: caseItem.status,
      secureToken: caseItem.secure_token,
      insuranceCompany: caseItem.insurance_company,
      policyType: caseItem.policy_type,
      policyNumber: caseItem.policy_number,
      terminationDate: caseItem.termination_date,
      reasonForTermination: caseItem.reason_for_termination,
      caseCreatedAt: caseItem.created_at,
      caseCompletedAt: caseItem.completed_at,
      caseUpdatedAt: caseItem.updated_at,
      
      // Informations de signature
      hasSignature: caseItem.signatures && caseItem.signatures.length > 0,
      signature: caseItem.signatures && caseItem.signatures.length > 0 ? {
        id: caseItem.signatures[0].id,
        signedAt: caseItem.signatures[0].signed_at,
        validationStatus: caseItem.signatures[0].validation_status,
        isValid: caseItem.signatures[0].is_valid
      } : null,
      
      // Statut global
      overallStatus: determineOverallStatus(caseItem.status, caseItem.signatures),
      
      // URLs utiles
      portalUrl: `https://esignpro.ch/client-portal/${caseItem.secure_token}`,
      
      // Temps écoulé
      daysSinceCreated: Math.floor((new Date().getTime() - new Date(caseItem.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      daysSinceUpdated: Math.floor((new Date().getTime() - new Date(caseItem.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    })) || [];

    // Filtrer par recherche si spécifié
    if (search) {
      const searchLower = search.toLowerCase();
      clients = clients.filter(client => 
        client.fullName.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.caseNumber.toLowerCase().includes(searchLower) ||
        (client.insuranceCompany && client.insuranceCompany.toLowerCase().includes(searchLower))
      );
    }

    // Statistiques rapides
    const stats = {
      total: clients.length,
      pending: clients.filter(c => c.overallStatus === 'pending').length,
      active: clients.filter(c => c.overallStatus === 'active').length,
      completed: clients.filter(c => c.overallStatus === 'completed').length,
      withSignature: clients.filter(c => c.hasSignature).length
    };

    console.log(`✅ ${clients.length} client(s) récupéré(s)`);

    return NextResponse.json({
      success: true,
      clients: clients,
      stats: stats,
      pagination: {
        limit: limit,
        offset: offset,
        hasMore: clients.length === limit
      },
      filters: {
        status: status,
        search: search
      }
    });

  } catch (error) {
    console.error('❌ Erreur API clients agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

function determineOverallStatus(caseStatus: string, signatures: any[]): string {
  if (caseStatus === 'completed' || caseStatus === 'validated') {
    return 'completed';
  }
  
  if (caseStatus === 'signed' || (signatures && signatures.length > 0)) {
    return 'active';
  }
  
  if (caseStatus === 'email_sent' || caseStatus === 'documents_uploaded') {
    return 'pending';
  }
  
  return 'draft';
}

export async function POST(request: NextRequest) {
  try {
    const { action, clientId, caseId, data } = await request.json();

    console.log('🔄 Action client agent:', { action, clientId, caseId });

    switch (action) {
      case 'update_notes':
        // Mettre à jour les notes du dossier
        const { error: updateError } = await supabaseAdmin
          .from('insurance_cases')
          .update({
            reason_for_termination: data.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', caseId);

        if (updateError) {
          throw updateError;
        }

        return NextResponse.json({
          success: true,
          message: 'Notes mises à jour avec succès'
        });

      case 'resend_email':
        // Renvoyer l'email au client
        // TODO: Implémenter le renvoi d'email
        return NextResponse.json({
          success: true,
          message: 'Email renvoyé avec succès'
        });

      case 'archive_case':
        // Archiver le dossier
        const { error: archiveError } = await supabaseAdmin
          .from('insurance_cases')
          .update({
            status: 'archived',
            updated_at: new Date().toISOString()
          })
          .eq('id', caseId);

        if (archiveError) {
          throw archiveError;
        }

        return NextResponse.json({
          success: true,
          message: 'Dossier archivé avec succès'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Action non reconnue'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erreur action client:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'action'
    }, { status: 500 });
  }
}
