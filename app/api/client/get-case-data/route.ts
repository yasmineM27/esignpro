import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token requis'
      }, { status: 400 });
    }

    console.log('📋 Récupération données dossier pour token:', token);

    // Récupérer le dossier
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('insurance_cases')
      .select(`
        id,
        case_number,
        secure_token,
        status,
        insurance_company,
        policy_number,
        clients!inner(
          id,
          users!inner(
            id,
            first_name,
            last_name,
            email,
            phone
          )
        )
      `)
      .eq('secure_token', token)
      .single();

    if (caseError || !caseData) {
      console.error('❌ Erreur récupération dossier:', caseError);
      return NextResponse.json({
        success: false,
        error: 'Dossier non trouvé'
      }, { status: 404 });
    }

    // Extraire les données du client
    const client = caseData.clients;
    const user = client.users;

    console.log('✅ Données récupérées:', {
      caseNumber: caseData.case_number,
      firstName: user.first_name,
      lastName: user.last_name
    });

    return NextResponse.json({
      success: true,
      caseNumber: caseData.case_number,
      status: caseData.status,
      insuranceCompany: caseData.insurance_company,
      policyNumber: caseData.policy_number,
      client: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('❌ Erreur API get-case-data:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

