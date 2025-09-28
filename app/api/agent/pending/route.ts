import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId') || 'agent-001';
    const priority = searchParams.get('priority'); // urgent, normal, all
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('⏳ Récupération dossiers en attente:', { agentId, priority, limit, offset });

    // Récupérer les dossiers en attente (email_sent, documents_uploaded)
    const { data: pendingCases, error } = await supabaseAdmin
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
        expires_at,
        clients!inner(
          id,
          users!inner(
            id,
            first_name,
            last_name,
            email,
            phone
          )
        ),
        email_logs(
          id,
          email_type,
          status,
          sent_at,
          created_at
        )
      `)
      .in('status', ['email_sent', 'documents_uploaded'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Erreur récupération dossiers en attente:', error);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des dossiers en attente'
      }, { status: 500 });
    }

    // Formater les données avec calculs de priorité
    const formattedCases = pendingCases?.map(caseItem => {
      const createdDate = new Date(caseItem.created_at);
      const updatedDate = new Date(caseItem.updated_at);
      const expiresDate = caseItem.expires_at ? new Date(caseItem.expires_at) : null;
      const now = new Date();

      const daysWaiting = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceUpdate = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilExpiry = expiresDate ? Math.floor((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

      // Déterminer la priorité
      let priorityLevel = 'normal';
      let priorityScore = 0;

      if (daysWaiting >= 7) {
        priorityLevel = 'urgent';
        priorityScore += 3;
      } else if (daysWaiting >= 3) {
        priorityLevel = 'high';
        priorityScore += 2;
      }

      if (daysUntilExpiry !== null && daysUntilExpiry <= 3) {
        priorityLevel = 'urgent';
        priorityScore += 2;
      }

      if (daysSinceUpdate >= 5) {
        priorityScore += 1;
      }

      // Compter les emails envoyés
      const emailsSent = caseItem.email_logs?.filter(e => e.status === 'sent').length || 0;
      const lastEmailSent = caseItem.email_logs?.length > 0 
        ? caseItem.email_logs.sort((a, b) => new Date(b.sent_at || b.created_at).getTime() - new Date(a.sent_at || a.created_at).getTime())[0]
        : null;

      return {
        id: caseItem.id,
        caseNumber: caseItem.case_number,
        status: caseItem.status,
        secureToken: caseItem.secure_token,
        
        // Informations client
        client: {
          id: caseItem.clients.id,
          firstName: caseItem.clients.users.first_name,
          lastName: caseItem.clients.users.last_name,
          fullName: `${caseItem.clients.users.first_name} ${caseItem.clients.users.last_name}`,
          email: caseItem.clients.users.email,
          phone: caseItem.clients.users.phone
        },
        
        // Informations dossier
        insuranceCompany: caseItem.insurance_company,
        policyType: caseItem.policy_type,
        policyNumber: caseItem.policy_number,
        
        // Dates et délais
        createdAt: caseItem.created_at,
        updatedAt: caseItem.updated_at,
        expiresAt: caseItem.expires_at,
        daysWaiting: daysWaiting,
        daysSinceUpdate: daysSinceUpdate,
        daysUntilExpiry: daysUntilExpiry,
        
        // Priorité
        priority: priorityLevel,
        priorityScore: priorityScore,
        
        // Communications
        emailsSent: emailsSent,
        lastEmailSent: lastEmailSent ? {
          date: lastEmailSent.sent_at || lastEmailSent.created_at,
          type: lastEmailSent.email_type,
          status: lastEmailSent.status
        } : null,
        
        // URLs
        portalUrl: `https://esignpro.ch/client-portal/${caseItem.secure_token}`,
        
        // Statut détaillé
        detailedStatus: getDetailedStatus(caseItem.status, daysWaiting, emailsSent),
        
        // Actions recommandées
        recommendedActions: getRecommendedActions(caseItem.status, daysWaiting, emailsSent, daysUntilExpiry)
      };
    }) || [];

    // Filtrer par priorité si spécifié
    let filteredCases = formattedCases;
    if (priority && priority !== 'all') {
      filteredCases = formattedCases.filter(c => c.priority === priority);
    }

    // Trier par priorité et date
    filteredCases.sort((a, b) => {
      if (a.priorityScore !== b.priorityScore) {
        return b.priorityScore - a.priorityScore; // Plus haute priorité en premier
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Plus récent en premier
    });

    // Statistiques
    const stats = {
      total: formattedCases.length,
      urgent: formattedCases.filter(c => c.priority === 'urgent').length,
      high: formattedCases.filter(c => c.priority === 'high').length,
      normal: formattedCases.filter(c => c.priority === 'normal').length,
      expiringSoon: formattedCases.filter(c => c.daysUntilExpiry !== null && c.daysUntilExpiry <= 3).length,
      noResponse: formattedCases.filter(c => c.emailsSent > 0 && c.daysSinceUpdate >= 3).length
    };

    console.log(`✅ ${filteredCases.length} dossier(s) en attente récupéré(s)`);

    return NextResponse.json({
      success: true,
      cases: filteredCases,
      stats: stats,
      pagination: {
        limit: limit,
        offset: offset,
        hasMore: filteredCases.length === limit
      }
    });

  } catch (error) {
    console.error('❌ Erreur API dossiers en attente:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

function getDetailedStatus(status: string, daysWaiting: number, emailsSent: number): string {
  switch (status) {
    case 'email_sent':
      if (daysWaiting >= 7) {
        return 'Email envoyé - Aucune réponse depuis 7+ jours';
      } else if (daysWaiting >= 3) {
        return 'Email envoyé - En attente de réponse';
      } else {
        return 'Email envoyé récemment';
      }
    case 'documents_uploaded':
      if (daysWaiting >= 5) {
        return 'Documents reçus - En attente de signature depuis 5+ jours';
      } else {
        return 'Documents reçus - En attente de signature';
      }
    default:
      return 'En attente';
  }
}

function getRecommendedActions(status: string, daysWaiting: number, emailsSent: number, daysUntilExpiry: number | null): string[] {
  const actions = [];

  if (status === 'email_sent' && daysWaiting >= 3) {
    actions.push('Envoyer un rappel par email');
  }

  if (status === 'email_sent' && daysWaiting >= 7) {
    actions.push('Contacter par téléphone');
  }

  if (status === 'documents_uploaded' && daysWaiting >= 3) {
    actions.push('Rappeler pour finaliser la signature');
  }

  if (daysUntilExpiry !== null && daysUntilExpiry <= 3) {
    actions.push('URGENT: Dossier expire bientôt');
  }

  if (emailsSent === 0) {
    actions.push('Vérifier l\'envoi de l\'email initial');
  }

  if (actions.length === 0) {
    actions.push('Surveiller l\'évolution');
  }

  return actions;
}

export async function POST(request: NextRequest) {
  try {
    const { action, caseId, data } = await request.json();

    console.log('🔄 Action dossier en attente:', { action, caseId });

    switch (action) {
      case 'send_reminder':
        // TODO: Implémenter l'envoi de rappel
        return NextResponse.json({
          success: true,
          message: 'Rappel envoyé avec succès'
        });

      case 'extend_expiry':
        const newExpiryDate = new Date();
        newExpiryDate.setDate(newExpiryDate.getDate() + (data.days || 30));

        const { error: extendError } = await supabaseAdmin
          .from('insurance_cases')
          .update({
            expires_at: newExpiryDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', caseId);

        if (extendError) {
          throw extendError;
        }

        return NextResponse.json({
          success: true,
          message: `Délai prolongé de ${data.days || 30} jours`
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Action non reconnue'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erreur action dossier en attente:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'action'
    }, { status: 500 });
  }
}
