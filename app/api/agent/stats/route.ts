import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId') || 'agent-001'; // TODO: Récupérer l'ID de l'agent connecté
    const period = searchParams.get('period') || '30'; // Période en jours

    console.log('📊 Récupération statistiques agent:', { agentId, period });

    const periodDays = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Statistiques générales
    const { data: totalCases, error: totalError } = await supabaseAdmin
      .from('insurance_cases')
      .select('id, status, created_at, completed_at')
      .gte('created_at', startDate.toISOString());

    if (totalError) {
      console.error('❌ Erreur récupération dossiers:', totalError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      }, { status: 500 });
    }

    // Statistiques des signatures
    const { data: signatures, error: signaturesError } = await supabaseAdmin
      .from('signatures')
      .select(`
        id,
        signed_at,
        validation_status,
        insurance_cases!inner(
          id,
          created_at,
          status
        )
      `)
      .gte('signed_at', startDate.toISOString());

    if (signaturesError) {
      console.error('❌ Erreur récupération signatures:', signaturesError);
      // Continue sans les signatures
    }

    // Statistiques des emails
    const { data: emails, error: emailsError } = await supabaseAdmin
      .from('email_logs')
      .select('id, status, email_type, created_at, sent_at')
      .gte('created_at', startDate.toISOString());

    if (emailsError) {
      console.error('❌ Erreur récupération emails:', emailsError);
      // Continue sans les emails
    }

    // Calculer les statistiques
    const stats = {
      // Dossiers
      totalCases: totalCases?.length || 0,
      newCases: totalCases?.filter(c => {
        const createdDate = new Date(c.created_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return createdDate >= today;
      }).length || 0,
      
      // Statuts des dossiers
      casesByStatus: {
        draft: totalCases?.filter(c => c.status === 'draft').length || 0,
        email_sent: totalCases?.filter(c => c.status === 'email_sent').length || 0,
        documents_uploaded: totalCases?.filter(c => c.status === 'documents_uploaded').length || 0,
        signed: totalCases?.filter(c => c.status === 'signed').length || 0,
        completed: totalCases?.filter(c => c.status === 'completed').length || 0,
        validated: totalCases?.filter(c => c.status === 'validated').length || 0
      },

      // Signatures
      totalSignatures: signatures?.length || 0,
      signaturesValidated: signatures?.filter(s => s.validation_status === 'validated').length || 0,
      signaturesPending: signatures?.filter(s => s.validation_status === 'signed').length || 0,
      signaturesRejected: signatures?.filter(s => s.validation_status === 'rejected').length || 0,

      // Emails
      totalEmails: emails?.length || 0,
      emailsSent: emails?.filter(e => e.status === 'sent').length || 0,
      emailsPending: emails?.filter(e => e.status === 'pending').length || 0,
      emailsFailed: emails?.filter(e => e.status === 'failed').length || 0,

      // Taux de conversion
      conversionRate: totalCases?.length > 0 
        ? Math.round((signatures?.length || 0) / totalCases.length * 100) 
        : 0,
      
      completionRate: totalCases?.length > 0 
        ? Math.round((totalCases.filter(c => c.status === 'completed').length) / totalCases.length * 100) 
        : 0,

      // Temps moyen de traitement
      averageProcessingTime: calculateAverageProcessingTime(totalCases || []),

      // Activité récente (7 derniers jours)
      recentActivity: calculateRecentActivity(totalCases || [], signatures || [], emails || [])
    };

    console.log(`✅ Statistiques calculées pour ${periodDays} jours`);

    return NextResponse.json({
      success: true,
      stats: stats,
      period: periodDays,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur API statistiques agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

function calculateAverageProcessingTime(cases: any[]): number {
  const completedCases = cases.filter(c => c.completed_at && c.created_at);
  
  if (completedCases.length === 0) return 0;

  const totalTime = completedCases.reduce((sum, c) => {
    const created = new Date(c.created_at);
    const completed = new Date(c.completed_at);
    return sum + (completed.getTime() - created.getTime());
  }, 0);

  // Retourner en heures
  return Math.round(totalTime / completedCases.length / (1000 * 60 * 60));
}

function calculateRecentActivity(cases: any[], signatures: any[], emails: any[]): any[] {
  const activity = [];
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayCases = cases.filter(c => {
      const createdDate = new Date(c.created_at);
      return createdDate >= date && createdDate < nextDate;
    }).length;

    const daySignatures = signatures.filter(s => {
      const signedDate = new Date(s.signed_at);
      return signedDate >= date && signedDate < nextDate;
    }).length;

    const dayEmails = emails.filter(e => {
      const emailDate = new Date(e.created_at);
      return emailDate >= date && emailDate < nextDate;
    }).length;

    activity.push({
      date: date.toISOString().split('T')[0],
      cases: dayCases,
      signatures: daySignatures,
      emails: dayEmails
    });
  }

  return activity;
}
