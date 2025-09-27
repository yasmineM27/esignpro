require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMissingToken() {
  const token = 'SECURE_1758976792815_d0kq0bd';
  
  console.log('🔧 CRÉATION DU TOKEN MANQUANT');
  console.log('==============================');
  console.log('Token:', token);
  console.log('');

  try {
    // 1. Vérifier si le token existe déjà
    const { data: existing } = await supabase
      .from('insurance_cases')
      .select('id, case_number')
      .eq('secure_token', token)
      .single();

    if (existing) {
      console.log('✅ Token existe déjà:', existing.case_number);
      return;
    }

    // 2. Utiliser l'agent existant
    const agentId = '1c81db49-e968-41de-93df-f3bffaa7bd5b'; // Agent ADMIN001 existant

    // 3. Créer le dossier avec ce token
    const { data: newCase, error: caseError } = await supabase
      .from('insurance_cases')
      .insert([{
        id: '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
        case_number: 'RES-2024-003',
        secure_token: token,
        client_id: '22222222-3333-4444-5555-666666666667',
        agent_id: agentId,
        status: 'email_sent',
        insurance_company: 'AXA Assurances',
        policy_number: 'POL-2024-003',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (caseError) {
      console.error('❌ Erreur création dossier:', caseError);
      return;
    }

    console.log('✅ Dossier créé:', newCase.case_number);
    console.log('✅ Token:', newCase.secure_token);
    console.log('✅ Statut:', newCase.status);
    console.log('');

    // 4. Créer un log d'audit
    await supabase
      .from('audit_logs')
      .insert([{
        case_id: newCase.id,
        action: 'case_created',
        entity_type: 'insurance_case',
        entity_id: newCase.id,
        new_values: {
          case_number: newCase.case_number,
          secure_token: newCase.secure_token,
          status: 'email_sent'
        },
        created_at: new Date().toISOString()
      }]);

    console.log('🎉 TOKEN CRÉÉ AVEC SUCCÈS !');
    console.log('');
    console.log('🌐 URL de test:');
    console.log('Local:', `http://localhost:3000/client-portal/${token}`);
    console.log('Production:', `https://esignpro.ch/client-portal/${token}`);
    console.log('');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

createMissingToken();
